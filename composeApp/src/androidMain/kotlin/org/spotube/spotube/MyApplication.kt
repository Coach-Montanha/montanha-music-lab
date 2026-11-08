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

package org.spotube.spotube

import android.app.Activity
import android.app.Application
import android.os.Bundle
import org.spotube.spotube.core.backup.MontanhaBackupManager
import org.spotube.spotube.core.di.initKoin
import org.spotube.spotube.core.paths.Paths
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.koin.android.ext.koin.androidContext
import org.koin.core.component.KoinComponent

class MyApplication : Application(), KoinComponent {
    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onCreate() {
        super.onCreate()
        Paths.init(this)

        // Restore persistent user data and plugins if this is a fresh install or reinstall
        MontanhaBackupManager.restoreIfCleanInstall(this)

        initKoin {
            androidContext(this@MyApplication)
        }

        // Register lifecycle listener to auto-sync backup when app state changes
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
            override fun onActivityStarted(activity: Activity) {}
            override fun onActivityResumed(activity: Activity) {
                appScope.launch(Dispatchers.IO) {
                    MontanhaBackupManager.backupUserData(this@MyApplication)
                }
            }
            override fun onActivityPaused(activity: Activity) {
                appScope.launch(Dispatchers.IO) {
                    MontanhaBackupManager.backupUserData(this@MyApplication)
                }
            }
            override fun onActivityStopped(activity: Activity) {
                appScope.launch(Dispatchers.IO) {
                    MontanhaBackupManager.backupUserData(this@MyApplication)
                }
            }
            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            override fun onActivityDestroyed(activity: Activity) {}
        })

        // Periodic backup every 45 seconds while running
        appScope.launch(Dispatchers.IO) {
            while (isActive) {
                delay(45000)
                MontanhaBackupManager.backupUserData(this@MyApplication)
            }
        }
    }

    override fun onTerminate() {
        MontanhaBackupManager.backupUserData(this)
        appScope.cancel()
        super.onTerminate()
    }
}