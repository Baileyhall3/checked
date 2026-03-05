<template>
    <div
        class="flex items-center gap-2 rounded-lg px-1 py-0.5 border text-sm bg-gray-300 border-gray-700 text-gray-700"
        :title="`Locked by ${props.lockedBy} ${DateUtils.toDateTime(props.lockedAt)}`"
    >
        <Lock class="size-4" />
        <span>Locked</span>
    </div>
</template>

<script setup lang="ts">
import { Lock, Unlock } from 'lucide-vue-next';
import DateUtils from '@/utils/DateUtils';

const props = defineProps<{
    lockedBy: string;
    lockedAt: string | Date;
}>();
</script>