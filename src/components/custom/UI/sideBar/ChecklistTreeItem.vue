<template>
    <router-link 
        :to="`/checklist/${props.id}`" 
        class="flex items-center w-full min-w-0"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <ListTodo 
            class="h-4 w-4 mr-2 flex-shrink-0" 
            :class="{ 
                'text-gray-500' : !props.isActive,
                'text-black' : props.isActive
                }"
        />
        <span class="truncate min-w-0 block">
            {{ props.title }}
        </span>
    </router-link>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ListTodo } from 'lucide-vue-next';

const props = defineProps<{
    title: string;
    id: number;
    isActive?: boolean;
}>();

const isHovered = ref<boolean>(false);
</script>