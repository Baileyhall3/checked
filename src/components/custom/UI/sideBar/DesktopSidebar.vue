<template>
  <aside
    v-if="!sideBarState.isMobile"
    class="flex-shrink-0 border-r bg-white transition-[width] duration-200"
    :class="sideBarState.isSidebarOpen ? 'p-2 w-64' : 'w-0'"
  >
    <SidebarContent />
  </aside>
</template>

<script setup lang="ts">
import SidebarContent from './SideBarContent.vue'
import { sideBarState } from './sideBarState';

// :class="sideBarState.isSidebarOpen ? 'w-64' : 'w-16'"
</script>