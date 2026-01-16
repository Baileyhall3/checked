<template>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                size="icon"
                variant="ghost"
                class="opacity-0
                    transition-opacity p-0 size-4 ml-2"
                :class="{
                    'opacity-60 pointer-events-auto': isHovered
                }"
                aria-label="Open folder details"
                @click.stop
                @pointerdown.capture.stop
            >
                <Ellipsis :size="12" />
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
            <FolderDropdownContent 
                :folder-data="dataSources.myFolders" 
                :folder="folder"
            >
                <template #contentTop="{ folder }">
                    <DropdownMenuItem class="cursor-pointer" @click="openFolder(folder)">
                        <SquareArrowUpRight class="size-4 opacity-60" aria-hidden="true" />
                        Open Folder
                    </DropdownMenuItem>
                </template>
                <template #actions>
                    <DropdownMenuItem class="cursor-pointer" @click="addChecklist()">
                        <ListPlus class="size-4 opacity-60" aria-hidden="true" />
                        Add Checklist
                    </DropdownMenuItem>
                </template>
            </FolderDropdownContent>
        </DropdownMenuPortal>
    </DropdownMenu>
    
    <CreateChecklist ref="createChecklistDialog" :folder="props.folder" @checklist-created="refreshChecklists" />
</template>

<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Ellipsis, ListPlus, SquareArrowUpRight } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import FolderDropdownContent from '../FolderDropdownContent.vue';
import { dataSources } from '@/api/dataObjects';
import { DataObjectRecord } from 'supabase-dataobject-core';
import CreateChecklist from "@/components/dialogs/CreateChecklist.vue";
import { ref } from 'vue';
import { useRouter } from "vue-router";

const props = defineProps<{
    isHovered: boolean;
    folder: DataObjectRecord
}>();

const createChecklistDialog = ref();

const router = useRouter();

function openFolder(folder: DataObjectRecord) {
    router.push(`/folder/${folder.id}`);
}

function addChecklist() {
    createChecklistDialog.value.show();
}

function refreshChecklists() {
    dataSources.myChecklists?.refresh();
}
</script>