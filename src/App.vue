<template>
  <Toaster />
  <template v-if="userStore.isLoaded">
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  </template>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import Toaster from '@/components/ui/toast/Toaster.vue';
import { userStore } from './store/userStore';
</script>
