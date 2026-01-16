<template>
    <header class="sticky top-0 z-50">
        <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
            <div class="container mx-auto px-2 py-2 flex justify-between items-center">
                <div class="flex flex-col gap-2 w-full">
                    
                    <div class="grid grid-cols-3 items-center">
                        <div class="justify-self-start">
                            <SideBarTrigger />
                        </div>
                        <div class="justify-self-center">
                            <slot name="center"></slot>
                        </div>
                        <div class="justify-self-end">
                            <slot name="rightSide"></slot>
                        </div>
                    </div>

                    <slot></slot>
                    
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SideBarTrigger from '../custom/UI/sideBar/SideBarTrigger.vue';

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
