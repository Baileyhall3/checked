<template>
    <div 
        class="flex items-center"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <div class="flex items-center">
            <div class="flex items-center">
                <component
                    :is="isExpanded ? FolderOpen : Folder"
                    class="h-4 w-4 text-gray-500 mr-2"
                />
                <span class="truncate">
                    {{ props.title }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FolderOpen, Folder } from 'lucide-vue-next';

const props = defineProps<{
    isExpanded: boolean;
    title: string;
    id: number;
    isActive?: boolean;
}>();

const isHovered = ref<boolean>(false);
</script>