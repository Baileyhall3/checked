<template>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
                            text-[10px] font-medium leading-none transition-all duration-200"
                >
                    {{ displayCount }}
                </span>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <span class="text-gray-500 text-sm" v-if="unreadCount === 0">No notifications.</span>
            <template v-else>
                <DropdownMenuLabel>Unread Notifications</DropdownMenuLabel>
                <div class="flex justify-between items-center border-b pb-2 px-2">
                    <span
                        class="text-sm cursor-pointer hover:underline"
                        @click="markAllAsRead"
                    >
                        Mark all as read
                    </span>
                    <RouterLink :to="`/notifications`">
                        <span class="text-sm cursor-pointer hover:underline">
                            View all
                        </span>
                    </RouterLink>
                </div>
                <div style="max-width: 20rem; max-height: 25rem; overflow: auto;">
                    <div 
                        v-for="(notif, index) in dataSources.unreadNotifications?.data" 
                        :key="notif.id" 
                        class="flex flex-col p-2 w-full"
                        :class="{ 'border-b' : index !== (unreadCount - 1) }"
                    >
                        <NotificationCard
                            :notif="notif"
                            :notifications-data="dataSources.unreadNotifications"
                            hide-dropdown
                        />
                    </div>
                </div>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { dataSources } from '@/api/dataObjects';
import { Bell } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import { computed, ref } from 'vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import NotificationCard from '../NotificationCard.vue';

const unreadCount = computed(() => {
    if (dataSources.unreadNotifications?.data.length) {
        return dataSources.unreadNotifications?.data.filter(x => x.read == false).length;
    } else {
        return 0
    }
});

const displayCount = computed(() => {
  if (unreadCount.value > 9) return '9+'
  return unreadCount.value
});
</script>