<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Loading v-if="isLoading" />
            <template v-else>
                <BlurredHeader>
                    <Breadcrumbs :items="breadcrumbs" />
                    <template #rightSide>
                        <div class="flex items-center gap-2">
                            <ProfileDropdown />
                        </div>
                    </template>
                </BlurredHeader>   
                <div class="min-h-screen bg-gray-100">
                    <div class="container mx-auto px-6 py-8">
                        <Empty 
                            v-if="folderDs.checklists?.data.length === 0 && !searchQuery && !folderDs.checklists.state.isRefreshing"
                            class="bg-white shadow-lg rounded-xl p-6 mb-8" 
                        >
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
                        <template v-else>
                            <div class="flex items-center space-x-2 mb-4 justify-between">
                                <div class="flex gap-2 w-full">
                                    <SearchBar @search-entered="handleSearchQuery" />
                                    <ButtonGroup>
                                        <ButtonGroup>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                        aria-label="Open sort"
                                                    >
                                                        <ArrowUpDown :size="16" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('recent')">
                                                        Most Recent
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'recent'" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('name')">
                                                        Name
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'name'" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('created')">
                                                        Date Created
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'created'" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuLabel>Show</DropdownMenuLabel>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateView('completed')">
                                                        Completed
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.checklistsView.completed" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateView('deleted')">
                                                        Deleted
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.checklistsView.deleted" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuLabel>View</DropdownMenuLabel>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateGroupBy('checklists')">
                                                        Checklists
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.listView === 'checklists'" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem class="cursor-pointer justify-between" @click="updateGroupBy('items')">
                                                        Checklist Items
                                                        <Check class="size-4" aria-hidden="true" v-if="preferences.listView === 'items'" />
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <ButtonGroupSeparator />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                        aria-label="Open settings"
                                                    >
                                                        <Settings :size="16" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <FolderDropdownContent 
                                                    label="Folder Actions"
                                                    :folder="folderDs.folder?.currentRecord"
                                                    :folder-data="folderDs.folder"
                                                />
                                            </DropdownMenu>
                                        </ButtonGroup>
                                    </ButtonGroup>
                                    <AddNewBtn @add-clicked="createChecklistDialog.show()" />
                                </div>
                            </div>
                        </template>
    
                        <div v-if="folderDs.checklists && folderDs.checklists?.data.length > 0 && preferences.listView == 'checklists'">
                            <RoundedContainer class=" flex flex-col">
                                <template v-for="(checklist, index) in folderDs.checklists?.data" :key="checklist.id">
                                    <Checklist 
                                        :checklist="checklist" 
                                        :checklist-data="folderDs.checklists" 
                                        hideFolder
                                    />
                                </template>
                            </RoundedContainer>
                        </div>
                        <template v-else-if="folderDs.checklistItems && folderDs.checklistItems?.data.length > 0">
                            <div v-for="checklist in folderDs.checklistItems?.groupedData" :key="checklist.groupValue" class="mb-8">
                                <ChecklistItemsGroup
                                    :checklist-data="folderDs.checklistItems"
                                    :items="checklist.records"
                                    collapsible
                                >
                                    <template #header>
                                        <ListTodo class="me-2" aria-hidden="true" />
                                        <RouterLink :to="`/checklist/${checklist.additionalFields.checklist_id}`" class="cursor-pointer hover:underline">
                                            {{ checklist.groupValue }}
                                        </RouterLink>
                                    </template>
                                </ChecklistItemsGroup>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </IonContent>

        <EnterPIN 
            ref="enterPinDialog" 
            :item="folderDs.folder?.currentRecord" 
            type="folder" 
            @pin-accepted="initChecklistsDs"
        />
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
import { useRoute } from 'vue-router';
import { useToast } from '@/components/ui/toast';
import { ref, reactive, computed } from 'vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { createDataObject, DataObject, SortConfig, WhereClause } from 'supabase-dataobject-core';
import { checklistFields, dataSources, folderFields, checklistItemsFields } from '@/api/dataObjects';
import { Folder, Home, Settings, Check, ArrowUpDown, ListTodo } from "lucide-vue-next";
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import Loading from '@/components/custom/UI/Loading.vue';
import ProfileDropdown from '@/components/custom/ProfileDropdown.vue';
import Breadcrumbs from '@/components/custom/UI/Breadcrumbs.vue';
import type { IBreadcrumbItem } from '@/components/custom/UI/Breadcrumbs.vue';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator ,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import Checklist from '@/components/custom/UI/Checklist.vue';
import FolderDropdownContent from '@/components/custom/UI/FolderDropdownContent.vue';
import EnterPIN from '@/components/dialogs/EnterPIN.vue';
import AddNewBtn from '@/components/custom/UI/buttons/AddNewBtn.vue';
import ChecklistItemsGroup from '@/components/custom/ChecklistItemsGroup.vue';
import FolderLayout from '@/layouts/FolderLayoutManager';
import type { FolderSort, FolderListView, ChecklistsView } from '@/layouts/FolderLayoutManager';

const enterPinDialog = ref();
const createChecklistDialog = ref();
const route = useRoute();
const isLoading = ref<boolean>(true);
const { toast } = useToast();

const layout = ref<FolderLayout>();
const preferences = ref<any>();

const searchQuery = ref('');

const folderDs = reactive({
    folder: null as DataObject | null,
    checklists: null as DataObject | null,
    checklistItems: null as DataObject | null
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
        return;
    }

    if (dataSources.user?.currentRecord) {
        dataSources.user.currentRecord.last_opened_type = 'folder';
        dataSources.user.currentRecord.last_opened_id = id;
        dataSources.user?.saveChanges();
    }

    const folderLayout = new FolderLayout({
        key: `folder-${id}-layout`, 
        onPreferenceUpdated: (preference, value) => {
            console.log('pref updated ', preference, value)
        }
    });

    layout.value = folderLayout;
    preferences.value = folderLayout.preferences;

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
            whereClauses: [
                { field: 'id', operator: 'equals', value: id }
            ],
            sort: { field: "created_at", direction: 'desc' },
            fields: folderFields,
            recordLimit: 1
        }); 

        if (folderData?.data.length) {
            folderDs.folder = folderData;
        }

        if (folderDs.folder?.currentRecord?.pin_protected_at) {
            enterPinDialog.value.show();
        } else {
            await initChecklistsDs();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

async function initChecklistsDs() {
    try {
        isLoading.value = true;
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
            whereClauses: [
                { field: 'deleted_at', operator: 'isnull' }
            ],
            sort: { field: "items_updated_at", direction: 'desc' },
            fields: checklistFields,
        }); 

        folderDs.checklistItems = await createDataObject('folder_checklist_items', {
            viewName: 'checklist_items_view',
            tableName: 'checklist_items',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            whereClauses: [
                { field: 'deleted_at', operator: 'isnull' }
            ],
            masterDataObjectBinding: {
                masterDataObjectId: 'folder',
                childBindingField: 'folder_id',
                masterBindingField: 'id'
            },
            sort: { field: "created_at", direction: 'desc' },
            fields: checklistItemsFields,
            autoRefresh: false,
            groupBy: { field: 'checklist', additionalFields: ['checklist_id'] }
        }); 

        if (preferences.value.listView === 'items') {
            await loadChecklistItems();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function handleSearchQuery(query: string) {
    searchQuery.value = query;
    updateWhereClauses();
}

// TODO: sort direction
function updateSort(sort: FolderSort) {
    layout.value?.updateSort(sort);
    let sortField = 'items_updated_at';
    if (sort === 'created') {
        sortField = 'created_at';
    } else if (sort === 'name') {
        sortField = 'name';
    }
    const sortConfig: SortConfig = { field: sortField, direction: 'desc' };
    folderDs.checklists?.updateSort(sortConfig);
}

function updateView(key: keyof ChecklistsView) {
    layout.value?.toggleView(key);
    updateWhereClauses();
}

function updateWhereClauses() {
    const whereClauses: WhereClause[] = [];
    if (!preferences.value.checklistsView.completed) {
        whereClauses.push({ field: 'is_checked', operator: 'equals', value: false });
    }
    if (!preferences.value.checklistsView.deleted) {
        whereClauses.push({ field: 'deleted_at', operator: 'isnull' });
    }
    if (searchQuery.value) {
        whereClauses.push({ field: 'name', operator: 'ilike', value: searchQuery.value });
    }

    if (preferences.value.listView === 'checklists') {
        folderDs.checklists.whereClauses = whereClauses;
    } else {
        folderDs.checklistItems.whereClauses = whereClauses;
    }
}

async function updateGroupBy(view: FolderListView) {
    layout.value?.updateGroupBy(view);
    if (view === 'items') {
        await loadChecklistItems();
    }
    updateWhereClauses();
}

async function loadChecklistItems() {
    try {
        isLoading.value = true;
        await folderDs.checklistItems?.refresh();
    } catch(err) {
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
    dataSources.manager?.removeDataObject('folder_checklist_items');
    folderDs.folder = null;
    folderDs.checklists = null;
    folderDs.checklistItems = null;
});
</script>