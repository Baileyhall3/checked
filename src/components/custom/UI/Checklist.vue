<template>
    <div class="border-b">
        <div class="p-2">
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
                    <template v-if="checklist.completed_at">
                        <img src="/public/assets/images/check-icon-no-bg.png"
                            alt="Checked Logo"
                            class="h-6 w-6 me-1" 
                            :title="`Checklist completed ${DateUtils.toDateTime(checklist.completed_at)} by ${checklist.completed_by_username}`"
                        />
                    </template>
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
                    <p class="text-muted-foreground text-sm">
                        {{ DateUtils.toRelevantDateOrTime(checklist.items_updated_at ?? checklist.created_at) }}
                    </p>
                </div>
                <div class="me-2">
                    <LayoutList 
                        v-if="checklist.is_template && !checklist.deleted_at" 
                        :size="16" 
                        aria-hidden="true" 
                        class="text-muted-foreground" 
                        title="Checklist is a template"
                    />
                    <span class="text-sm font-medium text-muted-foreground">
                        {{ checklist.items_checked_count }}/{{ checklist.items_count }}
                    </span>
                </div>
            </div>
        </div>
    </div>

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
</template>

<script setup lang="ts">
import DateUtils from '@/utils/DateUtils';
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash, Ellipsis, Folder, Lock, LayoutList } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ChecklistDetails from '@/components/dialogs/ChecklistDetails.vue';
import Confirm from '@/components/dialogs/Confirm.vue';
import { ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import ChecklistDropdownContent from './ChecklistDropdownContent.vue';

const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
    hideFolder?: boolean;
    hideDeletedIcon?: boolean;
}>();

const checklistDetailsDialog = ref();
const confirmDialog = ref();
const hardDeleteConfirmDialog = ref();

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