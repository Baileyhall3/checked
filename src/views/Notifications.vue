<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Loading v-if="isLoading" />
            <template v-else>
                <BlurredHeader>
                    <template #center>
                        <span class="text-lg font-semibold truncate flex items-center gap-2">
                            Notifications
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
                            <DropdownMenuContent>
                                <RouterLink to="/preferences">
                                    <DropdownMenuItem class="cursor-pointer">
                                        <Settings2 class="size-4" aria-hidden="true" />
                                        Preferences
                                    </DropdownMenuItem>
                                </RouterLink>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem class="cursor-pointer justify-between" @click="updateSort('priority')">
                                    Priority
                                    <Check class="size-4" aria-hidden="true" v-if="currentSort === 'priority'" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </template>
                </BlurredHeader>
                <MainContent>
                    
                        <!-- <div class="flex items-center space-x-2 mb-4 justify-between">
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
                        </div> -->
                        <div class="h-full overflow-auto">
                            <Tabs defaultValue="tab-1" class="items-center w-full">
                                <TabsList class="bg-gray-200 w-full">
                                    <TabsTrigger value="tab-1">Unread</TabsTrigger>
                                    <TabsTrigger value="tab-2">Read</TabsTrigger>
                                </TabsList>
                                <TabsContent value="tab-1" class="w-full">
                                    <Empty v-if="dataSources.unreadNotifications?.data.length === 0" class="p-6 mb-8">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Bell />
                                            </EmptyMedia>
                                            <EmptyTitle>No Unread Notifications Yet</EmptyTitle>
                                            <EmptyDescription>
                                                You do not have any unread notifications yet.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <EmptyDescription>
                                                Go back <router-link to="/home">home</router-link>.
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                    <RoundedContainer class="w-full flex flex-col" v-else>
                                        <div 
                                            v-for="(notif, index) in dataSources.unreadNotifications?.data" 
                                            :key="notif.id"
                                            class="flex flex-col p-2 w-full"
                                            :class="{ 'border-b' : index !== (dataSources.unreadNotifications?.data?.length - 1) }"
                                        >
                                            <NotificationCard :notif="notif" :notifications-data="dataSources.unreadNotifications" />
                                        </div>
                                    </RoundedContainer>
                                </TabsContent>
                                <TabsContent value="tab-2" class="w-full">
                                    <RoundedContainer class=" flex flex-col">
                                        <div 
                                            v-for="(notif, index) in dataSources.readNotifications?.data" 
                                            :key="notif.id"
                                            class="flex flex-col p-2 w-full"
                                            :class="{ 'border-b' : index !== (dataSources.readNotifications?.data?.length - 1) }"
                                        >
                                            <NotificationCard :notif="notif" :notifications-data="dataSources.readNotifications" />
                                        </div>
                                    </RoundedContainer>
                                </TabsContent>
                            </Tabs>
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
import { Home, Settings, Check, ArrowUpDown, ListTodo, RotateCcw, Trash, Ellipsis, Bell, Settings2 } from "lucide-vue-next";
import RoundedContainer from '@/components/RoundedContainer.vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import Loading from '@/components/custom/UI/Loading.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import Confirm from '@/components/dialogs/Confirm.vue';
import { supabase } from "@/api/supabase";
import { useToast } from '@/components/ui/toast';
import MainContent from '@/components/custom/UI/MainContent.vue';
import NotificationCard from '@/components/custom/UI/NotificationCard.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const confirmDeleteAllDialog = ref();
const confirmDeleteSelectedDialog = ref();

const isLoading = ref(true);
const searchQuery = ref('');
const selectedChecklistIds = ref<Set<number>>(new Set())
const currentSort = ref<'recent' | 'name' | 'created'>('recent');
const baseWhereClauases = ref<WhereClause[]>([]);

const { toast } = useToast();

onIonViewDidEnter(async () => {
    await dataSources.notifications?.refresh();
    baseWhereClauases.value = dataSources.notifications?.whereClauses;
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
    dataSources.notifications?.updateSort(sortConfig);
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
    dataSources.notifications!.whereClauses = whereClauses;
    dataSources.notifications?.refresh();
}

async function recoverSelected() {
    await supabase.rpc('recover_checklists', {
        ids: Array.from(selectedChecklistIds.value)
    });

    selectedChecklistIds.value.clear();
    await dataSources.notifications?.refresh();
    toast({
        title: 'Selected checklists recovered.',
    });
}

async function recoverAll() {
    await supabase.rpc('recover_checklists');
    selectedChecklistIds.value.clear();
    await dataSources.notifications?.refresh();
    toast({
        title: 'All checklists recovered.',
    });
}

async function deleteSelected() {
    await supabase.rpc('hard_delete_checklists', {
        ids: Array.from(selectedChecklistIds.value)
    });

    selectedChecklistIds.value.clear();
    await dataSources.notifications?.refresh();
    toast({
        title: 'Selected checklists deleted.',
    });
}

async function deleteAll() {
    await supabase.rpc('hard_delete_checklists');
    selectedChecklistIds.value.clear();
    await dataSources.notifications?.refresh();
    toast({
        title: 'All checklists deleted.',
    });
}

</script>