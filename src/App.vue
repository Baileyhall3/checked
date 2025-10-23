<template>
  <Toaster />
  <ion-app>
      <!-- <template v-if="userStore.isLoaded">
      </template> -->
      <ion-router-outlet />
    </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import Toaster from '@/components/ui/toast/Toaster.vue';
import { userStore } from './store/userStore';
</script>
