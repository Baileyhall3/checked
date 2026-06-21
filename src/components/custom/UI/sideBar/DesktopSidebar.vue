<template>
  <aside
    v-if="!sideBarState.isMobile"
    class="flex-shrink-0 border-r bg-white h-screen overflow-hidden transition-all duration-300"
    :class="sideBarState.isSidebarOpen ? 'w-64' : 'w-0'"
  >
    <div class="w-64 h-full">
      <SidebarContent />
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarContent from './SideBarContent.vue'
import { sideBarState } from './sideBarState';

// :class="sideBarState.isSidebarOpen ? 'w-64' : 'w-16'"
</script>