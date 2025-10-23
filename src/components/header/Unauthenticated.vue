<template>
    <IonHeader class="bg-white shadow-sm">
        <IonToolbar class="flex justify-between items-center">
            <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                <!-- App Title -->
                <div class="items-center flex">
                    <img src="/public/assets/images/check-icon-no-bg.png"
                        alt="Checked Logo"
                        class="h-10 w-10 mx-auto" 
                    />
                    <RouterLink to="/" class="text-2xl font-bold text-primary">
                        Checked
                    </RouterLink>
                </div>
        
                <!-- Right side buttons -->
                <div class="flex items-center gap-2">
                    <template v-if="userStore.isAuthenticated">
                        <span class="text-sm text-gray-700">
                            Hey, {{ userStore.userProfile?.username }}
                        </span>
                        <Button variant="outline" size="sm" @click="logout">
                            Logout
                        </Button>
                    </template>
            
                    <template v-else>
                        <RouterLink to="/login">
                            <Button size="sm">
                                Login
                            </Button>
                        </RouterLink>
                    </template>
                </div>
            </div>
        </IonToolbar>
    </IonHeader>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar } from '@ionic/vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { userStore } from '@/store/userStore'

function logout() {
  userStore.signOut();
}
</script>
