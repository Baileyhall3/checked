<template>
    <div class="flex items-center w-full min-w-0 justify-between">
        <div class="flex items-center gap-2 flex-1 min-w-0">
            <component
                @click="props.handleToggle()"
                :is="isExpanded ? FolderOpen : Folder"
                class="h-4 w-4 text-gray-500 flex-shrink-0"
            />
            <span class="truncate block">
                {{ props.title }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FolderOpen, Folder } from 'lucide-vue-next';

const props = defineProps<{
    isExpanded: boolean;
    title: string;
    handleToggle: () => void
}>();
</script>