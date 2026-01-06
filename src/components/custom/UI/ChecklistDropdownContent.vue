<template>
    <DropdownMenuContent>
        <DropdownMenuLabel v-if="props.label">{{ props.label }}</DropdownMenuLabel>
        <template v-if="!checklist.deleted_at">
            <DropdownMenuItem class="cursor-pointer" @click="openChecklistDetails()">
                <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
                Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer" @click="setChecklistDefault()">
                <Star 
                    class="size-4 opacity-60" 
                    aria-hidden="true" 
                    :class="isDefaultChecklist
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'"
                />
                {{ isDefaultChecklist ? 'Remove' : 'Set' }} Default
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer" @click="copyChecklistDialog.show()">
                <Copy class="size-4 opacity-60" aria-hidden="true" />
                Copy
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer">
                <Share2 class="size-4 opacity-60" aria-hidden="true" />
                Share
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer" title="Move this checklist to another folder" @click="moveChecklistDialog.show()">
                <MoveLeft class="size-4 opacity-60" aria-hidden="true" />
                Move
            </DropdownMenuItem>
            <DropdownMenuItem 
                v-if="!checklist.pin_protected_at"
                class="cursor-pointer" 
                title="Locking this item will prevent people from updating it"
                @click="pinSetupDialog.show()" 
            >
                <EyeOff class="size-4 opacity-60" aria-hidden="true" />
                Set PIN
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer" @click="pinRemoveDialog.show()" v-else>
                <Eye class="size-4" aria-hidden="true" />
                Remove PIN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer">
                <ListX class="size-4 opacity-60" aria-hidden="true" />
                Deleted Items
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </template>
        <DropdownMenuItem class="cursor-pointer text-red-600" @click="confirmDialog.show()" v-if="!checklist.deleted_at">
            <Trash class="size-4" aria-hidden="true" />
            Delete
        </DropdownMenuItem>
        <template v-else>
            <DropdownMenuItem class="cursor-pointer" @click="recoverItem()">
                <RotateCcw class="size-4 opacity-60" aria-hidden="true" />
                Recover
            </DropdownMenuItem>
            <DropdownMenuItem
                class="cursor-pointer text-red-600"
                @click="hardDeleteConfirmDialog.show()"
            >
                <Trash class="size-4" aria-hidden="true" />
                Delete Permanently
            </DropdownMenuItem>
        </template>
    </DropdownMenuContent>

    <ChecklistDetails
        ref="checklistDetailsDialog"
        :checklist="props.checklist"
        :data-object="props.checklistData"
    />
    <Confirm
        description="Are you sure you want to delete this checklist? Deleted checklists can be recovered for 30 days. Checklist items will not be editable."
        ref="confirmDialog" 
        @confirmed="handleChecklistDelete"
    />

    <Confirm
        description="Are you sure you want to permanently delete this checklist? All checklist items will be deleted. This cannot be undone."
        ref="hardDeleteConfirmDialog" 
        confirm-text="Delete"
        confirm-type="delete"
        @confirmed="hardDeleteItem"
    />
    <PINSetup ref="pinSetupDialog" :item="props.checklist" :data-object="props.checklistData" type="checklist" />
    <PINRemove ref="pinRemoveDialog" :item="props.checklist" :data-object="props.checklistData" type="checklist" />
    <CopyChecklist ref="copyChecklistDialog" :checklist="props.checklist" @checklist-copied="handleChecklistCopied" />
    <MoveChecklist ref="moveChecklistDialog" :checklist="props.checklist" :checklist-data="props.checklistData" />
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { TextAlignStart, Trash, RotateCcw, EyeOff, Eye, ListX, Share2, Copy, MoveLeft, Star } from "lucide-vue-next";
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import ChecklistDetails from '@/components/dialogs/ChecklistDetails.vue';
import Confirm from '@/components/dialogs/Confirm.vue';
import { ref, computed } from 'vue';
import { useToast } from '@/components/ui/toast';
import PINSetup from "@/components/dialogs/PINSetup.vue";
import PINRemove from "@/components/dialogs/PINRemove.vue";
import CopyChecklist from "@/components/dialogs/CopyChecklist.vue";
import { dataSources } from '@/api/dataObjects';
import MoveChecklist from "@/components/dialogs/MoveChecklist.vue";
import { useRouter } from "vue-router";

const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
    label?: string;
    redirectOnDelete?: boolean;
}>();

const checklistDetailsDialog = ref();
const confirmDialog = ref();
const hardDeleteConfirmDialog = ref();
const pinSetupDialog = ref();
const pinRemoveDialog = ref();
const copyChecklistDialog = ref();
const moveChecklistDialog = ref();

const { toast } = useToast();
const router = useRouter();

const isDefaultChecklist = computed(() => {
    return dataSources.user?.currentRecord?.default_view_type === "checklist" &&
        dataSources.user?.currentRecord?.default_view_id === props.checklist.id;
});

function openChecklistDetails() {
    checklistDetailsDialog.value.show();
}

function setChecklistDefault() {
    if (dataSources.user?.currentRecord) {
        if (isDefaultChecklist.value) {
            dataSources.user.currentRecord.default_view_type = 'last_opened';
            dataSources.user.currentRecord.default_view_id = null;
            toast({
                title: 'Default checklist removed.',
                description: 'No checklist will be opened by default.',
            });
        } else {
            dataSources.user.currentRecord.default_view_type = "checklist";
            dataSources.user.currentRecord.default_view_id = props.checklist.id;
            toast({
                title: 'Checklist set as default.',
                description: 'This checklist will now be opened by default.',
            });
        }
        dataSources.user.saveChanges();
    }
}

async function handleChecklistDelete() {
    const hasUpdated = await props.checklistData?.update(props.checklist?.id, { deleted_at: new Date() });
    if (hasUpdated) {
        toast({
            title: 'Checklist deleted.',
            description: 'Deleted items are recoverable for 30 days.',
        });
        dataSources.deletedChecklists?.refresh();
        if (props.redirectOnDelete) {
            redirect();
        }
    }
}

function redirect() {
    if (props.checklist.folder_id) {
        router.push(`/folder/${props.checklist.folder_id}`);
    } else {
        router.push('/home');
    }
}

async function hardDeleteItem() {
    await props.checklistData.delete(props.checklist.id);
    if (props.redirectOnDelete) {
        redirect();
    }
    toast({title: 'Checklist permanently deleted.'});
}

async function recoverItem() {
    await props.checklistData.update(props.checklist.id, {
        deleted_at: null
    });
    toast({title: 'Checklist recovered.'});
}

function handleChecklistCopied() {
    props.checklistData.refresh();
}
</script>