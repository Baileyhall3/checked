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
                    <div class="h-full overflow-auto">
                        <Tabs ref="notificationTabs" v-model="activeTab" defaultValue="tab-unread" class="items-center w-full" @update:model-value="handleTabSwitch">
                            <TabsList class="bg-gray-200 w-full">
                                <TabsTrigger value="tab-unread">Unread</TabsTrigger>
                                <TabsTrigger value="tab-read">Read</TabsTrigger>
                            </TabsList>

                            <!-- Bulk Actions -->
                            <transition name="fade-slide">
                                <div class="w-full" v-if="allowSelection">
                                    <SelectionControl 
                                        :selectedIds="selectedIds" 
                                        :allIds="allIds"
                                        @selectAll="selectAll"
                                        @deselectAll="selectAll(false)"
                                        @select-cancelled="allowSelection = false" 
                                    >
                                        <template #actions>
                                            <ButtonGroup>
                                                <ButtonGroup class="ml-3">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200"
                                                        :title="activeTab === 'tab-unread' ? 'Mark selected items as read' : 'Mark selected items as unread'"
                                                        @click="applyBulkUpdates('read')"
                                                    >
                                                        <BellMinus :size="16" aria-hidden="true" v-if="activeTab === 'tab-unread'" />
                                                        <BellDot :size="16" aria-hidden="true" v-else-if="activeTab === 'tab-read'" />
                                                    </Button>
                                                    <ButtonGroupSeparator />
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        class="rounded-xl shadow-none bg-white hover:bg-gray-200 text-red-500"
                                                        aria-label="Delete items"
                                                        title="Delete selected items"
                                                        @click="applyBulkUpdates('delete')"
                                                    >
                                                        <Trash :size="16" aria-hidden="true" />
                                                    </Button>
                                                </ButtonGroup>
                                            </ButtonGroup>
                                        </template>
                                    </SelectionControl>
                                </div>
                            </transition>

                            <TabsContent value="tab-unread" class="w-full">
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
                                        <NotificationCard 
                                            :notif="notif" 
                                            :notifications-data="dataSources.unreadNotifications" 
                                            :allowSelection="allowSelection" 
                                            :isSelected="selectedIds.has(notif.id)"
                                            @selection-changed="updateSelected"
                                        />
                                    </div>
                                </RoundedContainer>
                            </TabsContent>
                            <TabsContent value="tab-read" class="w-full">
                                <RoundedContainer class=" flex flex-col">
                                    <div 
                                        v-for="(notif, index) in dataSources.readNotifications?.data" 
                                        :key="notif.id"
                                        class="flex flex-col p-2 w-full"
                                        :class="{ 'border-b' : index !== (dataSources.readNotifications?.data?.length - 1) }"
                                    >
                                        <NotificationCard 
                                            :notif="notif" 
                                            :notifications-data="dataSources.readNotifications" 
                                            :allowSelection="allowSelection" 
                                            :isSelected="selectedIds.has(notif.id)"
                                            @selection-changed="updateSelected"
                                        />
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
            description="Are you sure you would like to delete all notifications? This cannot be undone."
            ref="confirmDeleteAllDialog" 
            confirm-text="Delete"
            confirm-type="delete"
            @confirmed="deleteAll"
        />

        <Confirm
            title="Please Confirm"
            :description="`Are you sure you would like to delete ` + selectedIds.size + ` selected notifications? This cannot be undone.`"
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
import { ref, computed } from 'vue';
import { onIonViewDidEnter } from '@ionic/vue';
import { SortConfig, WhereClause } from 'supabase-dataobject-core';
import { dataSources } from '@/api/dataObjects';
import { Check, Trash, Ellipsis, Bell, Settings2, BellDot, BellMinus } from "lucide-vue-next";
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
import SelectionControl from '@/components/custom/UI/selectionControl/SelectionControl.vue';
import { useSelectionControl } from '@/components/custom/UI/selectionControl/useSelectionControl';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'

const confirmDeleteAllDialog = ref();
const confirmDeleteSelectedDialog = ref();

type TabKey = 'tab-unread' | 'tab-read';

const isLoading = ref(true);
const searchQuery = ref('');
const currentSort = ref<'recent' | 'name' | 'created'>('recent');
const baseWhereClauases = ref<WhereClause[]>([]);
const notificationTabs = ref();
const activeTab = ref<TabKey>('tab-unread');

const activeDataSource = computed(() => {
    return activeTab.value === 'tab-unread' 
        ? dataSources.unreadNotifications 
        : dataSources.readNotifications;
});

const allIds = computed(() =>
    activeDataSource.value?.data?.map(i => i.id) ?? []
)

const {
        isAllSelected,
        selectedIds,
        allowSelection,
        selectAll,
        isIndeterminate,
        updateSelected
    } = useSelectionControl(allIds.value);

const { toast } = useToast();

onIonViewDidEnter(async () => {
    await dataSources.unreadNotifications?.refresh();
    // baseWhereClauases.value = dataSources.notifications?.whereClauses;
    isLoading.value = false;
});

function handleTabSwitch(newValue: TabKey) {
    activeTab.value = newValue;
    selectedIds.value.clear();
    allowSelection.value = false;
}

async function applyBulkUpdates(action: 'read' | 'delete') {
    if (action === 'read') {
        const ids = Array.from(selectedIds.value);
        const fieldUpdate = {'read': activeTab.value === 'tab-unread' ? true : false };
        try {
            await activeDataSource.value?.bulkUpdate(ids, fieldUpdate, false);
            selectedIds.value = new Set();
            allowSelection.value = false;
            if (activeTab.value === 'tab-unread') {
                await dataSources.readNotifications?.refresh();
            } else {
                await dataSources.unreadNotifications?.refresh();
            }
            toast({
                title: `${ids.length} items marked as ${fieldUpdate.read ? 'read' : 'unread'}.`
            });
        } catch (err) {
            toast({
                title: 'Failed to update notifications.',
                variant: "destructive"
            });
        }
    } else if (action === 'delete') {
        confirmDeleteSelectedDialog.value.open();
    }
    selectedIds.value.clear();
    await activeDataSource.value?.refresh();
}

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

async function deleteSelected() {
    try {
        const ids = Array.from(selectedIds.value);
        await activeDataSource.value?.bulkDelete(ids);
        selectedIds.value = new Set();
        allowSelection.value = false;
        toast({
            title: `${ids.length} notifications deleted.`
        });
    } catch (err) {
        toast({
            title: 'Failed to delete notifications.',
            variant: "destructive"
        });
    }
}

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