<template>
    <DropdownMenuContent>
        <!-- <DropdownMenuItem 
            v-if="isSelected"
            class="cursor-pointer" 
            @click="handleSelected(false)" 
        >
            <SquareX class="size-4 opacity-60" aria-hidden="true" />
            Unselect
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" @click="handleSelected(true)" v-else>
            <SquareCheck class="size-4 opacity-60" aria-hidden="true" />
            Select
        </DropdownMenuItem>
        <DropdownMenuSeparator /> -->
        <!-- <DropdownMenuItem class="cursor-pointer" @click="unmuteNotifType()">
            <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
            Details
        </DropdownMenuItem> -->
        <DropdownMenuItem class="cursor-pointer" @click="openChecklistDialog()">
            <ListTodo class="size-4 opacity-60" aria-hidden="true" />
            Create Shared Checklist
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer text-red-600" @click="removeFriend()">
            <UserX class="size-4 opacity-60" aria-hidden="true" />
            Remove Friend
        </DropdownMenuItem>
    </DropdownMenuContent>

    <Confirm
        ref="removeFriendConfirmDialog" 
        :description="`Are you sure you want to remove ${props.friend.username} as a friend? This action cannot be undone.`"
        confirm-text="Remove"
        confirm-type="delete"
        @confirmed="removeFriendConfirmed"
    />

    <CreateChecklist ref="createChecklistDialog" :members="[props.friend]" @checklist-created="refreshChecklists" />
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import { UserX, ListTodo } from "lucide-vue-next";
import Confirm from '@/components/dialogs/Confirm.vue';
import { toast, useToast } from '@/components/ui/toast';
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { dataSources } from "@/api/dataObjects";
import { ref } from 'vue';
import CreateChecklist from "@/components/dialogs/CreateChecklist.vue";

const props = defineProps<{
    friend: DataObjectRecord<any>;
    friendDs: DataObject<any>;
}>();

const emit = defineEmits<{
    (e: 'friend-removed'): void;
}>();

const removeFriendConfirmDialog = ref<InstanceType<typeof Confirm> | null>(null);
const createChecklistDialog = ref<InstanceType<typeof CreateChecklist> | null>(null);

function removeFriend() {
    removeFriendConfirmDialog.value?.show();
}

async function removeFriendConfirmed() {
    try {
        const result = await dataSources.userFriends?.delete(props.friend.id);

        if (result) {
            toast({
                title: 'Friend removed',
                description: `You have removed ${props.friend.username} from your friends list.`,
            });
            await props.friendDs.refresh();
            emit('friend-removed');
        } else {
            throw new Error('Failed to remove friend');
        }
    } catch (err) {
        toast({
            title: 'Error',
            description: 'An error occurred while trying to remove this friend. Please try again.',
        });
    }
}

function openChecklistDialog() {
    createChecklistDialog.value?.show();
}

function refreshChecklists() {
    dataSources.myChecklists?.refresh();
}
</script>