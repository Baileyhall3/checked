<template>
    <div class="flex items-start gap-2">
        <span 
            v-if="!notif.read"
            class="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0"
        />
        <div class="flex flex-col w-full">
            <div class="flex justify-between items-center">
                <RouterLink :to="notifRoute" class="hover:underline">
                    <span class="font-semibold">
                        {{ formatNotifType(notif.type) }}
                    </span>
                </RouterLink>
                <DropdownMenu v-if="!props.hideDropdown">
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            class="opacity-60 active:opacity-100 rounded-full size-6"
                            aria-label="Open edit menu"
                        >
                            <Ellipsis :size="16" aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem class="cursor-pointer" @click="unmuteNotifType()" v-if="notif.type_muted">
                            <Bell class="size-4 opacity-60" aria-hidden="true" />
                            Unmute notification type
                        </DropdownMenuItem>
                        <DropdownMenuItem class="cursor-pointer" @click="muteNotifType()" v-else>
                            <BellOff class="size-4 opacity-60" aria-hidden="true" />
                            Mute notification type
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="cursor-pointer text-red-600" @click="deleteNotif()">
                            <Trash class="size-4 opacity-60" aria-hidden="true" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <span class="text-sm">{{ formatNotifData(notif.data, notif.type) }}</span>
            <div class="flex items-center justify-between mt-2">
                <div>
                    <span
                        v-if="!notif.read"
                        class="text-sm cursor-pointer hover:underline"
                        @click="markRead(notif)"
                    >
                        Mark read
                    </span>
                    <span
                        v-else
                        class="text-sm cursor-pointer hover:underline"
                        @click="markUnread(notif)"
                    >
                        Mark unread
                    </span>
                </div>
                <span class="text-gray-500 text-sm">
                    {{ DateUtils.toRelevantDateOrTime(notif.created_at) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '@/utils/DateUtils';
import type { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Ellipsis, BellOff, Trash, Bell } from 'lucide-vue-next';
import { useToast } from '@/components/ui/toast';
import { computed } from 'vue';
import { formatNotifType } from '@/utils/shared';

const props = defineProps<{
    notif: DataObjectRecord<any>;
    notificationsData: DataObject;
    hideDropdown?: boolean;
}>();

const { toast } = useToast();

const notifRoute = computed(() => {
    if (!props.notif) { return '/' }
    if (props.notif.checklist_id) {
        return `/checklist/${props.notif.checklist_id}`;
    } else if (props.notif.type.includes('friend')) {
        return `/friends`;
    } else {
        return '/'
    }
});

function formatNotifData(data: object, type: string) {
    if (type === 'friend_request_accepted') {
        if (data.actor_name) {
            return `${data.actor_name} sent you a friend request.`;
        }
    } else if (type === 'checklist_item_checked') {
        if (data.checked_by) {
            return `${data.item_name} was checked by ${data.checked_by}.`;
        } else {
            return `${data.item_name} was checked.`;
        }
    }
}

async function markRead(notif: DataObjectRecord<any>) {
    notif.read = true;
    try {
        await notif.save();
        props.notificationsData.refresh();
    } catch (err) {
        console.error(err);
    }
}

async function markUnread(notif: DataObjectRecord<any>) {
    notif.read = false;
    try {
        await notif.save();
        props.notificationsData.refresh();
    } catch (err) {
        console.error(err);
    }
}

async function deleteNotif() {
    try {
        await props.notif.delete();
        toast({
            title: 'Notification deleted.',
        });
        // props.notificationsData.
    } catch (err) {
        console.error(err);
    }
}
</script>