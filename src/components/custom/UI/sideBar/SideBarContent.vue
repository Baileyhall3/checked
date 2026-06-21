<template>
    <div class="flex flex-col h-screen ">
        <div class="py-4 flex justify-between items-center px-2">
            <RouterLink 
                to="/home" 
                class="text-lg font-semibold text-foreground flex items-center px-1"
                @click="sideBarState.onTreeItemClick();"
            >
                <img 
                    src="/public/assets/images/check-icon-no-bg.png"
                    alt="Checked Logo"
                    class="h-6 w-6 mr-1" 
                />
                Checked
            </RouterLink>
        </div>

        <div class="flex flex-col flex-1 min-h-0">
            <!-- Static navigation -->
            <div class="p-2">
                <router-link 
                    to="/" 
                    class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    @click="sideBarState.onTreeItemClick();"
                >
                    <Home class="h-4 w-4 text-gray-500" />
                    Home
                </router-link>

                <div 
                    class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    @click="createFolderDialog?.show()"
                >
                    <FolderPlus class="size-4 text-gray-500" />
                    New Folder
                </div>

                <RouterLink 
                    to="/deleted-items"
                    class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                    <Trash class="h-4 w-4 text-red-600" />
                    Deleted Checklists ({{ dataSources.deletedChecklists?.data.length }})
                </RouterLink>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2">
                <!-- Folders -->
                <div>
                    <span
                        class="px-2 text-gray-600 text-sm flex items-center gap-1 cursor-pointer"
                        style="user-select: none;"
                        @click="sideBarState.toggleFoldersExpanded()"
                    >
                        Folders
                        <ChevronRight 
                            :size="14"
                            :style="{ transform: `rotate(${sideBarState.foldersExpanded ? 90 : 0}deg)` }"
                        />
                    </span>

                    <ChecklistTree v-if="sideBarState.foldersExpanded" />
                </div>

                <!-- Shared Checklists -->
                 <div class="mt-4" v-if="dataSources.sharedChecklists?.data.length">
                     <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                         <div>
                             <span
                                 class="px-2 text-gray-600 text-sm flex items-center gap-1 cursor-pointer"
                                 style="user-select: none;"
                                 @click="sideBarState.toggleSharedChecklistsExpanded()"
                             >
                                 Shared Checklists
                                 <ChevronRight 
                                     :size="14"
                                     :style="{ transform: `rotate(${sideBarState.foldersExpanded ? 90 : 0}deg)` }"
                                 />
                             </span>
                             <template v-if="sideBarState.sharedChecklistsExpanded">
                                <div v-for="checklist in dataSources.sharedChecklists.data"
                                    :key="checklist.id" 
                                    class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 cursor-pointer min-w-0 w-full"
                                    :class="{ 'bg-gray-100 font-semibold' : isSelected(checklist)}"
                                >
                                    <div class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                                        <router-link 
                                            :to="`/checklist/${checklist.id}`" 
                                            class="flex items-center w-full min-w-0"
                                        >
                                            <ListTodo 
                                                class="h-4 w-4 mr-2 flex-shrink-0 'text-gray-500'" 
                                            />
                                            <span class="truncate min-w-0 block">
                                                {{ checklist.name }}
                                            </span>
                                        </router-link>
                                    </div>
                                </div>
                             </template>
                         </div>
                     </div>
                 </div>
            </div>


            <!-- Fixed footer -->
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
import { Home, FolderPlus, Trash, ListTodo } from 'lucide-vue-next';
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
import { useRouter } from "vue-router";

const createFolderDialog = ref(null);
const router = useRouter();

function refreshFolders() {
    dataSources.myFolders?.refresh();
}

function isSelected(checklist: any) {
    if (!checklist) { return false }
    const route = router.currentRoute.value;
    return (route.name === 'Checklist' && Number(route.params.id) === checklist.id);
}
</script>