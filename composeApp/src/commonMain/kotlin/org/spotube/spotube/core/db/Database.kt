/*
 * Copyright (C) 2026 Kingkor Roy Tirtho and Spotube Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package org.spotube.spotube.core.db

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import org.spotube.spotube.core.paths.Paths
import okio.FileSystem
import okio.Path.Companion.toPath
import okio.SYSTEM

@Suppress("EXPECT_ACTUAL_CLASSIFIERS_ARE_IN_BETA_WARNING")
class Database(val paths: Paths) {
    init {
        restoreIfCleanInstall()
    }

    private fun restoreIfCleanInstall() {
        runCatching {
            val dataDirPath = paths.getApplicationDataDirPath().toPath()
            val backupDirPath = "${paths.getUserDownloadsDirPath()}/.backup".toPath()
            if (!FileSystem.SYSTEM.exists(backupDirPath)) return@runCatching

            val probePlugins = dataDirPath / "spotube_plugins.preferences_pb"
            val probeSettings = dataDirPath / "spotube.preferences_pb"
            val hasExistingData = (FileSystem.SYSTEM.exists(probePlugins) && (FileSystem.SYSTEM.metadataOrNull(probePlugins)?.size ?: 0L) > 0L) ||
                (FileSystem.SYSTEM.exists(probeSettings) && (FileSystem.SYSTEM.metadataOrNull(probeSettings)?.size ?: 0L) > 0L)

            if (!hasExistingData) {
                if (!FileSystem.SYSTEM.exists(dataDirPath)) {
                    FileSystem.SYSTEM.createDirectories(dataDirPath)
                }
                FileSystem.SYSTEM.list(backupDirPath).forEach { backupFile ->
                    if (backupFile.name.endsWith(".preferences_pb") || backupFile.name.endsWith(".json")) {
                        val target = dataDirPath / backupFile.name
                        FileSystem.SYSTEM.copy(backupFile, target)
                    }
                }
            }
        }
    }

    fun backupPreferences() {
        runCatching {
            val dataDirPath = paths.getApplicationDataDirPath().toPath()
            val backupDirPath = "${paths.getUserDownloadsDirPath()}/.backup".toPath()
            if (!FileSystem.SYSTEM.exists(backupDirPath)) {
                FileSystem.SYSTEM.createDirectories(backupDirPath)
            }
            if (FileSystem.SYSTEM.exists(dataDirPath)) {
                FileSystem.SYSTEM.list(dataDirPath).forEach { file ->
                    if (file.name.endsWith(".preferences_pb") || file.name.endsWith(".json")) {
                        val dest = backupDirPath / file.name
                        if (FileSystem.SYSTEM.exists(dest)) {
                            FileSystem.SYSTEM.delete(dest)
                        }
                        FileSystem.SYSTEM.copy(file, dest)
                    }
                }
            }
        }
    }

    /**
     * True when Spotube had already written its own data before this process started. Captured
     * synchronously at construction time — the earliest point, before any eager service can
     * create a fresh store — so it reliably tells a brand-new install apart from an upgrade of
     * an existing one (used to skip the first-run onboarding on upgrades).
     */
    val isExistingInstall: Boolean = runCatching {
        val dataDirPath = paths.getApplicationDataDirPath()
        EXISTING_INSTALL_PROBE_FILES.any { fileName ->
            FileSystem.SYSTEM.exists("$dataDirPath/$fileName".toPath())
        }
    }.getOrDefault(false)

    val settingsDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube.preferences_pb".toPath() }
        )
    }
    val pluginsDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_plugins.preferences_pb".toPath() }
        )
    }

    val matchedTracksDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_matched_tracks.preferences_pb".toPath() }
        )
    }

    val audioPlayerQueueDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_audio_player_queue.preferences_pb".toPath() }
        )
    }

    val localMediaDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_local_media.preferences_pb".toPath() }
        )
    }

    val blacklistDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_blacklist.preferences_pb".toPath() }
        )
    }

    val windowStateDataStore: DataStore<Preferences> by lazy {
        PreferenceDataStoreFactory.createWithPath(
            produceFile = { "${paths.getApplicationDataDirPath()}/spotube_window.preferences_pb".toPath() }
        )
    }

    private companion object {
        /** Preference files written by previous launches; their presence means an upgrade. */
        val EXISTING_INSTALL_PROBE_FILES = listOf(
            "spotube.preferences_pb",
            "spotube_plugins.preferences_pb",
            "spotube_matched_tracks.preferences_pb",
            "spotube_audio_player_queue.preferences_pb",
            "spotube_local_media.preferences_pb",
            "spotube_blacklist.preferences_pb",
            "spotube_cookies.preferences_pb")
    }
}

object DatabaseKeys {
    val PLUGINS_STATE_KEY = stringPreferencesKey("plugins_state")
    val AUDIO_PLAYER_QUEUE_STATE_KEY = stringPreferencesKey("audio_player_queue_state")
    val LOCAL_MEDIA_CACHE_STATE_KEY = stringPreferencesKey("local_media_cache_state")
    val LOCAL_MEDIA_LAST_SCAN_AT_KEY = longPreferencesKey("local_media_last_scan_at")
    val WINDOW_STATE_KEY = stringPreferencesKey("window_state")
}
