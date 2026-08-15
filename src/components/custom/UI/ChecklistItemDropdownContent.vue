<template>
    <DropdownMenuContent>
        <template v-if="!props.hideDetailsOption">
            <DropdownMenuItem class="cursor-pointer" @click="openItemDetails()">
                <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
                Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </template>

        <slot name="additionalItemsTop"></slot>
        <DropdownMenuItem class="cursor-pointer" title="Move this checklist to another folder" @click="$refs.copyItemDialog.show()">
            <Copy class="size-4 opacity-60" aria-hidden="true" />
            Copy
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" title="Move this checklist to another folder" @click="$refs.moveItemDialog.show()">
            <MoveLeft class="size-4 opacity-60" aria-hidden="true" />
            Move
        </DropdownMenuItem>
        <DropdownMenuItem 
            v-if="!item.locked_at"
            class="cursor-pointer" 
            title="Locking this item will prevent other members from updating it"
            @click="lockItem()" 
        >
            <Lock class="size-4 opacity-60" aria-hidden="true" />
            Lock
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" @click="unlockItem()" v-else>
            <LockOpen class="size-4 opacity-60" aria-hidden="true" />
            Unlock
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer text-red-600" @click="setDeleted()" v-if="!item.deleted_at">
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
                @click="tryHardDeleteItem()"
            >
                <Trash class="size-4" aria-hidden="true" />
                Delete permanently
            </DropdownMenuItem>
        </template>
    </DropdownMenuContent>

    <ChecklistItemDetails 
        ref="itemDetailsDialog" 
        :checklist-item="item" 
        :data-object="props.checklistData" 
    />
    <Confirm
        description="Are you sure you want to permanently delete this item? This cannot be undone."
        ref="confirmDialog" 
        confirm-text="Delete"
        confirm-type="delete"
        @confirmed="hardDeleteItem"
    />
    <MoveChecklistItem 
        ref="moveItemDialog"
        :item="props.item"
        :checklist="props.checklistData.currentRecord"
        :checklist-data="props.checklistData"
    />
    <CopyChecklistItem
        ref="copyItemDialog"
        :item="props.item"
        @item-copied="handleItemCopied"
    />
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { RotateCcw, Trash, TextAlignStart, Lock, LockOpen, MoveLeft, Copy } from "lucide-vue-next";
import type { DataObject, DataObjectRecord } from "supabase-dataobject-core";
import ChecklistItemDetails from '@/components/dialogs/ChecklistItemDetails.vue';
import Confirm from '@/components/dialogs/Confirm.vue';
import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import MoveChecklistItem from "@/components/dialogs/MoveChecklistItem.vue";
import CopyChecklistItem from "@/components/dialogs/CopyChecklistItem.vue";

const props = defineProps<{
    item: DataObjectRecord;
    checklistData: DataObject;
    hideDetailsOption?: boolean;
}>();

const itemDetailsDialog = ref();
const confirmDialog = ref();

const { toast } = useToast();

function openItemDetails() {
    itemDetailsDialog.value.show();
}

function lockItem() {
    props.checklistData.update(props.item.id, {
        locked_at: new Date()
    });
}

function unlockItem() {
    props.checklistData.update(props.item.id, {
        locked_at: null
    });
}

function setDeleted() {
    props.checklistData.update(props.item.id, {
        deleted_at: new Date()
    });

    toast({
        title: 'Item deleted.',
        description: 'Deleted items are recoverable for 30 days.',
    });
}

function tryHardDeleteItem() {
    confirmDialog.value.show();
}

function hardDeleteItem() {
    props.checklistData.delete(props.item.id);
}

function recoverItem() {
    props.checklistData.update(props.item.id, {
        deleted_at: null
    });
}

function handleItemCopied() {
    props.checklistData.refresh();
}
</script>