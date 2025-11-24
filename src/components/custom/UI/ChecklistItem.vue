<template>
    <div 
        class="checklist-item bg-white rounded-2xl shadow-sm px-4 py-3 pl-5 transition hover:shadow-md relative"
        :style="{ '--item-colour': item.bg_colour }"
    >
        <div class="flex justify-between items-center">
            <template v-if="itemIsDisabled">
                <Trash 
                    v-if="item.deleted_at || item.checklist_is_deleted" 
                    class="w-6 h-6 text-red-600 mr-2" 
                    :title="`Deleted by ${item.deleted_by_username} ${DateUtils.toDateTime(item.deleted_at)}`"
                />
                <Lock 
                    v-if="item.locked_at" 
                    class="w-6 h-6 text-gray-600 mr-2" 
                    :title="`Locked by ${item.locked_by_username} ${DateUtils.toDateTime(item.locked_at)}`"
                />
            </template>
            <button
                v-else
                class="mr-2 hover:text-indigo-500 transition"
                :class="{ 
                    'text-green-600' : item.is_checked, 
                    'text-gray-400' : !item.is_checked
                }"
                @click="toggleCheck()"
            >
                <component :is="item.is_checked ? CheckCircle2Icon : CircleIcon" class="w-6 h-6" />
            </button>
            <div class="w-full">
                <input
                    v-model="item.name"
                    type="text"
                    :disabled="item.deleted_at"
                    :title="item.name"
                    class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 w-full truncate"
                    :class="{ 'text-gray-800' : item.deleted_at || item.is_checked }"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        class="rounded-full shadow-none ml-3"
                        aria-label="Open edit menu"
                    >
                        <Ellipsis :size="16" aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem class="cursor-pointer" @click="openItemDetails()">
                        <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
                        Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        v-if="!item.locked_at"
                        class="cursor-pointer" 
                        title="Locking this item will prevent people from updating it"
                        @click="lockItem()" 
                    >
                        <Lock class="size-4 opacity-60" aria-hidden="true" />
                        Lock
                    </DropdownMenuItem>
                    <DropdownMenuItem class="cursor-pointer" @click="unlockItem()" v-else>
                        <LockOpen class="size-4" aria-hidden="true" />
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
            </DropdownMenu>
        </div>
        <!-- <span v-if="item.deleted_at" class="text-red-600 italic text-sm">
            Deleted {{ DateUtils.toDateTime(item.deleted_at) }} by {{ item.deleted_by_username }}
        </span> -->
        <span class="text-sm text-gray-600">
            {{ item.description }}
        </span>
    </div>

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
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import DateUtils from '@/utils/DateUtils';
import { 
    RotateCcw, 
    Trash, 
    TextAlignStart, 
    CircleIcon, 
    CheckCircle2Icon, 
    Ellipsis, 
    Lock,
    LockOpen
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/toast';
import ChecklistItemDetails from '@/components/dialogs/ChecklistItemDetails.vue';
import { ref, computed } from 'vue';
import { Button } from "@/components/ui/button";
import Confirm from '@/components/dialogs/Confirm.vue';

const props = defineProps<{
    item: DataObjectRecord;
    checklistData: DataObject;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    (e: 'item-checked', item: DataObjectRecord): void;
}>()

const itemDetailsDialog = ref();
const confirmDialog = ref();

const { toast } = useToast();

const itemIsDisabled = computed((): boolean => {
    return props.item.deleted_at || props.item.locked_at || props.item.checklist_is_deleted ? true : false;
});

function toggleCheck() {
    props.checklistData.update(props.item.id, {
        is_checked: !props.item.is_checked
    });
    emit('item-checked', props.item);
}

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
</script>

<style scoped>
.checklist-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(
        to bottom,
        var(--item-colour),
        color-mix(in srgb, var(--item-colour), white 30%)
    );
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
}

</style>