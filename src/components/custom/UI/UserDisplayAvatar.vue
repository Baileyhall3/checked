<template>
    <img
        v-if="user?.profile_picture_url"
        :src="user.profile_picture_url"
        :class="['rounded-full object-cover', sizeClasses]"
        alt="Profile image"
    />
    <div
        v-else
        class="flex items-center justify-center rounded-full text-white font-semibold select-none"
        :class="sizeClasses"
        :style="{
            backgroundColor: user?.bg_colour ?? defaultColour
        }"
        aria-hidden="true"
    >
        {{ initial }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DataObjectRecord } from 'supabase-dataobject-core';

const props = withDefaults(
    defineProps<{
        user?: DataObjectRecord | null;
        size?: 'xs' | 'sm' | 'md' | 'lg';
    }>(),
    {
        size: 'md'
    }
);

const defaultColour = '#9CA3AF'; // Tailwind gray-400

const initial = computed(() => {
    return props.user?.username?.charAt(0)?.toUpperCase() ?? '?';
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs':
            return 'h-2 w-2 text-xs';
        case 'sm':
            return 'h-5 w-5 text-xs';
        case 'lg':
            return 'h-12 w-12 text-lg';
        default:
            return 'h-10 w-10 text-base';
    }
});
</script>