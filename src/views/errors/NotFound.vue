<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div class="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div class="text-6xl font-extrabold text-indigo-600 mb-4">
            404
          </div>

          <h1 class="text-2xl font-semibold mb-2">
            Page not found
          </h1>

          <p class="text-gray-600 mb-8">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>

          <RouterLink to="/">
            <Button size="lg" class="w-full">
              Go back home
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
