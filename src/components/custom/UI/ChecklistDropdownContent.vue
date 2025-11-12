<template>
    <DropdownMenuContent>
        <DropdownMenuLabel v-if="props.label">{{ props.label }}</DropdownMenuLabel>
        <DropdownMenuItem class="cursor-pointer" @click="openChecklistDetails()">
            <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
            Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer">
            <Share2 class="size-4 opacity-60" aria-hidden="true" />
            Sharing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
                Delete permanently
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
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { TextAlignStart, Trash, RotateCcw, EyeOff, Eye, ListX, Share2 } from "lucide-vue-next";
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import ChecklistDetails from '@/components/dialogs/ChecklistDetails.vue';
import Confirm from '@/components/dialogs/Confirm.vue';
import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import PINSetup from "@/components/dialogs/PINSetup.vue";
import PINRemove from "@/components/dialogs/PINRemove.vue";

const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
    label?: string;
}>();

const checklistDetailsDialog = ref();
const confirmDialog = ref();
const hardDeleteConfirmDialog = ref();
const pinSetupDialog = ref();
const pinRemoveDialog = ref();

const { toast } = useToast();

function openChecklistDetails() {
    checklistDetailsDialog.value.show();
}

async function handleChecklistDelete() {
    const hasUpdated = await props.checklistData?.update(props.checklist?.id, { deleted_at: new Date() });
    if (hasUpdated) {
        toast({
            title: 'Checklist deleted.',
            description: 'Deleted items are recoverable for 30 days.',
        });
    }
}

function hardDeleteItem() {
    props.checklistData.delete(props.checklist.id);
}

function recoverItem() {
    props.checklistData.update(props.checklist.id, {
        deleted_at: null
    });
}
</script>