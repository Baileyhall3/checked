<template>
    <div class="border-b">
        <div class="p-2">
            <div class="flex items-center justify-between">
                <div>
                    <Trash 
                        v-if="checklist.deleted_at" 
                        class="size-5 text-red-600 mr-2" 
                        :title="`Deleted by ${checklist.deleted_by_username} ${DateUtils.toDateTime(checklist.deleted_at)}`"
                    />
                    <RouterLink :to="`/checklist/${checklist.id}`" class="cursor-pointer hover:underline">
                        <span class="text-lg font-medium">{{ checklist.name }}</span>
                    </RouterLink>
                </div>
                <div>
                    <span class="text-lg font-medium text-muted-foreground">
                        {{ checklist.items_checked_count }}/{{ checklist.items_count }}
                    </span>
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
                        <DropdownMenuContent>
                            <DropdownMenuItem class="cursor-pointer" @click="openItemDetails()">
                                <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
                                Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                v-if="!checklist.pin_protected_at"
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
                            <DropdownMenuItem class="cursor-pointer text-red-600" @click="setDeleted()" v-if="!checklist.deleted_at">
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
            <p class="text-muted-foreground text-sm">
                {{ DateUtils.toDateTime(checklist.items_updated_at ?? checklist.created_at) }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import DateUtils from '@/utils/DateUtils';
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TextAlignStart, Trash, Ellipsis, RotateCcw, Lock, LockOpen } from "lucide-vue-next";
import { Button } from "@/components/ui/button";


const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
}>();


</script>