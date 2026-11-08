/*
 * Copyright (C) 2026 Montanha Music Lab
 *
 * Persistent Backup & Restore Engine
 * Preserves user logins, credentials, plugin states, and downloaded plugins
 * across app updates, reinstalls, and uninstalls.
 */

package org.spotube.spotube.core.backup

import android.content.Context
import android.os.Environment
import android.util.Log
import java.io.File

object MontanhaBackupManager {
    private const val TAG = "MontanhaBackup"

    /**
     * Resolves all persistent public directories on the device that survive uninstallation.
     */
    fun getBackupDirs(): List<File> {
        val dirs = mutableListOf<File>()
        try {
            val downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (downloadDir != null) {
                dirs.add(File(downloadDir, "Montanha Music Lab/.backup"))
                dirs.add(File(downloadDir, "MontanhaMusicLab_Backup"))
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error resolving Downloads dir: ${e.message}")
        }
        try {
            val docsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            if (docsDir != null) {
                dirs.add(File(docsDir, "Montanha Music Lab/.backup"))
                dirs.add(File(docsDir, "MontanhaMusicLab_Backup"))
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error resolving Documents dir: ${e.message}")
        }
        return dirs
    }

    /**
     * Called synchronously in Application.onCreate() before Koin or Database initializes.
     * If internal app data is missing (clean install or reinstall after uninstall),
     * silently restores all preferences, plugins, and credentials from external storage.
     */
    fun restoreIfCleanInstall(context: Context) {
        try {
            val internalFilesDir = context.filesDir ?: return
            val probePlugins = File(internalFilesDir, "spotube_plugins.preferences_pb")
            val probeSettings = File(internalFilesDir, "spotube.preferences_pb")

            // If existing data is already present, do not overwrite
            if (probePlugins.exists() && probePlugins.length() > 0 && probeSettings.exists() && probeSettings.length() > 0) {
                Log.i(TAG, "Existing app data detected in filesDir, skipping restore.")
                return
            }

            Log.i(TAG, "Clean install detected. Searching for persistent backup across storage...")
            for (backupDir in getBackupDirs()) {
                if (backupDir.exists() && backupDir.isDirectory) {
                    val backupProbe = File(backupDir, "spotube_plugins.preferences_pb")
                    if (backupProbe.exists() && backupProbe.length() > 0) {
                        Log.i(TAG, "Found persistent Montanha backup at ${backupDir.absolutePath}! Restoring user data...")
                        copyDirectoryContents(backupDir, internalFilesDir)
                        Log.i(TAG, "Restoration complete! All user credentials and plugins recovered.")
                        return
                    }
                }
            }
            Log.i(TAG, "No prior backup found. Starting fresh onboarding.")
        } catch (e: Exception) {
            Log.e(TAG, "Error during restoreIfCleanInstall: ${e.message}", e)
        }
    }

    /**
     * Synchronously or asynchronously mirrors all preference files and plugins
     * to persistent external storage.
     */
    fun backupUserData(context: Context) {
        try {
            val internalFilesDir = context.filesDir ?: return
            val probePlugins = File(internalFilesDir, "spotube_plugins.preferences_pb")
            val probeSettings = File(internalFilesDir, "spotube.preferences_pb")

            // Nothing to back up yet if user hasn't configured anything
            if (!probePlugins.exists() && !probeSettings.exists()) {
                return
            }

            for (backupDir in getBackupDirs()) {
                try {
                    if (!backupDir.exists()) {
                        backupDir.mkdirs()
                    }
                    if (backupDir.exists()) {
                        internalFilesDir.listFiles()?.forEach { file ->
                            if (file.isFile && (file.name.endsWith(".preferences_pb") || file.name.endsWith(".json"))) {
                                val dest = File(backupDir, file.name)
                                file.copyTo(dest, overwrite = true)
                            } else if (file.isDirectory && file.name == "plugins") {
                                val destPlugins = File(backupDir, "plugins")
                                copyDirectory(file, destPlugins)
                            }
                        }
                        Log.d(TAG, "Backup successfully written to ${backupDir.absolutePath}")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Failed writing to ${backupDir.absolutePath}: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error during backupUserData: ${e.message}", e)
        }
    }

    private fun copyDirectoryContents(sourceDir: File, targetDir: File) {
        if (!targetDir.exists()) targetDir.mkdirs()
        sourceDir.listFiles()?.forEach { file ->
            val targetFile = File(targetDir, file.name)
            if (file.isDirectory) {
                copyDirectory(file, targetFile)
            } else {
                file.copyTo(targetFile, overwrite = true)
            }
        }
    }

    private fun copyDirectory(sourceDir: File, targetDir: File) {
        if (!targetDir.exists()) targetDir.mkdirs()
        sourceDir.listFiles()?.forEach { file ->
            val targetFile = File(targetDir, file.name)
            if (file.isDirectory) {
                copyDirectory(file, targetFile)
            } else {
                file.copyTo(targetFile, overwrite = true)
            }
        }
    }
}
