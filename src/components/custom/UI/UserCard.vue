<template>
    <RoundedContainer class="p-2">
        <div :class="props.userRowClass">
            <div class="flex items-center gap-4">
                <UserDisplayAvatar :user="props.user" :size="props.avatarSize" />
                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ props.user.username }}</p>
    
                    <slot name="subtext" :user="props.user" />
                </div>
            </div>
    
            <slot name="actions" :user="props.user"></slot>
        </div>

        <slot name="default" :user="props.user"></slot>
    </RoundedContainer>
</template>

<script setup lang="ts">
import RoundedContainer from '@/components/RoundedContainer.vue';
import UserDisplayAvatar from './UserDisplayAvatar.vue';
import { DataRecord } from 'supabase-dataobject-core/dist/dataRecord';
import { HTMLAttributes } from 'vue';
import type { UserDisplayAvatarSize } from './UserDisplayAvatar.vue';

const props = defineProps<{
    user: DataRecord<any>;
    userRowClass?: HTMLAttributes['class'];
    avatarSize?: UserDisplayAvatarSize;
}>();
</script>