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
                                >
                                    <template #additionalActionItems>
                                        <DropdownMenuItem class="cursor-pointer" @click="copyItems()">
                                            <Clipboard class="size-4" aria-hidden="true" />
                                            Copy to Clipboard
                                        </DropdownMenuItem>
                                    </template>
                                </ChecklistDropdownContent>
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
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateSort('recent')">
                                                Most Recent
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.currentSort === 'recent'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateSort('name')">
                                                Name
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.currentSort === 'name'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateSort('priority')">
                                                Priority
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.currentSort === 'priority'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateSort('dueDate')">
                                                Due Date
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.currentSort === 'dueDate'" />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateSort('custom')">
                                                Sort Order
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.currentSort === 'custom'" />
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
                                                <SlidersHorizontal :size="16" aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Show</DropdownMenuLabel>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('progressBar')">
                                                Progress Bar
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.itemsView.progressBar" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('createNew')">
                                                New Item Input
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.itemsView.createNew" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('checked')">
                                                Checked Items
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.itemsView.checked" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('deleted')">
                                                Deleted Items
                                                <Check class="size-4" aria-hidden="true" v-if="checklistState.preferences.itemsView.deleted" />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <!-- <ButtonGroupSeparator />
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                        aria-label="Enter select mode"
                                        @click="allowSelection = !allowSelection"
                                    >
                                        <SquareX :size="16" aria-hidden="true" v-if="allowSelection" />
                                        <SquareCheck :size="16" aria-hidden="true" v-else />
                                    </Button> -->
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
                                <div v-if="checklistDs.checklistItems?.data?.length && checklistState.preferences.itemsView.progressBar" class="pb-4">
                                    <ProgressBar :total-count="totalCount" :completed-count="completedCount" />
                                </div>
                            </transition>

                            <!-- Add New Item Input -->
                            <transition name="fade-slide">
                                <div v-if="checklistState.preferences.itemsView.createNew && !checklistDs.checklist.currentRecord?.deleted_at" class="pb-4">
                                    <AddItem v-model="newItemName" @add-clicked="addItem" @finished-voice-recording="createVoiceChecklistItem" />
                                </div>
                            </transition>

                            <!-- Bulk Actions -->
                            <transition name="fade-slide">
                                <div class="pb-4" v-if="allowSelection">
                                    <div class="flex items-center justify-between pb-4">
                                        <div>
                                            <span class="font-semibold">
                                                {{ selectedItemIds.size }} selected
                                            </span>
                                        </div>
                                        <div>
                                            <ButtonGroup>
                                                <ButtonGroup class="ml-3">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200 text-green-600"
                                                        aria-label="Mark as checked"
                                                    >
                                                        <Check :size="16" aria-hidden="true" />
                                                    </Button>
                                                    <ButtonGroupSeparator />
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                        aria-label="Move items"
                                                        >
                                                        <MoveLeft :size="16" aria-hidden="true" />
                                                    </Button>
                                                    <ButtonGroupSeparator />
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200 text-red-500"
                                                        aria-label="Delete items"
                                                    >
                                                        <Trash :size="16" aria-hidden="true" />
                                                    </Button>
                                                    <ButtonGroupSeparator />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                                aria-label="Bulk actions"
                                                            >
                                                                <Ellipsis :size="16" aria-hidden="true" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('progressBar')">
                                                                Set Priority
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('createNew')">
                                                                Set Due Date
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem class="cursor-pointer justify-between" @click="checklistState.layout.updateView('checked')">
                                                                Lock
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </ButtonGroup>
                                            </ButtonGroup>
                                        </div>
                                    </div>
                                    <div class="justify-between flex items-center">
                                        <div class="flex items-center gap-2">
                                            <Checkbox 
                                                id="selectAll"
                                                :model-value="selectedItemIds.size === allIds.length"
                                                :indeterminate="isIndeterminate"
                                                @update:model-value="selectAll"
                                            />
                                            <span class="text-sm">
                                                {{ selectedItemIds.size === allIds.length ? 'Unelect All' : 'Select All' }}
                                            </span>
                                        </div>
                                        <div>
                                            <Button variant="secondary" @click="allowSelection = false">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </transition>

                            <!-- Checklist Items -->
                             <div class="flex flex-col gap-3" ref="checklistEl">
                                <ChecklistItem 
                                    v-for="(item, index) in checklistDs.checklistItems?.data" :key="item.id"
                                    :item="item" 
                                    :checklistData="checklistDs.checklistItems" 
                                    :allowSelection="allowSelection"
                                    :isSelected="selectedItemIds.has(item.id)"
                                    @selection-changed="updateSelected"
                                />
                             </div>
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
import { reactive, ref, computed, watch, nextTick, onMounted } from 'vue';
import { dataSources, checklistFields, checklistItemsFields } from '@/api/dataObjects';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { X, ArrowUpDown, Check, Ellipsis, SlidersHorizontal, Clipboard, SquareCheck, SquareX, Trash, MoveLeft } from "lucide-vue-next";
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
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import Loading from '@/components/custom/UI/Loading.vue';
import ChecklistItem from '@/components/custom/UI/ChecklistItem.vue';
import ChecklistDropdownContent from '@/components/custom/UI/ChecklistDropdownContent.vue';
import EnterPIN from '@/components/dialogs/EnterPIN.vue';
import ChecklistLayout, { ChecklistSort, ChecklistPreferences } from '@/layouts/ChecklistLayoutManager';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { useThemes } from '@/composables/useThemes';
import MainContent from '@/components/custom/UI/MainContent.vue';
import DefaultStar from '@/components/custom/UI/DefaultStar.vue';
import Sortable from 'sortablejs';
import AddItem from '@/components/custom/UI/input/AddItem.vue';
import ProgressBar from '@/components/custom/UI/ProgressBar.vue';
import { Checkbox } from "@/components/ui/checkbox";

const route = useRoute();
const router = useRouter();

const enterPinDialog = ref();
const sortableInstance = ref<Sortable | null>(null)
const checklistEl = ref<HTMLElement | null>(null)
const allowSelection = ref<boolean>(false);
const selectedItemIds = ref<Set<number>>(new Set())

const isLoading = ref<boolean>(true);
const { toast } = useToast();

const checklistState = reactive<{
    layout: ChecklistLayout;
    preferences: ChecklistPreferences;
    searchQuery: string;
    sortConfig: SortConfig<any>[];
    whereClauses: WhereClause<any>[];
}>({
    layout: null,
    preferences: null,
    searchQuery: '',
    sortConfig: [
        { field: 'created_at', direction: 'desc' },
        { field: 'sort_order', direction: 'desc' }
    ],
    whereClauses: []
});

const { resolveTheme, themeToCssVars } = useThemes()

const resolvedTheme = computed(() =>
    resolveTheme(checklistDs.checklist?.currentRecord?.theme_id ?? null)
)

const themeStyle = computed(() =>
    themeToCssVars(resolvedTheme.value)
)

const allIds = computed(() =>
    checklistDs.checklistItems?.data?.map(i => i.id) ?? []
)

const isIndeterminate = computed(() =>
    selectedItemIds.value.size > 0 &&
    selectedItemIds.value.size < allIds.value.length
)

const checklistDs = reactive({
    checklist: null as DataObject<any> | null,
    checklistItems: null as DataObject<any> | null,
    folderChecklistsLkp: null as DataObject<any> | null
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

watch(allowSelection, val => {
    if (!val) selectedItemIds.value = new Set()
});

watch(
  () => [
    isLoading.value,
    checklistDs.checklistItems?.data?.length
  ],
  async ([loading, len]) => {
    if (loading) return
    if (!len) return

    await nextTick()   // wait for DOM to exist

    if (!checklistEl.value) return

    // Prevent duplicate instances
    if ((checklistEl.value as any)._sortable) return

    sortableInstance.value = Sortable.create(checklistEl.value, {
      animation: 150,
      forceFallback: true,
      draggable: '.checklist-item',

      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'drag-dragging',

      disabled: checklistState.preferences.currentSort !== 'custom',

      onEnd: async (evt) => {
        if (evt.oldIndex === evt.newIndex) return
        await handleReorder(evt.oldIndex!, evt.newIndex!)
      }
    });
  }
)

onIonViewDidEnter(async() => {
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
        onPreferenceUpdated: (preference, pValue) => {
            if (preference == 'currentSort') {
                const isCustom = pValue === 'custom'
                if (sortableInstance.value) {
                    sortableInstance.value.option('disabled', !isCustom);
                }
                updateSort(pValue);
            } else if (['progressBar', 'createNew', 'checked', 'deleted'].includes(preference)) {
                if (preference === 'checked' || preference === 'deleted') {
                    updateWhereClauses();
                }
            }
        }
    });

    checklistState.layout = checklistLayout;
    checklistState.preferences = checklistLayout.preferences;
    updateSort(checklistState.layout.preferences.currentSort, true);
    updateWhereClauses(true);

    await createDataObjects(id);

    const isCustom = checklistState.layout.preferences.currentSort === 'custom'
    if (sortableInstance.value) {
        sortableInstance.value.option('disabled', !isCustom);
    }
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
            whereClauses: checklistState.whereClauses,
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            sort: checklistState.sortConfig,
            fields: checklistItemsFields,
            allowedBuckets: ['checklist-item-voice-notes']
        }); 

        console.log('dataaaa ', checklistDs.checklist)
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

const newItemName = ref("");
async function createVoiceChecklistItem(blob: Blob) {
  const checklistItemsDs = checklistDs.checklistItems
  if (!checklistItemsDs) return

  const userId = dataSources.user?.currentRecord?.auth_id;
  if (!userId) { return; }

  const created = await checklistItemsDs.insert({
    checklist_id: checklistDs.checklist?.currentRecord?.id,
    name: 'Voice note'
  })

  if (!created) return

  const itemId = created.id

  // 2️⃣ Build file path
  const fileName = `${crypto.randomUUID()}.webm`
  const filePath = `${userId}/${itemId}/${fileName}`

  // 3️⃣ Upload using DataObjectStorage
  await checklistItemsDs.storage.uploadToBucket(
    'checklist-item-voice-notes',
    filePath,
    blob,
    {
      contentType: 'audio/webm'
    }
  )

  // 4️⃣ Update item with voice path
  await checklistItemsDs.update(itemId, {
    voice_note_path: filePath
  })
}

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
    const itemsSort = []
    switch(value) {
        case 'priority':
            itemsSort.push({ field: 'priority', direction: 'asc' });
            break;
        case 'name':
            itemsSort.push({ field: 'name', direction: 'asc' });
            break;
        case 'recent':
            itemsSort.push({ field: 'created_at', direction: 'desc' });
            break;
        case 'dueDate':
            itemsSort.push({ field: 'due_date', direction: 'desc' });
            break;
        case 'custom':
            break;
    }
    itemsSort.push({ field: 'sort_order', direction: 'desc' });
    checklistState.sortConfig = itemsSort;
    console.log('sorta ', checklistState.sortConfig)
    if (!pSkipUpdate) {
        checklistDs.checklistItems?.updateSort(checklistState.sortConfig);
    }
}

function handleSearchQuery(query: string) {
    checklistState.searchQuery = query;
    updateWhereClauses();
}

function updateWhereClauses(pSkipUpdate = false) {
    checklistState.whereClauses = []
    if (!checklistState.preferences.itemsView.checked) {
        checklistState.whereClauses.push({ field: 'is_checked', operator: 'equals', value: false });
    }
    if (!checklistState.preferences.itemsView.deleted) {
        checklistState.whereClauses.push({ field: 'deleted_at', operator: 'isnull' });
    }
    if (checklistState.searchQuery) {
        checklistState.whereClauses.push({ field: 'name', operator: 'ilike', value: checklistState.searchQuery });
    }
    if (!pSkipUpdate) {
        checklistDs.checklistItems.whereClauses = checklistState.whereClauses;
    }
}

async function handleReorder(oldIndex: number, newIndex: number) {
    const sorted = checklistDs.checklistItems?.data;

    if (!sorted) { return; }

    const movedItem = sorted[oldIndex]

    // Remove from old position
    sorted.splice(oldIndex, 1)

    // Insert into new position
    sorted.splice(newIndex, 0, movedItem)

    const newSortOrder = calculateSortOrder(sorted, newIndex)

    // Optimistic update
    movedItem.sort_order = newSortOrder

    try {
        movedItem.save();
    } catch (e) {
        console.error('Reorder failed', e)
        // Optional: reload list if needed
    }
}

function calculateSortOrder(items: any[], index: number): number {
    const prev = items[index - 1]
    const next = items[index + 1]

    // Dropped at top (highest sort_order)
    if (!prev && next) {
        return next.sort_order + 1000
    }

    // Dropped at bottom (lowest sort_order)
    if (prev && !next) {
        return prev.sort_order - 1000
    }

    // Only item
    if (!prev && !next) {
        return 1000
    }

    // Between two items
    const gap = prev.sort_order - next.sort_order

    if (gap <= 1) {
        console.warn('Gap collapsed — normalization required')
        // You can trigger normalization here if desired
    }

    return Math.floor((prev.sort_order + next.sort_order) / 2)
}

function copyItems() {
    const itemsData = checklistDs.checklistItems?.data;
    if (!itemsData) { return; }
    const titles = itemsData
        .filter(i => !i.deleted_at)
        .map(i => i.name)
        .join('\n')

    navigator.clipboard.writeText(titles)
    toast({
        title: 'Items copied to clipboard.',
    });
}

function selectAll(val: boolean) {
    selectedItemIds.value = val ? new Set(allIds.value) : new Set()
}

function updateSelected(isSelected: boolean, checklistId: number) {
    if (!allowSelection.value && isSelected && selectedItemIds.value.size === 0) {
        allowSelection.value = true;
    } else if (allowSelection.value && !isSelected && selectedItemIds.value.size === 1) {
        allowSelection.value = false;
    }
    if (isSelected) {
        selectedItemIds.value.add(checklistId);
    } else {
        selectedItemIds.value.delete(checklistId);
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

.drag-ghost {
  opacity: 0.4;
}

.drag-chosen {
  cursor: grabbing;
}

.drag-dragging {
  transform: rotate(1deg);
}
</style>