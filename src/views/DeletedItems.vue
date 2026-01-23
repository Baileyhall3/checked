<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Loading v-if="isLoading" />
            <template v-else>
                <BlurredHeader>
                    <template #center>
                        <span class="text-lg font-semibold truncate flex items-center gap-2">
                            Deleted Checklists
                        </span>
                    </template>
                    <template #rightSide>
                        <ProfileDropdown />
                    </template>
                </BlurredHeader>
                <MainContent>
                    <Empty 
                        v-if="dataSources.deletedChecklists?.data.length === 0 && !searchQuery && !dataSources.deletedChecklists.state.isRefreshing"
                        class="p-6 mb-8" 
                    >
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ListTodo />
                            </EmptyMedia>
                            <EmptyTitle>No Deleted Checklists Yet</EmptyTitle>
                            <EmptyDescription>
                                You do not have any deleted checklists yet.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                Go back <router-link to="/home">home</router-link>.
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
                                                    Recently Deleted
                                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'recent'" />
                                                </DropdownMenuItem>
                                                <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('name')">
                                                    Name
                                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'name'" />
                                                </DropdownMenuItem>
                                                <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('created')">
                                                    Date Created
                                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'created'" />
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
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger class="cursor-pointer">
                                                        <RotateCcw class="size-4 opacity-60 me-2" aria-hidden="true" />
                                                        Recover
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem 
                                                                class="cursor-pointer" 
                                                                :disabled="selectedChecklistIds.size === 0"
                                                                @click="recoverSelected()"
                                                            >
                                                                Selected ({{ selectedChecklistIds.size }})
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem class="cursor-pointer" @click="recoverAll()">
                                                                All
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger class="cursor-pointer text-red-600">
                                                        <Trash class="size-4 opacity-60 me-2" aria-hidden="true" />
                                                        Delete
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem 
                                                                class="cursor-pointer" 
                                                                :disabled="selectedChecklistIds.size === 0"
                                                                @click="confirmDeleteSelectedDialog.show()"
                                                            >
                                                                Selected ({{ selectedChecklistIds.size }})
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                class="cursor-pointer"
                                                                @click="confirmDeleteAllDialog.show()">
                                                                All
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </ButtonGroup>
                                </ButtonGroup>
                            </div>
                        </div>
                    </template>
                    <div v-if="dataSources.deletedChecklists && dataSources.deletedChecklists?.data.length > 0">
                        <RoundedContainer class=" flex flex-col">
                            <template v-for="(checklist, index) in dataSources.deletedChecklists?.data" :key="checklist.id">
                                <Checklist 
                                    :checklist="checklist" 
                                    :checklist-data="dataSources.deletedChecklists"
                                    hide-deleted-icon
                                    hideFolder
                                    hideItemsCount
                                    allowSelection
                                    @selection-changed="updateSelected"
                                />
                            </template>
                        </RoundedContainer>
                    </div>
                </MainContent>
            </template>
        </IonContent>
        
        <Confirm
            title="Please Confirm"
            description="Are you sure you would like to delete all checklists? This cannot be undone."
            ref="confirmDeleteAllDialog" 
            confirm-text="Delete"
            confirm-type="delete"
            @confirmed="deleteAll"
        />

        <Confirm
            title="Please Confirm"
            :description="`Are you sure you would like to delete ` + selectedChecklistIds.size + ` selected checklists? This cannot be undone.`"
            ref="confirmDeleteSelectedDialog" 
            confirm-text="Delete"
            confirm-type="delete"
            @confirmed="deleteSelected"
        />
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
import { ref } from 'vue';
import { onIonViewDidEnter } from '@ionic/vue';
import { SortConfig, WhereClause } from 'supabase-dataobject-core';
import { dataSources } from '@/api/dataObjects';
import { Home, Settings, Check, ArrowUpDown, ListTodo, RotateCcw, Trash } from "lucide-vue-next";
import RoundedContainer from '@/components/RoundedContainer.vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import Loading from '@/components/custom/UI/Loading.vue';
import ProfileDropdown from '@/components/custom/ProfileDropdown.vue';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import Checklist from '@/components/custom/UI/Checklist.vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Confirm from '@/components/dialogs/Confirm.vue';
import { supabase } from "@/api/supabase";
import { useToast } from '@/components/ui/toast';
import MainContent from '@/components/custom/UI/MainContent.vue';

const confirmDeleteAllDialog = ref();
const confirmDeleteSelectedDialog = ref();

const isLoading = ref(true);
const searchQuery = ref('');
const selectedChecklistIds = ref<Set<number>>(new Set())
const currentSort = ref<'recent' | 'name' | 'created'>('recent');
const baseWhereClauases = ref<WhereClause[]>([]);

const { toast } = useToast();

onIonViewDidEnter(async () => {
    await dataSources.deletedChecklists?.refresh();
    baseWhereClauases.value = dataSources.deletedChecklists?.whereClauses;
    isLoading.value = false;
});

function updateSort(sortBy: 'recent' | 'name' | 'created') {
    currentSort.value = sortBy;
    let sortConfig: SortConfig;
    if (sortBy === 'recent') {
        sortConfig = { field: 'deleted_at', direction: 'desc' };
    } else if (sortBy === 'name') {
        sortConfig = { field: 'name', direction: 'asc' };
    } else if (sortBy === 'created') {
        sortConfig = { field: 'created_at', direction: 'desc' };
    }
    dataSources.deletedChecklists?.updateSort(sortConfig);
}

function updateSelected(isChecked: boolean, checklistId: number) {
    if (isChecked) {
        selectedChecklistIds.value.add(checklistId);
    } else {
        selectedChecklistIds.value.delete(checklistId);
    }
}

function handleSearchQuery(query: string) {
    searchQuery.value = query;
    const whereClauses: WhereClause[] = [];
    whereClauses.push(...baseWhereClauases.value);
    if (searchQuery.value) {
        whereClauses.push({ field: 'name', operator: 'ilike', value: searchQuery.value });
    }   
    dataSources.deletedChecklists!.whereClauses = whereClauses;
    dataSources.deletedChecklists?.refresh();
}

async function recoverSelected() {
    await supabase.rpc('recover_checklists', {
        ids: Array.from(selectedChecklistIds.value)
    });

    selectedChecklistIds.value.clear();
    await dataSources.deletedChecklists?.refresh();
    toast({
        title: 'Selected checklists recovered.',
    });
}

async function recoverAll() {
    await supabase.rpc('recover_checklists');
    selectedChecklistIds.value.clear();
    await dataSources.deletedChecklists?.refresh();
    toast({
        title: 'All checklists recovered.',
    });
}

async function deleteSelected() {
    await supabase.rpc('hard_delete_checklists', {
        ids: Array.from(selectedChecklistIds.value)
    });

    selectedChecklistIds.value.clear();
    await dataSources.deletedChecklists?.refresh();
    toast({
        title: 'Selected checklists deleted.',
    });
}

async function deleteAll() {
    await supabase.rpc('hard_delete_checklists');
    selectedChecklistIds.value.clear();
    await dataSources.deletedChecklists?.refresh();
    toast({
        title: 'All checklists deleted.',
    });
}

</script>