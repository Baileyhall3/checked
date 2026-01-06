<template>
  <IonPage>
    <IonContent :fullscreen="true">
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div class="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div class="text-6xl font-extrabold text-indigo-600 mb-4">
            500
          </div>

          <h1 class="text-2xl font-semibold mb-2">
            Something went wrong
          </h1>

          <p class="text-gray-600 mb-8">
            An unexpected error occurred. Please try again shortly.
          </p>

          <div class="flex flex-col gap-3">
            <Button size="lg" class="w-full" @click="reload">
              Reload page
            </Button>
            <RouterLink to="/">
              <Button size="lg" variant="ghost" class="w-full">
                Go home
              </Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import { Button } from '@/components/ui/button'

const reload = () => window.location.reload()
</script>
