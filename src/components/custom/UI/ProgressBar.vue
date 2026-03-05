<template>
    <div>
        <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{{ completedCount }} / {{ totalCount }}</span>
        </div>

        <div
            class="bg-gray-200 h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            :aria-valuemax="100"
            aria-label="Checklist progress"
        >
            <div
                class="h-full transition-all duration-500 ease-out"
                :class="{ 
                    'bg-indigo-500' : progressPercent !== 100,
                    'bg-green-600' : progressPercent === 100
                }"
                :style="{ width: `${progressPercent}%` }"
            ></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    totalCount: number;
    completedCount: number;
}>();

const progressPercent = computed(() => {
    return props.totalCount === 0 ? 0 : Math.round((props.completedCount / props.totalCount) * 100);
});
</script>