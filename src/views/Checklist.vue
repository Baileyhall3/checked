<template>
    <IonPage>
        <IonContent>
            <Loading v-if="isLoading" />
            <template v-else>
                <template v-if="checklistDs.checklist && checklistDs.checklist.data.length">
                    <BlurredHeader :background="resolvedTheme?.config.header.background + '80'"
                        :text-color="resolvedTheme?.config.header.text"
                    >
                        <template #center>
                            <span class="text-lg font-semibold truncate flex items-center gap-2">
                                <DefaultStar type="checklist" :id="checklistDs.checklist.currentRecord?.id" />
                                {{ checklistDs.checklist.currentRecord?.name }}
                            </span>
                        </template>
                        <template #rightSide>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        class="rounded-full"
                                        aria-label="Open settings"
                                    >
                                        <Ellipsis :size="16" aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <ChecklistDropdownContent 
                                    label="Checklist Details"
                                    :checklist="checklistDs.checklist.currentRecord"
                                    :checklist-data="checklistDs.checklist"
                                    redirectOnDelete
                                />
                            </DropdownMenu>
                        </template>
                        <!-- <Breadcrumbs :items="breadcrumbs" :text-color="resolvedTheme?.config.header.text" :muted-color="resolvedTheme?.config.text.muted" /> -->
                    </BlurredHeader>
                    <MainContent>
                        <div class="w-full flex mb-4">
                            <SearchBar @search-entered="handleSearchQuery" />
                            <ButtonGroup>
                                <ButtonGroup class="ml-3">
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
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateSort('recent')">
                                                Most Recent
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'recent'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateSort('name')">
                                                Name
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'name'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateSort('priority')">
                                                Priority
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'priority'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateSort('dueDate')">
                                                Due Date
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.currentSort === 'dueDate'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuLabel>Show</DropdownMenuLabel>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateView('progressBar')">
                                                Progress Bar
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.itemsView.progressBar" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateView('createNew')">
                                                New Item Input
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.itemsView.createNew" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateView('checked')">
                                                Checked Items
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.itemsView.checked" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="layout.updateView('deleted')">
                                                Deleted Items
                                                <Check class="size-4" aria-hidden="true" v-if="preferences.itemsView.deleted" />
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
                                        <ChecklistDropdownContent 
                                            label="Checklist Details"
                                            :checklist="checklistDs.checklist.currentRecord"
                                            :checklist-data="checklistDs.checklist"
                                            redirectOnDelete
                                        />
                                    </DropdownMenu>
                                </ButtonGroup>
                            </ButtonGroup>
                        </div>
                        <div class="flex flex-col space-y-3">
                            <!-- Checklist deleted notice -->
                            <div class="bg-white rounded-md border px-4 py-3 shadow-md" v-if="checklistDs.checklist.currentRecord?.deleted_at">
                                <div
                                    class="flex flex-col justify-between gap-3 md:flex-row md:items-center"
                                >
                                    <div>
                                        <p class="text-sm">
                                            This checklist was deleted {{ DateUtils.toDateTime(checklistDs.checklist.currentRecord?.deleted_at) }} by {{ checklistDs.checklist.currentRecord?.deleted_by_username }}
                                        </p>
                                        <p class="text-sm">
                                            <span class="font-bold">
                                                {{ 30 - DateUtils.dateDiff(new Date(checklistDs.checklist.currentRecord?.deleted_at), new Date()) }} 
                                            </span>
                                            days until checklist is permanently deleted.
                                        </p>
                                    </div>
                                    <div class="flex gap-2 max-md:flex-wrap">
                                        <Button size="sm" @click="recoverChecklist">Recover</Button>
                                        <Button variant="destructive" size="sm" @click="deleteChecklist">Delete</Button>
                                    </div>
                                </div>
                            </div>
                            <!-- Checklist Progress Bar -->
                             <transition name="fade-slide">
                                 <div v-if="checklistDs.checklistItems?.data?.length && preferences.itemsView.progressBar" class="mb-4">
                                     <div class="flex justify-between text-sm text-gray-600 mb-1">
                                         <span>Progress</span>
                                         <span>{{ completedCount }} / {{ totalCount }}</span>
                                     </div>
     
                                     <div
                                         class="bg-gray-200 h-2 w-full overflow-hidden rounded-full"
                                         role="progressbar"
                                         :aria-valuenow="progressPercent"
                                         aria-valuemin="0"
                                         :aria-valuemax="100"
                                         aria-label="Checklist progress"
                                     >
                                         <div
                                             class="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                             :style="{ width: `${progressPercent}%` }"
                                         ></div>
                                     </div>
                                 </div>
                             </transition>

                            <!-- Add New Item Input -->
                            <transition name="fade-slide">
                                <div v-if="preferences.itemsView.createNew && !checklistDs.checklist.currentRecord?.deleted_at" class="flex items-center my-4">
                                    <input
                                        v-model="newItemName"
                                        type="text"
                                        placeholder="New checklist item..."
                                        class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        @keyup.enter="addItem"
                                    />
                                    <AddNewBtn class="ms-2" add-terminology="Add" @add-clicked="addItem" />
                                </div>
                            </transition>

                            <!-- Checklist Items -->
                            <template v-for="(item, index) in checklistDs.checklistItems?.data" :key="item.id">
                                <ChecklistItem :item="item" :checklistData="checklistDs.checklistItems" />
                            </template>
                        </div>
                    </MainContent>
                </template>
                <div class="flex justify-center h-full" v-else-if="checklistDs.checklist?.state.isReady">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <X />
                            </EmptyMedia>
                            <EmptyTitle>Checklist Not Found</EmptyTitle>
                            <EmptyDescription>
                                The checklist you are trying to access does not exist, or you may not have access to it.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div class="flex gap-2">
                                <RouterLink :to="`/home`">
                                    <Button>
                                        Home
                                    </Button>
                                </RouterLink>
                            </div>
                            <EmptyDescription>
                                Need help? <a href="#">View tutorial</a>
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                </div>
            </template>
        </IonContent>

        <EnterPIN 
            ref="enterPinDialog" 
            :item="checklistDs.checklist?.currentRecord" 
            type="checklist" 
            @pin-accepted="initOthersDs"
        />
        <CreateChecklist 
            ref="createChecklistDialog" 
            :folder="{id: checklistDs.checklist?.currentRecord?.folder_id, name: checklistDs.checklist?.currentRecord?.folder_name}" 
            @checklist-created="refreshChecklists" 
        />
    </IonPage>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { createDataObject, DataObject, SortConfig, WhereClause } from 'supabase-dataobject-core';
import { IonContent, IonPage, onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { reactive, ref, computed } from 'vue';
import { dataSources, checklistFields, checklistItemsFields } from '@/api/dataObjects';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { Folder, Home, X, ArrowUpDown, Check, Settings, Ellipsis } from "lucide-vue-next";
import {
DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator ,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import DateUtils from '@/utils/DateUtils';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import ChecklistItemDetails from '@/components/dialogs/ChecklistItemDetails.vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import Loading from '@/components/custom/UI/Loading.vue';
import ProfileDropdown from '@/components/custom/ProfileDropdown.vue';
import Breadcrumbs from '@/components/custom/UI/Breadcrumbs.vue';
import type { IBreadcrumbItem } from '@/components/custom/UI/Breadcrumbs.vue';
import ChecklistDetails from '@/components/dialogs/ChecklistDetails.vue';
import Confirm from '@/components/dialogs/Confirm.vue';
import ChecklistItem from '@/components/custom/UI/ChecklistItem.vue';
import ChecklistDropdownContent from '@/components/custom/UI/ChecklistDropdownContent.vue';
import EnterPIN from '@/components/dialogs/EnterPIN.vue';
import AddNewBtn from '@/components/custom/UI/buttons/AddNewBtn.vue';
import ChecklistLayout, { ChecklistSort } from '@/layouts/ChecklistLayoutManager';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { useThemes } from '@/composables/useThemes';
import MainContent from '@/components/custom/UI/MainContent.vue';
import SideBarTrigger from '@/components/custom/UI/sideBar/SideBarTrigger.vue';
import DefaultStar from '@/components/custom/UI/DefaultStar.vue';

const route = useRoute();
const router = useRouter();

const enterPinDialog = ref();

const isLoading = ref<boolean>(true);
const { toast } = useToast();

const layout = ref<ChecklistLayout>();
const preferences = ref<any>();
const searchQuery = ref<string>('');
const sortConfig = ref<SortConfig>({field: 'created_at', direction: 'desc'});
const whereClauses = ref<WhereClause[]>([]);

const { resolveTheme, themeToCssVars } = useThemes()

const resolvedTheme = computed(() =>
    resolveTheme(checklistDs.checklist?.currentRecord?.theme_id ?? null)
)

const themeStyle = computed(() =>
    themeToCssVars(resolvedTheme.value)
)

const checklistDs = reactive({
    checklist: null as DataObject | null,
    checklistItems: null as DataObject | null,
    folderChecklistsLkp: null as DataObject | null
});

// const totalCount = computed(() => checklistDs.checklist?.currentRecord?.items_count || 0);
// const completedCount = computed(() => checklistDs.checklist?.currentRecord?.items_checked_count || 0);
// const progressPercent = computed(() => {
//     const current = checklistDs.checklist?.currentRecord;
//     return completedCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)
// });

const totalCount = computed(() => checklistDs.checklistItems?.data?.length || 0);
const completedCount = computed(() => checklistDs.checklistItems?.data?.filter((item: any) => item.is_checked)?.length || 0);
const progressPercent = computed(() => {
    return totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100);
});

onIonViewDidEnter(() => {
    const idParam = route.params.id
    const id = Number(idParam)

    if (isNaN(id)) {
        console.error('Invalid checklist ID:', idParam)
        return;
    }

    if (dataSources.user?.currentRecord) {
        dataSources.user.currentRecord.last_opened_type = 'checklist';
        dataSources.user.currentRecord.last_opened_id = id;
        dataSources.user?.saveChanges();
    }

    const checklistLayout = new ChecklistLayout({
        key: `checklist-${id}-layout`, 
        onPreferenceUpdated: (preference, value) => {
            if (preference == 'currentSort') {
                updateSort(value);
            } else if (['progressBar', 'createNew', 'checked', 'deleted'].includes(preference)) {
                if (preference === 'checked' || preference === 'deleted') {
                    updateWhereClauses();
                }
            }
        }
    });

    layout.value = checklistLayout;
    preferences.value = checklistLayout.preferences;
    updateSort(layout.value.preferences.currentSort, true);
    updateWhereClauses(true);

    createDataObjects(id);
});

async function createDataObjects(id: number) {
    try {
        isLoading.value = true;

        const checklistData = await createDataObject('checklist', {
            viewName: 'checklists_view',
            tableName: 'checklists',
            canInsert: false,
            canUpdate: true,
            canDelete: true,
            whereClauses: [
                { field: 'id', operator: 'equals', value: id }
            ],
            fields: checklistFields,
            recordLimit: 1
        }); 

        if (checklistData?.data.length) {
            checklistDs.checklist = checklistData;
        }

        if (checklistDs.checklist?.currentRecord?.pin_protected_at) {
            enterPinDialog.value.show();
        } else {
            await initOthersDs();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

async function initOthersDs() {
    try {
        isLoading.value = true;
        if (checklistDs.checklist?.currentRecord?.folder_name) {
            checklistDs.folderChecklistsLkp = await createDataObject('folder_checklists_lkp', {
                viewName: 'checklists_view',
                masterDataObjectBinding: {
                    masterDataObjectId: 'checklist',
                    childBindingField: 'folder_id',
                    masterBindingField: 'folder_id'
                },
                sort: { field: "created_at", direction: 'desc' },
                whereClauses: [
                    { field: 'deleted_at', operator: 'isnull' }
                ],
                fields: [
                    { name: "id" },
                    { name: "name" },
                    { name: "created_at" },
                    { name: "folder_id" },
                    { name: "folder_name" },
                    { name: "owner_id" },
                    { name: "deleted_at" }
                ],
            }); 
        }

        checklistDs.checklistItems = await createDataObject('checklist_items', {
            viewName: 'checklist_items_view',
            tableName: 'checklist_items',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            whereClauses: whereClauses.value,
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            sort: sortConfig.value,
            fields: checklistItemsFields
        }); 
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

const newItemName = ref("");
async function addItem() {
    if (newItemName.value.trim() === "") return;
    try {
        checklistDs.checklistItems?.insert({
            name: newItemName.value, 
            is_checked: false,
            checklist_id: checklistDs.checklist?.currentRecord?.id,
        });
    } catch (err) {
        toast({
            title: 'Failed to create checklist item',
            variant: "destructive"
        });
    }
    newItemName.value = "";
}

function updateSort(value: ChecklistSort, pSkipUpdate = false) {
    switch(value) {
        case 'priority':
            sortConfig.value.field = 'priority';
            sortConfig.value.direction = 'asc';
            break;
        case 'name':
            sortConfig.value.field = 'name';
            sortConfig.value.direction = 'asc';
            break;
        case 'recent':
            sortConfig.value.field = 'created_at';
            sortConfig.value.direction = 'desc';
            break;
        case 'dueDate':
            sortConfig.value.field = 'due_date';
            sortConfig.value.direction = 'asc';
            break;
    }
    if (!pSkipUpdate) {
        checklistDs.checklistItems?.updateSort(sortConfig.value);
    }
}

function handleSearchQuery(query: string) {
    searchQuery.value = query;
    updateWhereClauses();
}

function updateWhereClauses(pSkipUpdate = false) {
    whereClauses.value = [];
    if (!preferences.value.itemsView.checked) {
        whereClauses.value.push({ field: 'is_checked', operator: 'equals', value: false });
    }
    if (!preferences.value.itemsView.deleted) {
        whereClauses.value.push({ field: 'deleted_at', operator: 'isnull' });
    }
    if (searchQuery.value) {
        whereClauses.value.push({ field: 'name', operator: 'ilike', value: searchQuery.value });
    }
    if (!pSkipUpdate) {
        checklistDs.checklistItems.whereClauses = whereClauses.value;
    }
}

function redirect() {
    const current = checklistDs.checklist?.currentRecord;
    if (current) {
        if (current.folder_id) {
            router.push(`/folder/${current.folder_id}`);
        } else {
            router.push('/home');
        }
    }
}

async function deleteChecklist() {
    const current = checklistDs.checklist?.currentRecord;
    if (!current) { return; }
    await checklistDs.checklist?.delete(current.id);
    redirect();
    toast({
        title: 'Checklist permanently deleted.',
    });
}

async function recoverChecklist() {
    const current = checklistDs.checklist?.currentRecord;
    if (current) {
        await checklistDs.checklist?.update(current.id, {
            deleted_at: null
        });
        toast({
            title: 'Checklist recovered.',
        });
    }
}

function refreshChecklists() {
    checklistDs.folderChecklistsLkp?.refresh();
}

onIonViewDidLeave(() => {
    dataSources.manager?.removeDataObject('checklist');
    dataSources.manager?.removeDataObject('checklist_items');
    dataSources.manager?.removeDataObject('folder_checklists_lkp')
    checklistDs.checklist = null;
    checklistDs.checklistItems = null;
    checklistDs.folderChecklistsLkp = null;
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.25s ease;
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
.checklist-root {
    background-color: var(--bg-main);
    color: var(--text-primary);
}
</style>