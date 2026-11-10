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

package org.spotube.spotube.core.paths

import net.harawata.appdirs.AppDirsFactory

@Suppress("EXPECT_ACTUAL_CLASSIFIERS_ARE_IN_BETA_WARNING")
actual class Paths {
    actual fun getApplicationCacheDirPath(): String {
        return AppDirsFactory.getInstance().getUserCacheDir("Montanha Music Lab", null, "Montanha Music Lab")
    }

    actual fun getApplicationDataDirPath(): String {
        return AppDirsFactory.getInstance().getUserDataDir("Montanha Music Lab", null, "Montanha Music Lab")
    }

    actual fun getUserDownloadsDirPath(): String {
        val baseDir = AppDirsFactory.getInstance().getUserDownloadsDir("Montanha Music Lab", null, null)
        val sanitized = if (baseDir.contains("Spotube", ignoreCase = true)) {
            baseDir.replace("Spotube", "Montanha Music Lab", ignoreCase = true)
        } else {
            baseDir
        }
        val target = if (!sanitized.endsWith("Montanha Music Lab")) {
            "$sanitized/Montanha Music Lab"
        } else {
            sanitized
        }
        try {
            java.io.File(target).mkdirs()
        } catch (_: Exception) {}
        return target
    }

    actual fun getMusicCacheDirPath(): String {
        return AppDirsFactory.getInstance().getUserCacheDir("Montanha Music Lab", null, "Montanha Music Lab") + "/music_cache"
    }
}
