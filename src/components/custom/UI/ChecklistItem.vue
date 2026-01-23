<template>
    <div
        class="bg-white checklist-item rounded-2xl shadow-sm border-gray-200 px-4 py-3 pl-5 relative
            transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-indigo-400"
            :class="{ 'ring-2 ring-indigo-400' :  isHovered || menuOpen || isCurrent,
                'opacity-50' : itemIsDisabled,
                'cursor-pointer' : isDraggable
            }"
        :style="{ '--item-colour': item.bg_colour }"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @focusin="isHovered = true"
        @focusout="!menuOpen && (isHovered = false)"
        @click="setCurrent"
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
            <Checkbox
                v-else
                :style="{ 'background-color': item.is_checked ? '#00bc7d' : 'transparent'}"
                :class="{ 'border border-gray-400 !border-solid' : !item.is_checked }"
                class="rounded-full mr-2"
                v-model="item.is_checked"
                @update:model-value="handleChecked"
            />
            <span
                v-if="item.priority"
                class="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                :class="{
                    'bg-red-500': item.priority === 1,
                    'bg-yellow-400': item.priority === 2,
                    'bg-blue-400': item.priority === 3
                }"
            />
            <div class="w-full">
                <input
                    v-model="item.name"
                    type="text"
                    :disabled="item.deleted_at"
                    :title="item.name"
                    class="flex-1 bg-transparent border-none focus:outline-none  w-full truncate"
                    :class="{ 
                        'text-gray-700' : item.deleted_at || item.is_checked, 
                        'text-gray-900' : !item.deleted_at && !item.is_checked 
                    }"
                    @blur="props.checklistData.saveChanges()"
                />
            </div>
            <div
                class="ml-3 w-8 flex justify-center transition-opacity duration-150"
                :class="(isHovered || menuOpen || isMobile) ? 'opacity-100' : 'opacity-0'"
            >
                <DropdownMenu :open="menuOpen" @update:open="menuOpen = $event">
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            class="opacity-60 active:opacity-100 rounded-full"
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
        </div>
        <!-- <span v-if="item.deleted_at" class="text-red-600 italic text-sm">
            Deleted {{ DateUtils.toDateTime(item.deleted_at) }} by {{ item.deleted_by_username }}
        </span> -->
        <div class="flex justify-between items-start">
            <div class="text-sm text-gray-600">
                <div
                    class="prose prose-sm
                        prose-ul:list-disc prose-ul:list-inside prose-ul:pl-0
                        prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-0"
                    v-html="item.description"
                ></div>
            </div>
            <!-- <div>
                <Text class="text-gray-600 mr-2" :size="16" />
            </div> -->
        </div>
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
    LockOpen,
    Text
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
import { useWindowSize } from "@vueuse/core";
import { Checkbox } from "@/components/ui/checkbox"

const props = defineProps<{
    item: DataObjectRecord;
    checklistData: DataObject;
    disabled?: boolean;
}>();

const itemDetailsDialog = ref();
const confirmDialog = ref();

const isHovered = ref(false);
const menuOpen = ref(false);
const isDraggable = computed(() => {
    return !itemIsDisabled.value;
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const { toast } = useToast();

const isCurrent = computed(() => {
    return props.checklistData.currentRecord?.id === props.item.id;
});

const itemIsDisabled = computed((): boolean => {
    return props.item.deleted_at || props.item.locked_at || props.item.checklist_is_deleted ? true : false;
});

function setCurrent() {
    props.checklistData.currentRecord = props.item;
}

function handleChecked(isChecked: boolean) {
    props.checklistData.update(props.item.id, {
        is_checked: isChecked
    }, true);
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

<style>
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
.prose ul {
    list-style: disc;
    padding-left: 1.5rem;
}

.prose ol {
    list-style: decimal;
    padding-left: 1.5rem;
}
</style>