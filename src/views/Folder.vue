<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Loading v-if="isLoading" />
            <template v-else>
                <BlurredHeader>
                    <Breadcrumbs :items="breadcrumbs" />
                    <!-- <div class="w-full flex">
                        <SearchBar />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    class="rounded-xl shadow-none ml-3"
                                    aria-label="Open sort"
                                >
                                    <ArrowUpDown :size="16" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('recent')">
                                    Most Recent
                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'recent'" />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('name')">
                                    Name
                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'name'" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div> -->
                    <template #rightSide>
                        <div class="flex items-center gap-2">
                            <ProfileDropdown />
                        </div>
                    </template>
                </BlurredHeader>   
                <div class="min-h-screen bg-gray-100">
                    <div class="container mx-auto px-6 py-8">
                        <Empty class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="folderDs.checklists?.data.length === 0">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ListTodo />
                                </EmptyMedia>
                                <EmptyTitle>No Checklists Yet</EmptyTitle>
                                <EmptyDescription>
                                    This folder does not have any checklists yet. Get started by creating your first
                                    checklist!
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <div class="flex gap-2">
                                    <Button @click="createChecklistDialog.show()">
                                        Create Checklist
                                    </Button>
                                </div>
                                <EmptyDescription>
                                    Need help? <a href="#">View tutorial</a>
                                </EmptyDescription>
                            </EmptyContent>
                        </Empty>
                        <div class="flex items-center space-x-2 mb-8" v-else>
                            <div class="w-full">
                                <SearchBar />
                            </div>
                            <Button @click="createChecklistDialog.show()" class="text-white rounded-xl">
                                Add New
                            </Button>
                        </div>
    
                        <div v-if="folderDs.checklists && folderDs.checklists?.data.length > 0">
                            <div class="text-lg font-medium">Folder Checklists</div>
                            <RoundedContainer class=" flex flex-col">
                                <div v-for="(checklist, index) in folderDs.checklists?.data" 
                                    :key="checklist.id"
                                    class="cursor-pointer border-b hover:bg-gray-200"
                                >
                                    <RouterLink :to="`/checklist/${checklist.id}`">
                                        <div class="p-2">
                                            <span class="text-lg font-medium">{{ checklist.name }}</span>
                                            <p class="text-muted-foreground text-sm">
                                                {{ DateUtils.toDateTime(checklist.items_updated_at ?? checklist.created_at) }}
                                            </p>
                                        </div>
                                    </RouterLink>
                                </div>
                            </RoundedContainer>
                        </div>
                    </div>
                </div>
            </template>
        </IonContent>

    <CreateChecklist ref="createChecklistDialog" :folder="folderDs.folder?.currentRecord" @checklist-created="refreshChecklists" />
    </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ListTodo } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useToast } from '@/components/ui/toast';
import { ref, reactive, computed } from 'vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { createDataObject, DataObject } from 'supabase-dataobject-core';
import { dataSources } from '@/api/dataObjects';
import { Folder, Home } from "lucide-vue-next";
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import DateUtils from '@/utils/DateUtils';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import Loading from '@/components/custom/UI/Loading.vue';
import ProfileDropdown from '@/components/custom/ProfileDropdown.vue';
import Breadcrumbs from '@/components/custom/UI/Breadcrumbs.vue';
import type { IBreadcrumbItem } from '@/components/custom/UI/Breadcrumbs.vue';

const createChecklistDialog = ref();
const route = useRoute();
const itemDetailsDialog = ref();
const isLoading = ref<boolean>(true);
const { toast } = useToast();

const folderDs = reactive({
    folder: null as DataObject | null,
    checklists: null as DataObject | null
});

const breadcrumbs = computed((): IBreadcrumbItem[] => {
    const items = [
        { label: "Home", icon: Home, href: "/home" },
    ];

    items.push({
        label: folderDs.folder?.currentRecord?.name,
        icon: Folder,
        dropdown: folderDs.checklists?.data?.map(c => ({
            label: c.name,
            href: `/checklist/${c.id}`,
        })),
    });
    return items;
});

onIonViewDidEnter(() => {
    const idParam = route.params.id
    const id = Number(idParam)

    if (isNaN(id)) {
        console.error('Invalid folder ID:', idParam)
        return
    }

    createDataObjects(id);
});

async function createDataObjects(id: number) {
    try {
        isLoading.value = true;

        const folderData = await createDataObject('folder', {
           viewName: 'checklist_folders_view',
            tableName: 'checklist_folders',
            canInsert: false,
            canUpdate: true,
            canDelete: true,
            masterDataObjectBinding: {
                masterDataObjectId: 'user',
                childBindingField: 'user_id',
                masterBindingField: 'id'
            },
            sort: { field: "created_at", direction: 'desc' },
            fields: [
                { name: "id" },
                { name: "prim_key" },
                { name: "name" },
                { name: "user_id" },
                { name: "created_at" },
                { name: "username" },
                { name: "checklist_count" },
            ],
            recordLimit: 1
        }); 

        if (folderData?.data.length) {
            folderDs.folder = folderData;
        }

        folderDs.checklists = await createDataObject('folder_checklists', {
            viewName: 'checklists_view',
            tableName: 'checklists',
            canInsert: false,
            canUpdate: true,
            canDelete: true,
            masterDataObjectBinding: {
                masterDataObjectId: 'folder',
                childBindingField: 'folder_id',
                masterBindingField: 'id'
            },
            sort: { field: "created_at", direction: 'desc' },
            fields: [
                { name: "id" },
                { name: "prim_key" },
                { name: "name" },
                { name: "is_template" },
                { name: "created_at" },
                { name: "updated_at" },
                { name: "folder_id" },
                { name: "folder_name" },
                { name: "owner_id" },
                { name: "owner_username" },
                { name: "owner_email" },
                { name: "updated_by_id" },
                { name: "updated_by_username" },
                { name: "deleted_at" },
                { name: "items_updated_at" },
                { name: "items_updated_by_id" },
                { name: "items_updated_by_username" },
            ],
        }); 
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function refreshChecklists() {
    folderDs.checklists?.refresh();
}

onIonViewDidLeave(() => {
    dataSources.manager?.removeDataObject('folder');
    dataSources.manager?.removeDataObject('folder_checklists');
    folderDs.folder = null;
    folderDs.checklists = null;
});
</script>