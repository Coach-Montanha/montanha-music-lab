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

package org.spotube.spotube.modules.plugin.guard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.composeunstyled.Text
import org.spotube.spotube.core.ui.component.ApplicationMainBar
import org.spotube.spotube.core.ui.component.LoginRequiredDisplay
import org.spotube.spotube.modules.plugin.MetadataAuthViewModel
import org.spotube.spotube.core.ui.theming.AppTheme
import org.spotube.spotube.modules.shell.LocalAppShellBottomInset
import org.spotube.spotube.resources.iconsax.Iconsax
import org.spotube.spotube.resources.iconsax.IconsaxPlay
import org.spotube.spotube.resources.iconsax.IconsaxMusicLibrary
import org.koin.compose.viewmodel.koinViewModel
import org.spotube.millennium.composables.MillenniumButton
import org.spotube.millennium.composables.MillenniumButtonStyle
import org.spotube.millennium.composables.MillenniumIcon
import org.spotube.millennium.theme.MillenniumTheme

@Composable
fun MetadataPluginGuard(
    backButton: Boolean = false,
    showTopBar: Boolean = true,
    requireLogin: Boolean = false,
    viewModel: MetadataPluginGuardViewModel = koinViewModel(),
    authViewModel: MetadataAuthViewModel = koinViewModel(),
    content: @Composable () -> Unit
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val isSettingUp by viewModel.isSettingUp.collectAsStateWithLifecycle()

    when (val s = state) {
        is MetadataPluginGuardState.Available ->
            if (requireLogin && authState.loginRequired) {
                Column(Modifier.fillMaxSize().background(MillenniumTheme.colors.background)) {
                    if (showTopBar) ApplicationMainBar(backButton = backButton)
                    Box(
                        Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(bottom = LocalAppShellBottomInset.current),
                        contentAlignment = Alignment.Center) {
                        LoginRequiredDisplay(
                            pluginName = authState.pluginName,
                            onLogin = authViewModel::login,
                            isLoggingIn = authState.isLoggingIn,
                            modifier = Modifier.widthIn(max = 420.dp))
                    }
                }
            } else {
                content()
            }
        is MetadataPluginGuardState.Loading -> Box(
            Modifier.fillMaxSize().background(MillenniumTheme.colors.background))
        is MetadataPluginGuardState.Missing -> NoMetadataPluginScreen(
            hasInstalledPlugins = s.hasInstalledPlugins,
            isSettingUp = isSettingUp,
            backButton = backButton,
            showTopBar = showTopBar,
            onStartSetup = {
                if (s.hasInstalledPlugins) {
                    viewModel.selectFirstMetadataPlugin()
                } else {
                    viewModel.startAutoSetup()
                }
            },
            onOpenPlugins = viewModel::openPlugins,
            onOpenLocalTracks = viewModel::openLocalTracks)
    }
}

@Composable
private fun NoMetadataPluginScreen(
    hasInstalledPlugins: Boolean,
    isSettingUp: Boolean,
    backButton: Boolean,
    showTopBar: Boolean,
    onStartSetup: () -> Unit,
    onOpenPlugins: () -> Unit,
    onOpenLocalTracks: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MillenniumTheme.colors.background)) {
        if (showTopBar) ApplicationMainBar(backButton = backButton)

        Box(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(bottom = LocalAppShellBottomInset.current),
            contentAlignment = Alignment.Center) {
            Column(
                modifier = Modifier
                    .widthIn(max = 420.dp)
                    .padding(vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)) {
                
                HeroBadge()

                Text(
                    text = "É a primeira vez?",
                    style = AppTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = AppTheme.colors.onSurface,
                    textAlign = TextAlign.Center)

                Text(
                    text = "Então clique no botão abaixo para iniciar o Montanha Music Lab e liberar o catálogo de músicas.",
                    style = AppTheme.typography.bodyLarge,
                    color = AppTheme.colors.onSurfaceVariant,
                    textAlign = TextAlign.Center)

                MillenniumButton(
                    onClick = onStartSetup,
                    loading = isSettingUp,
                    style = MillenniumButtonStyle.Primary,
                    modifier = Modifier.fillMaxWidth().height(52.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        MillenniumIcon(
                            Iconsax.IconsaxPlay,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp))
                        Text(
                            if (isSettingUp) "Iniciando o laboratório..."
                            else "Então clique aqui para iniciar",
                            fontWeight = FontWeight.Bold)
                    }
                }

                MillenniumButton(
                    onClick = onOpenLocalTracks,
                    style = MillenniumButtonStyle.Secondary,
                    modifier = Modifier.fillMaxWidth().height(48.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MillenniumIcon(
                            Iconsax.IconsaxMusicLibrary,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp))
                        Text("Ouvir músicas locais do dispositivo")
                    }
                }

                Text(
                    text = "Configuração automática de fábrica",
                    style = AppTheme.typography.labelSmall,
                    color = AppTheme.colors.onSurfaceVariant.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center)
            }
        }
    }
}

@Composable
private fun HeroBadge() {
    val primary = AppTheme.colors.primary
    Box(
        modifier = Modifier
            .size(112.dp)
            .clip(CircleShape)
            .background(Brush.radialGradient(listOf(primary.copy(alpha = 0.25f), primary.copy(alpha = 0f)))),
        contentAlignment = Alignment.Center) {
        Box(
            modifier = Modifier
                .size(76.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(primary.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center) {
            MillenniumIcon(
                Iconsax.IconsaxPlay,
                contentDescription = null,
                modifier = Modifier.size(38.dp),
                tint = primary)
        }
    }
}
