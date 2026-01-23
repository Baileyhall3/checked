<template>
  <div class="flex h-screen w-screen overflow-hidden">

    <!-- DESKTOP SIDEBAR -->
    <DesktopSidebar />

    <!-- MOBILE SHEET -->
    <LeftSheet />

    <!-- MAIN CONTENT -->
      <div class="flex-1 overflow-auto relative">
        <ion-router-outlet />
      </div>

  </div>
</template>

<script setup lang="ts">
import { IonRouterOutlet } from '@ionic/vue';
import DesktopSidebar from '@/components/custom/UI/sideBar/DesktopSidebar.vue';
import LeftSheet from '@/components/custom/UI/sideBar/LeftSheet.vue';
import { useRouter } from 'vue-router'
import { sideBarState } from '@/components/custom/UI/sideBar/sideBarState';

const router = useRouter()

sideBarState.installRouterWatcher(router);
</script>
