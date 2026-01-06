<template>
    <!-- <header class="sticky top-0 z-50">
        <div
            class="backdrop-blur-lg shadow-sm"
            :style="headerStyle"
        >
            <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                <div class="flex flex-col gap-2 w-full">
                    <slot />
                </div>
                <slot name="rightSide" />
            </div>
        </div>
    </header> -->

    <header class="sticky top-0 z-50">
        <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
            <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                <div class="flex flex-col gap-2 w-full">
                    <slot></slot>
                </div>
                <slot name="rightSide"></slot>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    background?: string
    textColor?: string
}>()

const headerStyle = computed(() => ({
    backgroundColor: props.background ?? '#ffffff',
    color: props.textColor,
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    blur: '16px',
    backdropFilter: 'blur(16px)',
}))
</script>
