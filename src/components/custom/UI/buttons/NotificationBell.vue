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
            <DropdownMenuLabel>
                <div class="flex items-center justify-between">
                    <span>Unread Notifications</span>
                    <DropdownMenuItem asChild class="p-0 text-sm">
                        <RouterLink :to="`/notifications`">
                            <div>
                                <span class="text-sm cursor-pointer hover:underline">
                                    View all
                                </span>
                            </div>
                        </RouterLink>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuLabel>
            <div class="flex items-center border-b pb-2 px-2">
                <div>
                    <span
                        v-if="unreadCount > 0"
                        class="text-sm cursor-pointer hover:underline"
                        @click="markAllAsRead"
                    >
                        Mark all as read
                    </span>
                </div>
            </div>
            <div style="width: 20rem; max-height: 25rem; overflow: auto;">
                <div class="p-2" v-if="unreadCount === 0">
                    <span class="text-gray-500 text-sm">No unread notifications.</span>
                </div>
                <div v-else>
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
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { dataSources } from '@/api/dataObjects';
import { Bell, Settings2 } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import { computed, ref } from 'vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import NotificationCard from '../NotificationCard.vue';
import { useToast } from "@/components/ui/toast/use-toast";

const { toast } = useToast();

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

async function markAllAsRead() {
    if (!dataSources.unreadNotifications?.data) return;

    const unreadNotifs = dataSources.unreadNotifications.data.filter(x => x.read == false);
    const idsToUpdate = unreadNotifs.map(x => x.id);

    try {
        await dataSources.unreadNotifications?.bulkUpdate(idsToUpdate, { read: true });
        toast({
            title: 'All notifications marked as read.',
        });
    } catch (err) {
        console.error('Failed to mark notifications as read', err);
    }
}
</script>