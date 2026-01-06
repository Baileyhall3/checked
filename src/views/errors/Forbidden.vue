<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div class="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div class="text-6xl font-extrabold text-indigo-600 mb-4">
            403
          </div>

          <h1 class="text-2xl font-semibold mb-2">
            Access denied
          </h1>

          <p class="text-gray-600 mb-8">
            You don’t have permission to view this page.
          </p>

          <RouterLink to="/">
            <Button size="lg" class="w-full">
              Return home
            </Button>
          </RouterLink>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import { Button } from '@/components/ui/button'
</script>
