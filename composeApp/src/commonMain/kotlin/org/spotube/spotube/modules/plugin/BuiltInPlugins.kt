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

package org.spotube.spotube.modules.plugin

import org.jetbrains.compose.resources.DrawableResource
import spotube.composeapp.generated.resources.Res
import spotube.composeapp.generated.resources.plugin_logo_lrclib
import spotube.composeapp.generated.resources.plugin_logo_newpipe

val NEWPIPE_YOUTUBE_BUILT_IN_PLUGIN = PluginEntry(
    name = "NewPipe YouTube",
    version = "0.1.0",
    apiVersion = PLUGIN_API_VERSION,
    description = "Plugin NewPipe para reproducao direta de audio.",
    author = "Montanha Team",
    capabilities = listOf(
        PluginCapability.NETWORK_REQUESTS,
        PluginCapability.PERSISTENT_STORAGE
    ),
    abilities = listOf(PluginAbility.AUDIO),
    contact = "",
    repository = "",
    bugs = "",
    license = "")
val LRCLIB_BUILT_IN_PLUGIN = PluginEntry(
    name = "LRCLib Lyrics",
    version = "0.1.0",
    apiVersion = PLUGIN_API_VERSION,
    description = "LRCLib Lyrics plugin for fetching lyrics.",
    author = "Montanha Team",
    capabilities = listOf(
        PluginCapability.NETWORK_REQUESTS),
    abilities = listOf(PluginAbility.LYRICS),
    contact = "",
    repository = "",
    bugs = "",
    license = "")
val BUILT_IN_PLUGINS = listOf(
    NEWPIPE_YOUTUBE_BUILT_IN_PLUGIN,
    LRCLIB_BUILT_IN_PLUGIN)

fun isBuiltInPluginEntry(plugin: PluginEntry): Boolean =
    BUILT_IN_PLUGINS.any { it.name.equals(plugin.name, ignoreCase = true) || it.id == plugin.id }

fun resolveBuiltInPlugin(pluginOrId: Any): PluginEntry? = when (pluginOrId) {
    is PluginEntry -> BUILT_IN_PLUGINS.firstOrNull { it.name.equals(pluginOrId.name, ignoreCase = true) || it.id == pluginOrId.id }
    is String -> BUILT_IN_PLUGINS.firstOrNull { it.id == pluginOrId || it.name.equals(pluginOrId, ignoreCase = true) || pluginOrId.startsWith(it.name + "@") }
    else -> null
}

/**
 * The bundled placeholder logo for a built-in plugin, or `null` if it has none.
 *
 * Built-in plugins are not installed to disk, so they have no `logo.png`; these
 * resources (in `composeResources/drawable`) stand in as their logos.
 */
fun builtInPluginLogo(plugin: PluginEntry): DrawableResource? = when {
    plugin.name.contains("NewPipe", ignoreCase = true) -> Res.drawable.plugin_logo_newpipe
    plugin.name.contains("LRCLib", ignoreCase = true) -> Res.drawable.plugin_logo_lrclib
    else -> null
}
