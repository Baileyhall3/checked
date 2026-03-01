<template>
    <div class="relative inline-block">
        <Button
            size="icon"
            variant="ghost"
            class="rounded-full relative"
            aria-label="Notifications"
        >
            <Bell :size="16" aria-hidden="true" />
        </Button>

        <!-- Badge -->
        <span
            v-if="unreadCount > 0"
            class="absolute top-1 right-1 min-w-[12px] h-3 px-1
                    flex items-center justify-center
                    rounded-full bg-red-500 text-white
                    text-[10px] font-medium leading-none"
        >
            {{ displayCount }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { dataSources } from '@/api/dataObjects';
import { Bell } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import { computed, ref } from 'vue';

const unreadCount = computed(() => {
    if (dataSources.notifications?.data.length) {
        return dataSources.notifications?.data.filter(x => x.read == false).length;
    } else {
        return 0
    }
});

const displayCount = computed(() => {
  if (unreadCount.value > 9) return '9+'
  return unreadCount.value
});
</script>