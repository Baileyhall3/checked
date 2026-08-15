<template>
    <div
        class="flex items-center justify-center overflow-hidden rounded-full font-semibold select-none"
        :class="sizeClasses"
        :style="{
            backgroundColor: user?.profile_picture_url
                ? undefined
                : user?.bg_colour ?? defaultColour
        }"
        :title="user?.username"
        v-bind="$attrs"
    >
        <img
            v-if="user?.profile_picture_url"
            :src="user.profile_picture_url"
            class="block h-full w-full object-cover"
            alt="Profile image"
        />

        <span v-else class="text-white">
            {{ initial }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DataObjectRecord } from 'supabase-dataobject-core';

// TODO: Dropdown when clicking on avatar to show user details and actions (e.g., view profile, message, etc.)

export type UserDisplayAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'custom';

defineOptions({
    inheritAttrs: false
});

const props = withDefaults(
    defineProps<{
        user?: DataObjectRecord | null;
        size?: UserDisplayAvatarSize;
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
        case 'md':
            return 'h-10 w-10 text-base';
        case 'lg':
            return 'h-12 w-12 text-lg';
        case 'custom':
            return '';
        default:
            return '';
    }
});
</script>