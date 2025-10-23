<template>
    <header class="sticky top-0 z-50">
        <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
            <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                <span class="text-2xl font-semibold text-gray-800 drop-shadow-sm">
                    {{ title }}
                </span>
        
                <!-- Right side buttons -->
                <!-- <div class="flex items-center gap-2">
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
                </div> -->
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar } from '@ionic/vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
    title: string;
}>();
</script>