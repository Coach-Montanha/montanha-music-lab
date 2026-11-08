package org.spotube.spotube.resources.iconsax

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

private var _BrandInstagram: ImageVector? = null
private var _BrandPix: ImageVector? = null
private var _BrandWhatsapp: ImageVector? = null

/** Official Instagram Brand Icon */
val Iconsax.BrandInstagram: ImageVector
    get() {
        if (_BrandInstagram != null) return _BrandInstagram!!
        _BrandInstagram = ImageVector.Builder(
            name = "BrandInstagram",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).apply {
            path(
                fill = SolidColor(Color(0xFFE1306C)),
                strokeLineJoin = StrokeJoin.Round
            ) {
                moveTo(12f, 2.163f)
                curveToRelative(3.204f, 0f, 3.584f, 0.012f, 4.85f, 0.07f)
                curveToRelative(3.252f, 0.148f, 4.771f, 1.691f, 4.919f, 4.919f)
                curveToRelative(0.058f, 1.265f, 0.069f, 1.645f, 0.069f, 4.849f)
                curveToRelative(0f, 3.205f, -0.012f, 3.584f, -0.069f, 4.849f)
                curveToRelative(-0.149f, 3.225f, -1.664f, 4.771f, -4.919f, 4.919f)
                curveToRelative(-1.266f, 0.058f, -1.644f, 0.07f, -4.85f, 0.07f)
                curveToRelative(-3.204f, 0f, -3.584f, -0.012f, -4.849f, -0.07f)
                curveToRelative(-3.26f, -0.149f, -4.771f, -1.699f, -4.919f, -4.92f)
                curveToRelative(-0.058f, -1.265f, -0.07f, -1.644f, -0.07f, -4.849f)
                curveToRelative(0f, -3.204f, 0.013f, -3.583f, 0.07f, -4.849f)
                curveToRelative(0.149f, -3.227f, 1.664f, -4.771f, 4.919f, -4.919f)
                curveToRelative(1.266f, -0.057f, 1.645f, -0.069f, 4.849f, -0.069f)
                close()
                moveTo(12f, 0f)
                curveToRelative(-3.259f, 0f, -3.667f, 0.014f, -4.947f, 0.072f)
                curveToRelative(-4.358f, 0.2f, -6.78f, 2.618f, -6.98f, 6.98f)
                curveToRelative(-0.059f, 1.281f, -0.073f, 1.689f, -0.073f, 4.948f)
                curveToRelative(0f, 3.259f, 0.014f, 3.668f, 0.072f, 4.948f)
                curveToRelative(0.2f, 4.358f, 2.618f, 6.78f, 6.98f, 6.98f)
                curveToRelative(1.281f, 0.058f, 1.689f, 0.072f, 4.948f, 0.072f)
                curveToRelative(3.259f, 0f, 3.668f, -0.014f, 4.948f, -0.072f)
                curveToRelative(4.354f, -0.2f, 6.782f, -2.618f, 6.979f, -6.98f)
                curveToRelative(0.059f, -1.28f, 0.073f, -1.689f, 0.073f, -4.948f)
                curveToRelative(0f, -3.259f, -0.014f, -3.667f, -0.072f, -4.947f)
                curveToRelative(-0.196f, -4.354f, -2.617f, -6.78f, -6.979f, -6.98f)
                curveToRelative(-1.281f, -0.059f, -1.69f, -0.073f, -4.949f, -0.073f)
                close()
                moveTo(12f, 5.838f)
                curveToRelative(-3.403f, 0f, -6.162f, 2.759f, -6.162f, 6.162f)
                reflectiveCurveToRelative(2.759f, 6.163f, 6.162f, 6.163f)
                reflectiveCurveToRelative(6.162f, -2.759f, 6.162f, -6.163f)
                curveToRelative(0f, -3.403f, -2.759f, -6.162f, -6.162f, -6.162f)
                close()
                moveTo(12f, 16f)
                curveToRelative(-2.209f, 0f, -4f, -1.79f, -4f, -4f)
                curveToRelative(0f, -2.209f, 1.791f, -4f, 4f, -4f)
                reflectiveCurveToRelative(4f, 1.791f, 4f, 4f)
                curveToRelative(0f, 2.21f, -1.791f, 4f, -4f, 4f)
                close()
                moveTo(18.406f, 4.155f)
                curveToRelative(-0.796f, 0f, -1.441f, 0.645f, -1.441f, 1.44f)
                reflectiveCurveToRelative(0.645f, 1.44f, 1.441f, 1.44f)
                curveToRelative(0.795f, 0f, 1.439f, -0.645f, 1.439f, -1.44f)
                reflectiveCurveToRelative(-0.644f, -1.44f, -1.439f, -1.44f)
                close()
            }
        }.build()
        return _BrandInstagram!!
    }

/** Official WhatsApp Brand Icon */
val Iconsax.BrandWhatsapp: ImageVector
    get() {
        if (_BrandWhatsapp != null) return _BrandWhatsapp!!
        _BrandWhatsapp = ImageVector.Builder(
            name = "BrandWhatsapp",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF25D366)),
                strokeLineJoin = StrokeJoin.Round
            ) {
                moveTo(0.057f, 24f)
                lineToRelative(1.687f, -6.163f)
                curveTo(0.703f, 16.033f, 0.156f, 13.988f, 0.157f, 11.891f)
                curveTo(0.16f, 5.335f, 5.495f, 0f, 12.05f, 0f)
                curveToRelative(3.181f, 0.001f, 6.167f, 1.24f, 8.413f, 3.488f)
                curveToRelative(2.245f, 2.248f, 3.481f, 5.236f, 3.48f, 8.414f)
                curveToRelative(-0.003f, 6.557f, -5.338f, 11.892f, -11.893f, 11.892f)
                curveToRelative(-1.99f, -0.001f, -3.951f, -0.5f, -5.688f, -1.448f)
                lineTo(0.057f, 24f)
                close()
                moveTo(6.654f, 20.193f)
                curveToRelative(1.676f, 0.995f, 3.276f, 1.591f, 5.392f, 1.592f)
                curveToRelative(5.448f, 0f, 9.886f, -4.434f, 9.889f, -9.885f)
                curveToRelative(0.002f, -5.462f, -4.415f, -9.89f, -9.881f, -9.892f)
                curveToRelative(-5.452f, 0f, -9.887f, 4.434f, -9.889f, 9.884f)
                curveToRelative(-0.001f, 2.225f, 0.651f, 3.891f, 1.746f, 5.634f)
                lineToRelative(-0.999f, 3.648f)
                lineToRelative(3.742f, -0.981f)
                close()
                moveTo(18.041f, 14.729f)
                curveToRelative(-0.074f, -0.124f, -0.272f, -0.198f, -0.57f, -0.347f)
                curveToRelative(-0.297f, -0.149f, -1.758f, -0.868f, -2.031f, -0.967f)
                curveToRelative(-0.272f, -0.099f, -0.47f, -0.149f, -0.669f, 0.149f)
                curveToRelative(-0.198f, 0.297f, -0.768f, 0.967f, -0.941f, 1.165f)
                curveToRelative(-0.173f, 0.198f, -0.347f, 0.223f, -0.644f, 0.074f)
                curveToRelative(-0.297f, -0.149f, -1.255f, -0.462f, -2.39f, -1.475f)
                curveToRelative(-0.883f, -0.788f, -1.48f, -1.761f, -1.653f, -2.059f)
                curveToRelative(-0.173f, -0.297f, -0.018f, -0.458f, 0.13f, -0.606f)
                curveToRelative(0.134f, -0.133f, 0.297f, -0.347f, 0.446f, -0.521f)
                curveToRelative(0.151f, -0.172f, 0.2f, -0.296f, 0.3f, -0.495f)
                curveToRelative(0.099f, -0.198f, 0.05f, -0.372f, -0.025f, -0.521f)
                curveToRelative(-0.075f, -0.148f, -0.669f, -1.611f, -0.916f, -2.206f)
                curveToRelative(-0.242f, -0.579f, -0.487f, -0.501f, -0.669f, -0.51f)
                lineToRelative(-0.57f, -0.01f)
                curveToRelative(-0.198f, 0f, -0.52f, 0.074f, -0.792f, 0.372f)
                curveToRelative(-0.272f, 0.298f, -1.04f, 1.016f, -1.04f, 2.479f)
                reflectiveCurveToRelative(1.065f, 2.876f, 1.213f, 3.074f)
                curveToRelative(0.149f, 0.198f, 2.095f, 3.2f, 5.076f, 4.487f)
                curveToRelative(0.709f, 0.306f, 1.263f, 0.489f, 1.694f, 0.626f)
                curveToRelative(0.712f, 0.226f, 1.36f, 0.194f, 1.872f, 0.118f)
                curveToRelative(0.571f, -0.085f, 1.758f, -0.719f, 2.006f, -1.413f)
                curveToRelative(0.248f, -0.695f, 0.248f, -1.29f, 0.173f, -1.414f)
                close()
            }
        }.build()
        return _BrandWhatsapp!!
    }

/** Official PIX Brand Icon */
val Iconsax.BrandPix: ImageVector
    get() {
        if (_BrandPix != null) return _BrandPix!!
        _BrandPix = ImageVector.Builder(
            name = "BrandPix",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF32BCAD)),
                strokeLineJoin = StrokeJoin.Round
            ) {
                // Top-Right petal
                moveTo(16.5f, 4.5f)
                lineTo(12f, 9f)
                lineTo(7.5f, 4.5f)
                curveTo(6.3f, 3.3f, 4.3f, 3.3f, 3.1f, 4.5f)
                curveTo(1.9f, 5.7f, 1.9f, 7.7f, 3.1f, 8.9f)
                lineTo(7.6f, 13.4f)
                lineTo(12f, 9f)
                lineTo(16.4f, 13.4f)
                lineTo(20.9f, 8.9f)
                curveTo(22.1f, 7.7f, 22.1f, 5.7f, 20.9f, 4.5f)
                curveTo(19.7f, 3.3f, 17.7f, 3.3f, 16.5f, 4.5f)
                close()
                // Bottom petal
                moveTo(7.5f, 19.5f)
                lineTo(12f, 15f)
                lineTo(16.5f, 19.5f)
                curveTo(17.7f, 20.7f, 19.7f, 20.7f, 20.9f, 19.5f)
                curveTo(22.1f, 18.3f, 22.1f, 16.3f, 20.9f, 15.1f)
                lineTo(16.4f, 10.6f)
                lineTo(12f, 15f)
                lineTo(7.6f, 10.6f)
                lineTo(3.1f, 15.1f)
                curveTo(1.9f, 16.3f, 1.9f, 18.3f, 3.1f, 19.5f)
                curveTo(4.3f, 20.7f, 6.3f, 20.7f, 7.5f, 19.5f)
                close()
            }
        }.build()
        return _BrandPix!!
    }
