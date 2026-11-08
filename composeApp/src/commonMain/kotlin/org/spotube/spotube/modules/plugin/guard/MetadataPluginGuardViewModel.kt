package org.spotube.spotube.modules.plugin.guard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import org.spotube.spotube.core.navigation.NavigationCommands
import org.spotube.spotube.core.navigation.Routes
import org.spotube.spotube.modules.library.LibraryState
import org.spotube.spotube.modules.library.LibraryTab
import org.spotube.spotube.modules.plugin.PluginAbility
import org.spotube.spotube.modules.plugin.PluginManager
import org.spotube.spotube.modules.plugin.PluginManagerStates
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface MetadataPluginGuardState {
    data object Loading : MetadataPluginGuardState
    data object Available : MetadataPluginGuardState

    /** No metadata plugin is selected. [hasInstalledPlugins] tells whether the user only needs
     * to pick one (true) or has to install one first (false). */
    data class Missing(val hasInstalledPlugins: Boolean) : MetadataPluginGuardState
}

class MetadataPluginGuardViewModel(
    val pluginManager: PluginManager,
    private val navigationCommands: NavigationCommands,
    private val libraryState: LibraryState
) : ViewModel() {
    private val _isSettingUp = MutableStateFlow(false)
    val isSettingUp: StateFlow<Boolean> = _isSettingUp.asStateFlow()

    val uiState: StateFlow<MetadataPluginGuardState> = pluginManager.state
        .map { state ->
            when (state) {
                is PluginManagerStates.Loading -> MetadataPluginGuardState.Loading
                is PluginManagerStates.Data ->
                    if (PluginAbility.METADATA in state.selectedPlugins) {
                        MetadataPluginGuardState.Available
                    } else {
                        MetadataPluginGuardState.Missing(
                            hasInstalledPlugins = state.plugins.any { PluginAbility.METADATA in it.abilities })
                    }
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = MetadataPluginGuardState.Loading)

    fun startAutoSetup() {
        if (_isSettingUp.value) return
        viewModelScope.launch {
            _isSettingUp.value = true
            try {
                pluginManager.autoSetupDefaultMetadataPlugin()
                val metaService = pluginManager.selectedMetadataPlugin.value
                metaService?.use {
                    if (coreAPI.requiresAuthentication) {
                        coreAPI.login()
                    }
                }
            } catch (e: Exception) {
                openPlugins()
            } finally {
                _isSettingUp.value = false
            }
        }
    }

    fun selectFirstMetadataPlugin() {
        val currentState = pluginManager.state.value
        if (currentState is PluginManagerStates.Data) {
            val metadataPlugin = currentState.plugins.firstOrNull { PluginAbility.METADATA in it.abilities }
            if (metadataPlugin != null) {
                pluginManager.setSelectedPlugin(PluginAbility.METADATA, metadataPlugin)
            } else {
                startAutoSetup()
            }
        }
    }

    fun openPlugins() {
        navigationCommands.navigateTo(Routes.Plugins)
    }

    /** Local tracks are a plugin-free player, so offer them as the way forward. */
    fun openLocalTracks() {
        libraryState.onTabSelected(LibraryTab.LocalTracks)
        navigationCommands.navigateTo(Routes.Library)
    }
}
