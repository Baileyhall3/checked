<template>
    <div class="w-full items-center grid" :class="{ 'grid-cols-[7%_93%]' : props.allowSelection }">
        <div class="flex items-start  pr-3" v-if="props.allowSelection">
            <Checkbox 
                id="isSelected" 
                :model-value="isSelected"
                :disabled="props.disabled"
                @update:model-value="handleSelected" 
            />
        </div>
        <div
            class="bg-white cursor-pointer checklist-item rounded-2xl shadow-sm border-gray-200 px-4 py-3 pl-5 relative
                transition-colors duration-150 border focus:outline-none focus:ring-2 focus:ring-indigo-400 select-none"
            :class="{ 
                'ring-2 ring-indigo-400' :  isHovered || menuOpen || isSelected,
                'opacity-50' : itemIsLocked,
            }"
            :style="{ '--item-colour': item.bg_colour }"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            @focusin="isHovered = true"
            @focusout="!menuOpen && (isHovered = false)"
            @click="handleItemClick"
        >
            <div class="grid grid-cols-[auto_1fr_auto] gap-4 w-full items-start">
                <div class="mt-1 flex flex-col justify-center gap-y-2">
                    <template v-if="itemIsLocked">
                        <Trash 
                            v-if="item.deleted_at || item.checklist_is_deleted" 
                            class="w-5 h-5 text-red-600"
                            :title="`Deleted by ${item.deleted_by_username} ${DateUtils.toDateTime(item.deleted_at)}`"
                        />
                        <Lock 
                            v-if="item.locked_at" 
                            class="w-5 h-5 text-gray-600" 
                            :title="`Locked by ${item.locked_by_username} ${DateUtils.toDateTime(item.locked_at)}`"
                        />
                    </template>
                    <Checkbox
                        v-else
                        v-model="item.is_checked"
                        :style="{ 'background-color': item.is_checked ? '#00bc7d' : 'transparent'}"
                        :class="{ 'border border-gray-400 !border-solid' : !item.is_checked }"
                        class="rounded-full"
                        :disabled="props.disabled"
                        @update:model-value="handleChecked"
                    />
                    <!-- <span>{{ props.item.sort_order }}</span> -->
                    <!-- <ItemPriorityCircle v-if="item.priority" :priority="item.priority" /> -->
                </div>
                
                <div class="w-full">
                    <VoiceNotePlayback 
                        v-if="props.item.voice_note_path" 
                        :item="props.item"
                        :data-object="props.checklistData"
                    />
                     <div v-else class="w-full tracking-tight" :class="{ 
                            'text-gray-700' : item.deleted_at || item.is_checked, 
                            'text-gray-900' : !item.deleted_at && !item.is_checked 
                        }"
                    >
                        <textarea
                            ref="nameInput"
                            v-model="item.name"
                            class="block w-full bg-transparent border-none focus:outline-none resize-none overflow-hidden leading-relaxed"
                            :class="{ 
                                'text-gray-700' : item.deleted_at || item.is_checked, 
                                'text-gray-900' : !item.deleted_at && !item.is_checked 
                            }"
                            :disabled="props.disabled"
                            @blur="props.checklistData.saveChanges()"
                            @input="autoResize"
                            :rows="1"
                        ></textarea>
                    </div>
                    <div class="flex w-full gap-2 mb-1" v-if="((item.priority || item.due_date) && (props.fieldsView?.priority || props.fieldsView?.dueDate)) || item.locked_at || (props.item.members?.length && props.fieldsView?.members)">
                        <div v-if="props.item.members?.length && props.fieldsView?.members" class="flex items-center gap-2">
                            <template v-for="member in props.item.members" :key="member.id">
                                <UserDisplayAvatar 
                                    :title="member.username"
                                    :user="member"
                                    size="custom"
                                    class="h-6 w-6 text-base"
                                />
                            </template>
                        </div>
                        <PriorityLabel 
                            v-if="item.priority && props.fieldsView?.priority" 
                            :priority="item.priority" 
                            disabled 
                        />
                        <DueDate 
                            v-if="item.due_date && props.fieldsView?.dueDate" 
                            v-model="item.due_date" 
                            :is-complete="item.is_checked"
                        />
                        <LockedLabel 
                            v-if="item.locked_at"
                            :locked-at="item.locked_at"
                            :locked-by="item.locked_by_username"
                        />
    
                        <!-- <Trash 
                            v-if="item.deleted_at || item.checklist_is_deleted" 
                            class="w-5 h-5 text-red-600"
                            :title="`Deleted by ${item.deleted_by_username} ${DateUtils.toDateTime(item.deleted_at)}`"
                        />
                        <Lock 
                            v-if="item.locked_at" 
                            class="w-5 h-5 text-gray-600" 
                            :title="`Locked by ${item.locked_by_username} ${DateUtils.toDateTime(item.locked_at)}`"
                        /> -->
                    </div>

                    <!-- Description -->
                    <div class="flex justify-between items-start" v-if="props.fieldsView?.description">
                        <div class="text-sm text-gray-600">
                            <div
                                class="prose prose-sm
                                    prose-ul:list-disc prose-ul:list-inside prose-ul:pl-0
                                    prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-0"
                                v-html="item.description"
                            ></div>
                        </div>
                    </div>

                    <div class="flex flex-col mt-2" v-if="doShowCreatedUpdated">
                        <div class="text-xs text-gray-500" v-if="props.fieldsView?.createdAt || props.fieldsView?.createdBy">
                            Created {{ props.fieldsView?.createdAt ? DateUtils.toDateTime(item.created_at) : '' }} {{ props.fieldsView?.createdBy ? 'by ' + item.created_by_username : '' }}
                        </div>
                        <div class="text-xs text-gray-500" v-if="(props.fieldsView?.updatedAt || props.fieldsView?.updatedBy) && item.updated_at">
                            Updated {{ props.fieldsView?.updatedAt ? DateUtils.toDateTime(item.updated_at) : '' }} {{ props.fieldsView?.updatedBy ? 'by ' + item.updated_by_username : '' }}
                        </div>
                    </div>
                </div>
                
                <div>
                    <div
                        class="flex justify-center transition-opacity duration-150"
                        :class="(isHovered || menuOpen || isMobile) ? 'opacity-100' : 'opacity-0'"
                    >
                        <DropdownMenu :open="menuOpen" @update:open="menuOpen = $event">
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    class="opacity-60 active:opacity-100 rounded-full size-6"
                                    aria-label="Open edit menu"
                                >
                                    <Ellipsis  aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <ChecklistItemDropdownContent 
                                :checklist-data="props.checklistData" 
                                :item="props.item" 
                            >
                                <template #additionalItemsTop>
                                    <!-- <template v-if="props.allowSelection"> -->
                                        <DropdownMenuItem 
                                            v-if="isSelected"
                                            class="cursor-pointer" 
                                            title="Select item"
                                            @click="handleSelected(false)" 
                                        >
                                            <SquareX class="size-4 opacity-60" aria-hidden="true" />
                                            Unselect
                                        </DropdownMenuItem>
                                        <DropdownMenuItem class="cursor-pointer" @click="handleSelected(true)" v-else>
                                            <SquareCheck class="size-4 opacity-60" aria-hidden="true" />
                                            Select
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    <!-- </template> -->
                                </template>
                            </ChecklistItemDropdownContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ChecklistItemDetails 
        ref="itemDetailsDialog" 
        :checklist-item="item" 
        :data-object="props.checklistData" 
        :disabled="props.disabled"
    />
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import DateUtils from '@/utils/DateUtils';
import { Trash, Ellipsis, Lock, SquareCheck, SquareX } from "lucide-vue-next";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import ChecklistItemDetails from '@/components/dialogs/ChecklistItemDetails.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { Button } from "@/components/ui/button";
import { useWindowSize } from "@vueuse/core";
import { Checkbox } from "@/components/ui/checkbox";
import PriorityLabel from './checklist/PriorityLabel.vue';
import DueDate from './checklist/DueDate.vue';
import VoiceNotePlayback from './buttons/VoiceNotePlayback.vue';
import ChecklistItemDropdownContent from './ChecklistItemDropdownContent.vue';
import LockedLabel from './checklist/LockedLabel.vue';
import type { ChecklistItemFieldsView } from '@/layouts/ChecklistLayoutManager.js';
import UserDisplayAvatar from './UserDisplayAvatar.vue';

const props = defineProps<{
    item: DataObjectRecord<any>;
    checklistData: DataObject;
    disabled?: boolean;
    allowSelection?: boolean;
    isSelected?: boolean;
    fieldsView?: ChecklistItemFieldsView;
}>();

const emit = defineEmits<{
    (e: 'selection-changed', isSelected: boolean, itemId: number): void;
}>();

watch(() => props.allowSelection, (newValue) => {
    if (newValue == false) {
        isSelected.value = false;
    }
})

const autoResize = (ev) => {
    const el = ev?.target ?? nameInput.value;
    if (!el) return;
    // make sure box-sizing is predictable
    el.style.boxSizing = 'border-box';
    el.style.height = 'auto';
    // use scrollHeight for natural height; add 1px to avoid clipping in some browsers
    el.style.height = `${el.scrollHeight + 1}px`;
};

onMounted(() => {
    if (nameInput.value) {
        autoResize(nameInput.value);
    }
});

const isHovered = ref(false);
const menuOpen = ref(false);
const itemDetailsDialog = ref();
const nameInput = ref(null);
const isDragging = ref(false);
const isDraggable = computed(() => {
    return !itemIsLocked.value;
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const isCurrent = computed(() => {
    return props.checklistData.currentRecord?.id === props.item.id;
});

const doShowCreatedUpdated = computed(() => {
    return props.fieldsView?.createdAt || props.fieldsView?.createdBy || props.fieldsView?.updatedAt || props.fieldsView?.updatedBy;
});

const itemIsLocked = computed((): boolean => {
    return props.item.deleted_at || props.item.locked_at || props.item.checklist_is_deleted ? true : false;
});

function handleSelected(newValue: boolean) {
    emit('selection-changed', newValue, props.item.id);
}

function handleItemClick(event: MouseEvent) {
    if (props.allowSelection) {
        emit('selection-changed', true, props.item.id);
    } else {
        setCurrent(event);
    }
}

function setCurrent(event: MouseEvent) {
    if (props.allowSelection) { return; }
    const target = event.target as HTMLElement

    if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="menu"]')
    ) {
        props.checklistData.currentRecord = props.item;
    } else {
        props.checklistData.currentRecord = props.item;
        openItemDetails();
    }
}

function handleChecked(isChecked: boolean) {
    props.checklistData.update(props.item.id, {
        is_checked: isChecked
    }, true);
}

function openItemDetails() {
    itemDetailsDialog.value.show();
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