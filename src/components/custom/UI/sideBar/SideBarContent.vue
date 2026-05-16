<template>
    <div class="flex flex-col h-screen absolute">
        <div class="py-4 flex justify-between items-center px-2">
            <RouterLink to="/home" class="text-lg font-semibold text-foreground flex items-center px-1" @click="sideBarState.onTreeItemClick();">
                <img src="/public/assets/images/check-icon-no-bg.png"
                    alt="Checked Logo"
                    class="h-6 w-6 mr-1" 
                />
                Checked-it
            </RouterLink>
        </div>
        <div class="flex flex-col flex-1 min-h-0">
            <div class="overflow-y-auto overflow-x-hidden py-2 flex-1 min-h-0 p-2">
                <router-link to="/" class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @click="sideBarState.onTreeItemClick();">
                    <Home class="h-4 w-4 text-gray-500" />
                    Home
                </router-link>
                <div class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @click="createFolderDialog?.show()">
                    <FolderPlus class="size-4 text-gray-500" />
                    New Folder
                </div>
                <RouterLink to="/deleted-items" class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <Trash class="h-4 w-4 text-red-600" aria-hidden="true" />
                    Deleted Checklists ({{ dataSources.deletedChecklists?.data.length }})
                </RouterLink>
                <div class="mt-2">
                    <span class="px-2 text-gray-600 text-sm flex items-center gap-1 cursor-pointer"
                        style="user-select: none;"
                        @click="sideBarState.toggleFoldersExpanded()"
                    >
                        Folders
                        <ChevronRight :size="14" aria-hidden="true" :style="{ 'transform': `rotate(${sideBarState.foldersExpanded ? 90 : 0}deg)` }" />
                    </span>
                    <ChecklistTree v-if="sideBarState.foldersExpanded" />
                </div>
            </div>
            <div class="border-t p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <UserDisplayAvatar :user="dataSources.user?.currentRecord" size="sm" />
                            <span>{{ dataSources.user?.currentRecord?.username }}</span>
                        </div>
                    </DropdownMenuTrigger>
                    <ProfileDropdownContent />
                </DropdownMenu>
            </div>
        </div>
    </div>

    <CreateFolder ref="createFolderDialog" @folder-created="refreshFolders" />
</template>

<script setup lang="ts">
import { Home, FolderPlus, Trash } from 'lucide-vue-next';
import ChecklistTree from './ChecklistTree.vue';
import { dataSources } from '@/api/dataObjects';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDisplayAvatar from '../UserDisplayAvatar.vue';
import ProfileDropdownContent from '../ProfileDropdownContent.vue';
import { ChevronRight } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import { sideBarState } from './sideBarState';
import { ref } from 'vue';
import CreateFolder from '@/components/dialogs/CreateFolder.vue';

const createFolderDialog = ref(null);

function refreshFolders() {
    dataSources.myFolders?.refresh();
}
</script>