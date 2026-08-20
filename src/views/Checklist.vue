<template>
    <IonPage>
        <IonContent class="ion-content-no-scroll">
            <div class="h-full flex flex-col">
                <Loading v-if="isLoading" />
                <template v-else>
                    <template v-if="checklistDs.checklist && checklistDs.checklist.data.length">
                        <BlurredHeader :background="resolvedTheme?.config.header.background + '80'"
                            :text-color="resolvedTheme?.config.header.text"
                        >
                            <template #center>
                                <div class="text-lg font-semibold truncate flex items-center gap-2">
                                    <DefaultStar type="checklist" :id="checklistDs.checklist.currentRecord?.id" />
                                    <span title="Checklist is a template" v-if="checklistDs.checklist.currentRecord?.is_template">
                                        <LayoutList class="size-4 opacity-60" aria-hidden="true" />
                                    </span>
                                    {{ checklistDs.checklist.currentRecord?.name }}
                                </div>
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
                                        :readonly="!isOwner"
                                    >
                                        <template #additionalActionItems>
                                            <DropdownMenuItem v-if="canEdit" class="cursor-pointer" @click="$refs.importItemsDialog?.show()">
                                                <Import class="size-4 opacity-60" aria-hidden="true" />
                                                Import Items
                                            </DropdownMenuItem>
                                            <DropdownMenuItem class="cursor-pointer" @click="copyItems()">
                                                <Clipboard class="size-4 opacity-60" aria-hidden="true" />
                                                Copy to Clipboard
                                            </DropdownMenuItem>
                                            <template v-if="!isOwner">
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem class="cursor-pointer" @click="leaveChecklist()">
                                                    <LogOut class="size-4 opacity-60" aria-hidden="true" />
                                                    Leave Checklist
                                                </DropdownMenuItem>
                                            </template>
                                        </template>
                                    </ChecklistDropdownContent>
                                </DropdownMenu>
                            </template>
                        </BlurredHeader>
                        <div class="h-full bg-gray-100 flex flex-col overflow-hidden">
                            <div class="container mx-auto p-2 h-full flex flex-col overflow-hidden">
                                <div class="shrink-0 p-2">
                                    <div class="w-full flex mb-4 justify-between">
                                        <SearchBar @search-entered="handleSearchQuery" animateSearch />
                                        <ButtonGroup>
                                            <ButtonGroup class="ml-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                            aria-label="Open sort"
                                                        >
                                                            <ArrowUpDown :size="16" aria-hidden="true" />
                                                            <span v-if="!isMobile">Sort</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuRadioGroup v-model="checklistState.preferences.currentSort">
                                                            <DropdownMenuRadioItem value="recent" @click="checklistState.layout.updateSort('recent')" class="cursor-pointer">Most Recent</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="name" @click="checklistState.layout.updateSort('name')" class="cursor-pointer">Name</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="priority" @click="checklistState.layout.updateSort('priority')" class="cursor-pointer">Priority</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="dueDate" @click="checklistState.layout.updateSort('dueDate')" class="cursor-pointer">Due Date</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="custom" @click="checklistState.layout.updateSort('custom')" class="cursor-pointer">Sort Order</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuRadioGroup v-model="checklistState.preferences.sortDirection">
                                                            <DropdownMenuRadioItem value="asc" @click="checklistState.layout.updateSortDirection('asc')" class="cursor-pointer">Ascending</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="desc" @click="checklistState.layout.updateSortDirection('desc')" class="cursor-pointer">Descending</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger inset class="cursor-pointer pl-8">Group By</DropdownMenuSubTrigger>
                                                            <DropdownMenuPortal>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuRadioGroup v-model="checklistState.preferences.groupBy">
                                                                        <DropdownMenuRadioItem value="priority" @click="checklistState.layout.updateGroupBy('priority')" class="cursor-pointer">Priority</DropdownMenuRadioItem>
                                                                        <DropdownMenuRadioItem value="due_date" @click="checklistState.layout.updateGroupBy('due_date')" class="cursor-pointer">Due Date</DropdownMenuRadioItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuRadioItem value="none" @click="checklistState.layout.updateGroupBy('none')" class="cursor-pointer">None</DropdownMenuRadioItem>
                                                                    </DropdownMenuRadioGroup>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenuSub>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <ButtonGroupSeparator />
                                                <!-- <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                            aria-label="Open filter dropdown"
                                                        >
                                                            <Funnel :size="16" aria-hidden="true" />
                                                            <span v-if="!isMobile">Filter</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Item Status</DropdownMenuLabel>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showProgressBar">
                                                            Checked
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showProgressBar">
                                                            Unchecked
                                                        </DropdownMenuCheckboxItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <ButtonGroupSeparator /> -->
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                            aria-label="Open settings"
                                                        >
                                                            <SlidersHorizontal :size="16" aria-hidden="true" />
                                                            <span v-if="!isMobile">Show</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuLabel>Show</DropdownMenuLabel>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showProgressBar">
                                                            Progress Bar
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showCreateNew">
                                                            New Item Input
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showChecked">
                                                            Checked Items
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showDeleted">
                                                            Deleted Items
                                                        </DropdownMenuCheckboxItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger inset class="cursor-pointer pl-8">Item Fields</DropdownMenuSubTrigger>
                                                            <DropdownMenuPortal>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showDescription">
                                                                        Description
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showPriority">
                                                                        Priority
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showDueDate">
                                                                        Due Date
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showMembers">
                                                                        Members
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showCreatedAt">
                                                                        Created At
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showCreatedBy">
                                                                        Created By
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showUpdatedAt">
                                                                        Updated At
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem class="cursor-pointer justify-between" v-model="checklistState.layout.showUpdatedBy">
                                                                        Updated By
                                                                    </DropdownMenuCheckboxItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenuSub>
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
                                            <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
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
                                                <ProgressBar :total-count="checklistDs.checklist?.currentRecord?._record.items_count" :completed-count="checklistDs.checklist?.currentRecord?._record.items_checked_count" />

                                                <!-- {{ checklistDs.checklist.currentRecord.items_checked_count }}
                                                {{ checklistDs.checklist.currentRecord._record.items_checked_count }} -->
                                            </div>
                                        </transition>
            
                                        <!-- Add New Item Input -->
                                        <transition name="fade-slide">
                                            <div v-if="checklistDs.checklistItems?.options.canInsert && checklistState.preferences.itemsView.createNew && !checklistDs.checklist.currentRecord?.deleted_at && !allowSelection" class="pb-4">
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
                                                                    title="Mark selected items as checked"
                                                                    @click="applyBulkUpdates('is_checked', true)"
                                                                >
                                                                    <Check :size="16" aria-hidden="true" />
                                                                </Button>
                                                                <ButtonGroupSeparator />
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                                    aria-label="Move items"
                                                                    title="Move selected items to new checklist"
                                                                >
                                                                    <MoveLeft :size="16" aria-hidden="true" class="opacity-60" />
                                                                </Button>
                                                                <ButtonGroupSeparator />
                                                                <Button
                                                                    size="icon"
                                                                    variant="secondary"
                                                                    class="rounded-xl shadow-none bg-white hover:bg-gray-200 text-red-500"
                                                                    aria-label="Delete items"
                                                                    title="Delete selected items"
                                                                    @click="applyBulkUpdates('deleted_at', new Date())"
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
                                                                        <DropdownMenuItem class="cursor-pointer justify-between">
                                                                            Set Priority
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem class="cursor-pointer justify-between">
                                                                            Set Due Date
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem class="cursor-pointer justify-between" @click="applyBulkUpdates('locked_at', new Date())">
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
                                    </div>

                                </div>
                                <div class="flex-1 p-2 overflow-y-auto min-h-0 checklist-scroll" ref="checklistEl">
                                    <!-- Checklist items grouped -->
                                    <template v-if="checklistDs.checklistItems?.hasGroupBy">
                                        <div v-for="checklist in checklistDs.checklistItems?.groupedData" :key="checklist.groupValue" class="mb-8">
                                            <ChecklistItemsGroup
                                                :checklist-data="checklistDs.checklistItems"
                                                :items="checklist.records"
                                                collapsible
                                            >
                                                <template #header>
                                                    <div v-if="checklistState.preferences.groupBy === 'priority'" class="flex gap-2 items-center">
                                                        <template v-if="checklist.groupValue">
                                                            <ItemPriorityCircle :priority="checklist.groupValue" />
                                                            <span v-if="checklist.groupValue === 1">High</span>
                                                            <span v-else-if="checklist.groupValue === 2">Medium</span>
                                                            <span v-else-if="checklist.groupValue === 3">Low</span>
                                                        </template>
                                                        <span v-else>None</span>
                                                    </div>
                                                    <template v-else>
                                                    <span v-if="checklist.groupValue === null || !checklist.groupValue">None</span>
                                                    <!-- <span v-else>{{ DateUtils.toDate(checklist.groupValue) }}</span> -->
                                                    <span v-else>{{ checklist.groupValue }}</span>
                                                    </template>
                                                </template>
                                            </ChecklistItemsGroup>
                                        </div>
                                     </template>

                                    <!-- Checklist Items -->
                                    <div class="flex flex-col gap-3" v-else>
                                        <ChecklistItem 
                                            v-for="(item, index) in checklistDs.checklistItems?.data" :key="item.id"
                                            :disabled="!checklistDs.checklistItems?.options.canUpdate"
                                            :item="item" 
                                            :checklistData="checklistDs.checklistItems" 
                                            :allowSelection="allowSelection"
                                            :isSelected="selectedItemIds.has(item.id)"
                                            :fields-view="checklistState.layout.preferences.itemFieldsView"
                                            @selection-changed="updateSelected"
                                        />
                                    </div>
                                </div>
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
            </div>
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
        <ImportItems 
            ref="importItemsDialog"
            :checklist="checklistDs.checklist?.currentRecord"
            @items-imported="checklistDs.checklistItems?.refresh()"
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
import { 
    X, 
    ArrowUpDown, 
    Check, 
    Ellipsis, 
    SlidersHorizontal, 
    Clipboard, 
    SquareCheck, 
    LayoutList, 
    Trash, 
    MoveLeft, 
    Import, 
    LogOut,
    Funnel 
} from "lucide-vue-next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator ,
    DropdownMenuLabel,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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
import ChecklistLayout, { ChecklistSort, ChecklistPreferences, ChecklistItemFieldsView, ChecklistGroupByField } from '@/layouts/ChecklistLayoutManager';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { useThemes } from '@/composables/useThemes';
import MainContent from '@/components/custom/UI/MainContent.vue';
import DefaultStar from '@/components/custom/UI/DefaultStar.vue';
import Sortable from 'sortablejs';
import AddItem from '@/components/custom/UI/input/AddItem.vue';
import ProgressBar from '@/components/custom/UI/ProgressBar.vue';
import { Checkbox } from "@/components/ui/checkbox";
import ImportItems from '@/components/dialogs/ImportItems.vue';
import { useWindowSize } from "@vueuse/core";
import { userStore } from '@/store/userStore';
import { supabase } from '@/api/supabase.js';
import ChecklistItemsGroup from '@/components/custom/ChecklistItemsGroup.vue';
import { GroupByConfig } from 'supabase-dataobject-core/dist/types';
import ItemPriorityCircle from '@/components/custom/UI/ItemPriorityCircle.vue';

const route = useRoute();
const router = useRouter();

const enterPinDialog = ref();
const sortableInstance = ref<Sortable | null>(null)
const checklistEl = ref<HTMLElement | null>(null)
const allowSelection = ref<boolean>(false);
const selectedItemIds = ref<Set<number>>(new Set());
const canEdit = ref<boolean>(false);
const progressBarKey = ref<number>(0);

const isLoading = ref<boolean>(true);
const { toast } = useToast();

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const checklistState = reactive<{
    layout: ChecklistLayout;
    preferences: ChecklistPreferences;
    searchQuery: string;
    sortConfig: SortConfig<any>[];
    whereClauses: WhereClause<any>[];
    groupBy: GroupByConfig<any> | undefined;
}>({
    layout: null,
    preferences: null,
    searchQuery: '',
    sortConfig: [
        { field: 'created_at', direction: 'desc' },
        { field: 'sort_order', direction: 'desc' }
    ],
    whereClauses: [],
    groupBy: undefined
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

const totalCount = computed(() => checklistDs.checklist?.currentRecord?.items_count || 0);
const completedCount = computed(() => checklistDs.checklist?.currentRecord?.items_checked_count || 0);

// const progressPercent = computed(() => {
//     const current = checklistDs.checklist?.currentRecord;
//     return completedCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)
// });

// const totalCount = computed(() => checklistDs.checklistItems?.data?.length || 0);
// const completedCount = computed(() => checklistDs.checklistItems?.data?.filter((item: any) => item.is_checked)?.length || 0);
// const progressPercent = computed(() => {
//     return totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100);
// });

const isOwner = computed(() => checklistDs.checklist?.currentRecord?.owner_id === userStore.userProfile?.id);

const checklistDs = reactive({
    checklist: null as DataObject<any> | null,
    checklistItems: null as DataObject<any> | null,
    folderChecklistsLkp: null as DataObject<any> | null,
    checklistMembers: null as DataObject<any> | null
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
            console.log('Preference updated:', preference, pValue);
            if (preference == 'currentSort') {
                const isCustom = pValue === 'custom'
                if (sortableInstance.value) {
                    sortableInstance.value.option('disabled', !isCustom);
                }
                updateSort(pValue, checklistState.layout.preferences.sortDirection ?? 'desc');
            } else if (preference == 'sortDirection') {
                updateSort(checklistState.layout.preferences.currentSort, pValue);
            } else if (['progressBar', 'createNew', 'checked', 'deleted'].includes(preference)) {
                if (preference === 'checked' || preference === 'deleted') {
                    updateWhereClauses();
                }
            }  else if (preference == 'groupBy') {
                updateGroupBy(pValue);
            }
        }
    });

    checklistState.layout = checklistLayout;
    checklistState.preferences = checklistLayout.preferences;
    updateSort(checklistState.layout.preferences.currentSort, checklistState.layout.preferences.sortDirection ?? 'asc', true);
    updateWhereClauses(true);
    updateGroupBy(checklistState.layout.preferences.groupBy, true);

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

        checklistDs.checklist = checklistData;
        if (checklistData?.data.length == 0) {
            isLoading.value = false;
            return;
        }

        if (checklistDs.checklist?.currentRecord?.pin_protected_at) {
            enterPinDialog.value.show();
        } else {
            await initOthersDs();
            const checklistName = checklistDs.checklist?.currentRecord?.name ?? 'Checked';
            document.title = checklistName;
            // window.breadcrumb.setBreadCrumb(checklistName);
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
        // TODO: Make this an RPC call
        checklistDs.checklistMembers = await createDataObject('checklist_members', {
            viewName: 'checklist_members_view',
            tableName: 'checklist_members',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            fields: [
                { name: "id" },
                { name: "checklist_id" },
                { name: "user_id" },
                { name: "username" },
                { name: "role" },
                { name: "added_at" },
                { name: "owner_id" },
                { name: "owner" },
                { name: "profile_picture_url" },
                { name: "bg_colour" },
            ]
        }); 

        const currentUserMember = checklistDs.checklistMembers?.data.find((m: any) => m.user_id === userStore.userProfile?.id);
        if (currentUserMember) {
            canEdit.value = currentUserMember.role === 'owner' || currentUserMember.role === 'editor';
        }

        // if (checklistDs.checklist?.currentRecord?.folder_name) {
        //     checklistDs.folderChecklistsLkp = await createDataObject('folder_checklists_lkp', {
        //         viewName: 'checklists_view',
        //         masterDataObjectBinding: {
        //             masterDataObjectId: 'checklist',
        //             childBindingField: 'folder_id',
        //             masterBindingField: 'folder_id'
        //         },
        //         sort: { field: "created_at", direction: 'desc' },
        //         whereClauses: [
        //             { field: 'deleted_at', operator: 'isnull' }
        //         ],
        //         fields: [
        //             { name: "id" },
        //             { name: "name" },
        //             { name: "created_at" },
        //             { name: "folder_id" },
        //             { name: "folder_name" },
        //             { name: "owner_id" },
        //             { name: "deleted_at" }
        //         ],
        //     }); 
        // }

        checklistDs.checklistItems = await createDataObject('checklist_items', {
            viewName: 'checklist_items_view',
            tableName: 'checklist_items',
            canInsert: canEdit.value,
            canUpdate: canEdit.value,
            canDelete: canEdit.value,
            whereClauses: checklistState.whereClauses,
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            sort: checklistState.sortConfig,
            fields: checklistItemsFields,
            allowedBuckets: ['checklist-item-voice-notes'],
            groupBy: checklistState.groupBy,
            relationships: [
                {
                    name: "checklist_item_members_view",
                    alias: "members",
                    fields: [
                        "user_id",
                        "username",
                        "bg_colour",
                        "profile_picture_url"
                    ]
                }
            ]
        }); 

        console.log('Checklist items data:', checklistDs.checklistItems);

        checklistDs.checklistItems?.on('afterUpdate', async(record, updates) => {
            if (updates.is_checked !== undefined || updates.deleted_at !== undefined) {
                console.log('Checklist item:', checklistDs.checklist?.currentRecord.items_checked_count);
                await checklistDs.checklist?.currentRecord.refresh();
                console.log('Checklist item updated:', checklistDs.checklist?.currentRecord.items_checked_count);
                progressBarKey.value++
            }
        });
        checklistDs.checklistItems?.on('afterInsert', async(record) => {
            await checklistDs.checklist?.currentRecord.refresh();
        });
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

async function applyBulkUpdates(field: string, value: any) {
    const ids = Array.from(selectedItemIds.value);
    const fieldUpdate = {[field]: value};

    try {
        await checklistDs.checklistItems?.bulkUpdate(ids, fieldUpdate, false);
        selectedItemIds.value = new Set();
        allowSelection.value = false;
        toast({
            title: `${ids.length} items updated.`
        });
    } catch (err) {
        toast({
            title: 'Failed to update items',
            variant: "destructive"
        });
    }
}

function updateSort(value: ChecklistSort, direction: 'asc' | 'desc', pSkipUpdate = false) {
    const itemsSort = []
    switch(value) {
        case 'priority':
            itemsSort.push({ field: 'priority', direction: direction });
            break;
        case 'name':
            itemsSort.push({ field: 'name', direction: direction });
            break;
        case 'recent':
            itemsSort.push({ field: 'created_at', direction: direction });
            break;
        case 'dueDate':
            itemsSort.push({ field: 'due_date', direction: direction });
            break;
        case 'custom':
            break;
    }
    itemsSort.push({ field: 'sort_order', direction: direction });
    checklistState.sortConfig = itemsSort;
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

function updateGroupBy(field: ChecklistGroupByField, pSkipUpdate = false) {
    checklistState.groupBy = undefined;
    if (field === 'none') {
        checklistState.groupBy = undefined;
    } else if (field === 'priority' || field === 'due_date' || field === 'created_by') {
        checklistState.groupBy = { 
            field: field,  
            aggregates: {
                itemCount: { field: 'id', op: 'count' }
            }
        }
    }
    if (!pSkipUpdate) {
        checklistDs.checklistItems?.setGroupBy(checklistState.groupBy);
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

async function leaveChecklist() {
    try {
        const userRecord = checklistDs?.checklistMembers?.data?.find(x => x.user_id === userStore.userProfile?.id);
        if (!userRecord) { return; }
        const result = await checklistDs.checklistMembers?.delete(userRecord.id);
        if (result) {
            toast({
                title: 'Checklist left',
                description: `You are no longer a member of ${checklistDs.checklist?.currentRecord.name}.`
            });
            dataSources.sharedChecklists?.refresh();
            router.push('/home');
        } else {
            throw new Error(`Failed to leave checklist.`)
        }
    } catch(err) {
        console.error(err);
    }
}

function refreshChecklists() {
    checklistDs.folderChecklistsLkp?.refresh();
}

onIonViewDidLeave(() => {
    dataSources.manager?.removeDataObject('checklist');
    dataSources.manager?.removeDataObject('checklist_items');
    dataSources.manager?.removeDataObject('folder_checklists_lkp')
    dataSources.manager?.removeDataObject('checklist_members');
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

.checklist-scroll::-webkit-scrollbar {
    width: 6px;
}

.checklist-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.checklist-scroll::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.15);
    border-radius: 999px;
}

.checklist-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.25);
}

.checklist-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.15) transparent;
}
</style>