<template>
    <Sheet v-if="sideBarState.isMobile" v-model:open="sideBarState.isSidebarOpen">
        <SheetContent side="left" class="p-0">
            <SideBarContent />
        </SheetContent>
    </Sheet>
</template>

<script setup lang="ts">
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import SideBarContent from './SideBarContent.vue';
import { sideBarState } from './sideBarState';
</script>