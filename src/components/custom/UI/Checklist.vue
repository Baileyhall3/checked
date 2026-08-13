<template>
    <div class="border-b">
        <div class="p-2">
            <div :class="{ 'grid grid-cols-[auto_1fr] items-start' : props.allowSelection }">
                <div class="flex items-start pt-[0.575rem] pl-1 pr-3" v-if="props.allowSelection">
                    <Checkbox id="isChecked" v-model="isChecked" @update:model-value="handleChecked" />
                </div>
                <div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <Trash 
                                v-if="checklist.deleted_at && !props.hideDeletedIcon" 
                                class="size-5 text-red-600 mr-2" 
                                :title="`Deleted by ${checklist.deleted_by_username} ${DateUtils.toDateTime(checklist.deleted_at)}`"
                            />
                            <Lock 
                                v-if="checklist.pin_protected_at" 
                                class="w-5 h-5 text-gray-600 mr-2" 
                                :title="`PIN set ${DateUtils.toDateTime(checklist.pin_protected_at)} by ${checklist.pin_set_by_username}`"
                            />
                            <!-- <template v-if="checklist.completed_at">
                                <img src="/public/assets/images/check-icon-no-bg.png"
                                    alt="Checked Logo"
                                    class="h-6 w-6 me-1" 
                                    :title="`Checklist completed ${DateUtils.toDateTime(checklist.completed_at)} by ${checklist.completed_by_username}`"
                                />
                            </template> -->
                            <RouterLink :to="`/checklist/${checklist.id}`" class="cursor-pointer hover:underline">
                                <span class="text-lg font-medium">{{ checklist.name }}</span>
                            </RouterLink>
                        </div>
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        @click.stop.prevent 
                                        size="icon"
                                        variant="ghost"
                                        class="rounded-full shadow-none ml-3"
                                        aria-label="Open edit menu"
                                    >
                                        <Ellipsis :size="16" aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <ChecklistDropdownContent 
                                    :checklist="props.checklist"
                                    :checklist-data="props.checklistData"
                                    :redirectOnDelete="props.redirectOnDelete"
                                />
                            </DropdownMenu>
                        </div>
                    </div>
                    <div class="items-center flex" v-if="checklist.folder_name && !props.hideFolder">
                        <Folder class="size-4 me-1" aria-hidden="true" />
                        <RouterLink :to="`/folder/${checklist.folder_id}`" class="cursor-pointer hover:underline">
                            <span class="text-sm font-medium">{{ checklist.folder_name }}</span>
                        </RouterLink>
                        <!-- <ChevronRight class="size-3.5 mx-1" /> -->
                    </div>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-muted-foreground text-sm" :class="{ 'text-red-600' : checklist.deleted_at }">
                                {{ DateUtils.toRelevantDateOrTime(checklist.deleted_at ?? checklist.items_updated_at ?? checklist.created_at) }}
                            </p>
                            <!-- <p class="text-sm" v-if="checklist.deleted_at">
                                <span class="font-bold">
                                    {{ 30 - DateUtils.dateDiff(new Date(props.checklist.deleted_at), new Date()) }} 
                                </span>
                                days until checklist is permanently deleted.
                            </p> -->
                        </div>
                        <div class="me-2 flex items-center gap-2">
                            <div 
                                v-if="checklist.is_template && !checklist.deleted_at"
                                class="flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm bg-gray-100 border"
                                title="Checklist is a template" 
                            >
                                <LayoutList :size="16" aria-hidden="true" />
                                Template
                            </div>
                            <div 
                                v-if="!props.hideItemsCount"
                                class="flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm bg-gray-100 border"
                                :class="{ 'flex items-center gap-2 rounded-lg px-1 py-0.5 border text-sm bg-green-600 text-white' : ((checklist.items_checked_count > 0) && (checklist.items_checked_count == checklist.items_count)) }"
                                :title="`${checklist.items_checked_count} out of ${checklist.items_count} checklist items completed`"
                            >
                                <CircleCheckBig :size="14" />
                                {{ checklist.items_checked_count }}/{{ checklist.items_count }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '@/utils/DateUtils';
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash, Ellipsis, Folder, Lock, LayoutList, CircleCheckBig } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ChecklistDropdownContent from './ChecklistDropdownContent.vue';
import { Checkbox } from "@/components/ui/checkbox"
import { ref } from 'vue';

const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
    hideFolder?: boolean;
    hideDeletedIcon?: boolean;
    hideItemsCount?: boolean;
    allowSelection?: boolean;
    redirectOnDelete?: boolean;
}>();

const emit = defineEmits<{
    (e: 'selection-changed', isChecked: boolean, checklistId: number): void;
}>();

const isChecked = ref<boolean>(false);

function handleChecked(newValue: boolean) {
    emit('selection-changed', newValue, props.checklist.id);
}
</script>