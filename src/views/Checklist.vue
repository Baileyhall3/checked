<template>
    <IonPage>
        <IonContent>
            <Loading v-if="isLoading" />
            <template v-else>
                <template v-if="checklistDs.checklist && checklistDs.checklist.data.length">
                    <BlurredHeader>
                        <div class="flex justify-between items-center">
                            <Breadcrumbs :items="breadcrumbs" />
                            <ProfileDropdown />
                        </div>
                        
                        <div class="w-full flex">
                            <SearchBar />
                            
                            <ButtonGroup>
                                <ButtonGroup class="ml-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                class="rounded-xl shadow-none"
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
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('name')">
                                                Name
                                                <Check class="size-4" aria-hidden="true" v-if="currentSort === 'name'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Show</DropdownMenuLabel>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="updateView('checked')">
                                                Checked Items
                                                <Check class="size-4" aria-hidden="true" v-if="itemsView.checked" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="updateView('deleted')">
                                                Deleted Items
                                                <Check class="size-4" aria-hidden="true" v-if="itemsView.deleted" />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <ButtonGroupSeparator />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                class="rounded-xl shadow-none"
                                                aria-label="Open settings"
                                            >
                                                <Settings :size="16" aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <ChecklistDropdownContent 
                                            label="Checklist Details"
                                            :checklist="checklistDs.checklist.currentRecord"
                                            :checklist-data="checklistDs.checklist"
                                        />
                                    </DropdownMenu>
                                </ButtonGroup>
                            </ButtonGroup>
                        </div>
                    </BlurredHeader>
                    <div class="min-h-screen bg-gray-100">
                        <div class="container mx-auto px-6 pt-2 pb-6">
                            <template v-if="!isLoading">
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
                                                <Button size="sm">Recover</Button>
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Checklist Progress Bar -->
                                    <div v-if="checklistDs.checklistItems?.data?.length" class="mt-4 mb-6">
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
        
                                    <!-- Add New Item Input -->
                                    <transition name="fade-slide">
                                        <div v-if="showAddInput && !checklistDs.checklist.currentRecord?.deleted_at" class="flex items-center space-x-2">
                                            <input
                                                v-model="newItemName"
                                                type="text"
                                                placeholder="New checklist item..."
                                                class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                @keyup.enter="addItem"
                                            />
                                            <Button @click="addItem" class="text-white rounded-xl">
                                                Add
                                            </Button>
                                        </div>
                                    </transition>
        
                                    <!-- Checklist Items -->
                                    <template v-for="(item, index) in checklistDs.checklistItems?.data" :key="item.id">
                                        <ChecklistItem :item="item" :checklistData="checklistDs.checklistItems" />
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>
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

        <ChecklistItemDetails 
            ref="itemDetailsDialog" 
            :checklist-item="checklistDs.checklistItems?.currentRecord" 
            :data-object="checklistDs.checklistItems" 
        />
        <ChecklistDetails
            ref="checklistDetailsDialog"
            :checklist="checklistDs.checklist?.currentRecord"
            :data-object="checklistDs.checklist"
        />
        <Confirm
            description="Are you sure you want to delete this checklist? Deleted checklists can be recovered for 30 days. Checklist items will not be editable."
            ref="confirmDialog" 
            @confirmed="handleChecklistDelete"
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
import { 
    Folder, 
    Home, 
    X,
    ArrowUpDown,
    Check,
    Settings,
} from "lucide-vue-next";
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

const route = useRoute();
const router = useRouter();
const itemDetailsDialog = ref();
const checklistDetailsDialog = ref();
const confirmDialog = ref();
const isLoading = ref<boolean>(true);
const { toast } = useToast();

const currentSort = ref<'recent' | 'name'>('recent');
const itemsView = reactive({
    checked: true,
    deleted: false,
});

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

const breadcrumbs = computed((): IBreadcrumbItem[] => {
    const items = [
        { label: "Home", icon: Home, href: "/home" },
    ];

    if (checklistDs.checklist?.currentRecord?.folder_name) {
        items.push({
            label: checklistDs.checklist.currentRecord.folder_name,
            icon: Folder,
            href: `/folder/${checklistDs.checklist.currentRecord.folder_id}`,
            dropdown: checklistDs.folderChecklistsLkp?.data?.map(c => ({
                label: c.name,
                href: `/checklist/${c.id}`,
            })),
        });
    }

    if (checklistDs.checklist?.currentRecord?.name) {
        items.push({
            label: checklistDs.checklist.currentRecord?.name,
        });
    }

    return items;
});

onIonViewDidEnter(() => {
    const idParam = route.params.id
    const id = Number(idParam)

    if (isNaN(id)) {
        console.error('Invalid checklist ID:', idParam)
        return
    }

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
            // checklistDs.checklist?.on("fieldChanged", (record, updates) => {
            //     if ('name' in updates) {
            //         checklistDs.checklist?.saveChanges();
            //     }
            // })
        }
        
        if (checklistData?.currentRecord?.folder_name) {
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
            whereClauses: [
                { field: 'deleted_at', operator: 'isnull' }
            ],
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            sort: { field: "created_at", direction: 'desc' },
            fields: checklistItemsFields
        }); 

        checklistDs.checklistItems?.on("fieldChanged", (record, updates) => {
            if ('name' in updates) {
                checklistDs.checklistItems?.saveChanges(); // causing issues with saving in details dialog
            }
        })
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

const showAddInput = ref(true);
const newItemName = ref("");

// function toggleAddInput() {
//     showAddInput.value = !showAddInput.value;
// }

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
    // showAddInput.value = false;
}

function updateSort(sort: 'recent' | 'name') {
    currentSort.value = sort;
    const sortConfig: SortConfig = sort === 'recent' ? { field: "created_at", direction: 'desc' } : { field: "name", direction: 'asc' };
    checklistDs.checklistItems?.updateSort(sortConfig);
}

function updateView(key: 'checked' | 'deleted') {
    itemsView[key] = !itemsView[key];
    const whereClauses: WhereClause[] = [];
    if (!itemsView.checked) {
        whereClauses.push({ field: 'is_checked', operator: 'equals', value: false });
    }
    if (!itemsView.deleted) {
        whereClauses.push({ field: 'deleted_at', operator: 'isnull' });
    }
    checklistDs.checklistItems.whereClauses = whereClauses
}

async function handleChecklistDelete() {
    const current = checklistDs.checklist?.currentRecord;
    if (!current) { return; }
    const hasUpdated = checklistDs.checklist?.update(current?.id, { deleted_at: new Date() });
    if (hasUpdated) {
        toast({
            title: 'Checklist deleted.',
            description: 'Deleted items are recoverable for 30 days.',
        });
    }
    if (current.folder_id) {
        router.push(`/folder/${current.folder_id}`);
    } else {
        router.push(`/home`);
    }
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
</style>