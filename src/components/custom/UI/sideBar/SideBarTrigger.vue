<template>
    <Button
        size="icon"
        variant="ghost"
        class="rounded-full mr-3"
        aria-label="Open edit menu"
        @click="toggleOpen"
    >
        <component :is="sideBarState.isMobile ? Menu : PanelLeft" :size="16" aria-hidden="true" />
    </Button>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { Menu, PanelLeft } from 'lucide-vue-next';
import { sideBarState } from './sideBarState';

function toggleOpen() {
    sideBarState.isSidebarOpen = !sideBarState.isSidebarOpen;
}
</script>