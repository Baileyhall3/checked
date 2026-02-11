<template>
    <span
        class="w-4 h-4 rounded-full flex-shrink-0"
        :class="props.class, {
            'bg-red-500': priority === 1,
            'bg-yellow-400': priority === 2,
            'bg-blue-400': priority === 3,
        }"
    />
</template>

<script setup lang="ts">

type Priority = 1 | 2 | 3
const props = defineProps<{
    priority: Priority | null;
    class?: string;
}>()
</script>