import { computed } from 'vue'
import { dataSources } from '@/api/dataObjects'

export function useThemes() {
    const defaultTheme = computed(() =>
        dataSources.themes?.data.find((theme) => theme.id === 2)
    )

    function resolveTheme(themeId: number | null) {
        if (!themeId) return defaultTheme.value
        return dataSources.themes?.data.find((theme) => theme.id === themeId) ?? defaultTheme.value
    }

    function hexToRgb(hex: string) {
        const v = hex.replace('#', '')
        const bigint = parseInt(v, 16)
        return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`
    }

    function themeToCssVars(theme: any) {
        return {
            '--bg-main': dataSources.user?.currentRecord?.bg_colour,
            '--header-bg': theme.config.header.background,
            '--header-bg-rgb': hexToRgb(theme.config.header.background),
            '--header-text': theme.config.header.text,
            '--text-primary': theme.config.text.primary,
            '--text-secondary': theme.config.text.secondary,
            '--text-muted': theme.config.text.muted,
            '--accent': theme.config.accent
        }
    }
    return { resolveTheme, themeToCssVars }
}
