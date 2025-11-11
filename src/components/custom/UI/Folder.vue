<template>
    <div class="border-b">
        <div class="p-2">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <RouterLink :to="`/folder/${folder.id}`" class="cursor-pointer hover:underline">
                        <span class="text-lg font-medium">{{ folder.name }}</span>
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
                        <FolderDropdownContent 
                            :folder="props.folder"
                            :folder-data="props.folderData"
                        />
                    </DropdownMenu>
                </div>
            </div>
            <p class="text-muted-foreground text-sm">
                {{ DateUtils.toDateTime(folder.created_at) }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '@/utils/DateUtils';
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TextAlignStart, Trash, Ellipsis, Lock, LockOpen } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import FolderDropdownContent from './FolderDropdownContent.vue';

const props = defineProps<{
    folder: DataObjectRecord;
    folderData: DataObject;
}>();

</script>