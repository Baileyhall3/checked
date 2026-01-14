<template>
    <router-link 
        :to="`/checklist/${props.id}`"
        class="flex items-center w-full"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <div class="flex items-center">
            <div class="flex items-center">
                <ListTodo 
                    class="h-4 w-4 mr-2" 
                    :class="{ 
                        'text-gray-500' : !props.isActive,
                        'text-black' : props.isActive
                     }"
                />
                <span class="truncate">
                    {{ props.title }}
                </span>
            </div>
        </div>
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