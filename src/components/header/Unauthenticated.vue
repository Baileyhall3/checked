<template>
    <IonHeader class="bg-white shadow-sm">
        <IonToolbar class="flex justify-between items-center">
            <div class="container mx-auto px-6 py-3 flex justify-between items-center">
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
                    <ProfileDropdown />
                </div>
            </div>
        </IonToolbar>
    </IonHeader>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar } from '@ionic/vue';
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
import { userStore } from '@/store/userStore';
import ProfileDropdown from '../custom/ProfileDropdown.vue';

function logout() {
  userStore.signOut();
}
</script>
