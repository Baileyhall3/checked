<template>
    <div class="mx-auto py-3 flex justify-between items-center">
        <RouterLink 
            to="/home" 
            class="text-lg font-semibold text-foreground flex items-center px-1"
            @click="sideBarState.onTreeItemClick();"
        >
            <img src="/public/assets/images/check-icon-no-bg.png"
                alt="Checked Logo"
                class="h-6 w-6 mr-1" 
            />
            Checked
        </RouterLink>
    </div>
    <router-link 
        to="/home" 
        class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
        @click="sideBarState.onTreeItemClick();"
    >
        <Home class="h-4 w-4 text-gray-400" />
        Home
    </router-link>
    <ChecklistTree />
</template>

<script setup lang="ts">
import { Home } from 'lucide-vue-next';
import ChecklistTree from './ChecklistTree.vue';
import { sideBarState } from './sideBarState';
</script>