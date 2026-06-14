<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Loading v-if="isLoading" />
            <template v-else>
                <BlurredHeader>
                    <template #center>
                        <span class="text-lg font-semibold truncate flex items-center gap-2">
                            Friends
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
                                
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </template>
                </BlurredHeader>
                <MainContent>
                    <div class="h-full">
                        <Tabs ref="notificationTabs" v-model="activeTab" defaultValue="tab-friends" class="items-center w-full gap-4" @update:model-value="handleTabSwitch">
                            <TabsList class="bg-gray-200 w-full">
                                <TabsTrigger value="tab-friends">Friends</TabsTrigger>
                                <TabsTrigger value="tab-requests">
                                    Requests <span v-if="friendDs.requests?.data.length > 0" class="ml-1 bg-red-500 text-white text-[10px] font-medium leading-none transition-all duration-200 rounded-full min-w-[12px] h-3 px-1 flex items-center justify-center">
                                        {{ friendDs.requests.data.length }}
                                    </span>
                                    
                                </TabsTrigger>
                                <TabsTrigger value="tab-find">Find</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tab-friends" class="w-full">
                                <template v-if="dataSources.userFriends?.data.length === 0">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia>
                                                <Users :size="48" />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No Friends Yet
                                            </EmptyTitle>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <EmptyDescription>
                                                When you have friends, they'll show up here.
                                            </EmptyDescription>
                                            <div class="flex gap-2">
                                                <Button @click="activeTab = 'tab-find'">
                                                    Find Friends
                                                </Button>
                                            </div>
                                        </EmptyContent>
                                    </Empty>
                                </template>
                                <template v-else>
                                    <div class="w-full flex mb-4">
                                        <SearchBar @search-entered="handleSearchQuery" />
                                    </div>
                                    <div class="flex flex-col gap-4">
                                        <UserCard v-for="friend in dataSources.userFriends?.data" :key="friend.id" :user="friend" :userRowClass="'flex justify-between items-center'">
                                            <template #subtext="{ user }">
                                                <p class="text-sm text-gray-500">Friend since {{ DateUtils.toShortDayMonth(user.created_at) }}</p>
                                            </template>
                                             <template #actions="{ user }">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            class="opacity-60 active:opacity-100 rounded-full size-6"
                                                            aria-label="Open edit menu"
                                                        >
                                                            <Ellipsis :size="16" aria-hidden="true" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <UserFriendDropdownContent :friend="user" :friendDs="dataSources.userFriends" @friend-removed="handleFriendRemoved" />
                                                </DropdownMenu>
                                            </template>
                                        </UserCard>
                                    </div>
                                </template>
                            </TabsContent>
                            <TabsContent value="tab-requests" class="w-full">
                                <template v-if="friendDs.requests?.data.length === 0">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia>
                                                <UserPlus :size="48" />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No Friend Requests
                                            </EmptyTitle>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <EmptyDescription>
                                                When you have friend requests, they'll show up here.
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </Empty>
                                </template>
                                <template v-else>
                                    <div class="flex flex-col gap-4">
                                        <UserCard v-for="user in friendDs.requests?.data" :key="user.id" :user="user" user-row-class="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <template #subtext="{ user }">
                                                <p class="text-sm text-gray-500">Request {{ user.created_by_id == userStore.userProfile?.id ? 'sent' : 'received' }}: {{ DateUtils.toShortDate(user.created_at) }}</p>
                                            </template>
                                            <template #actions="{ user }">
                                                <div class="flex gap-2 w-full sm:w-auto">
                                                    <template v-if="user.created_by_id === userStore.userProfile?.id">
                                                        <Button size="sm" @click="cancelFriendRequest(user)" class="w-full sm:w-auto" variant="secondary">
                                                            Cancel Request
                                                        </Button>
                                                    </template>
                                                    <template v-else>
                                                        <Button variant="secondary" size="sm" @click="deleteFriendRequest(user)" class="w-full sm:w-auto">
                                                            Delete
                                                        </Button>
                                                        <Button size="sm" @click="acceptFriendRequest(user)" class="w-full sm:w-auto">
                                                            Confirm
                                                        </Button>
                                                    </template>
                                                </div>
                                            </template>
                                        </UserCard>
                                    </div>
                                </template>
                            </TabsContent>
                            <TabsContent value="tab-find" class="w-full">
                                <div class="w-full flex mb-4">
                                    <SearchBar @search-entered="handleSearchQuery" />
                                </div>
                                <div class="flex flex-col gap-4">
                                    <UserCard v-for="user in friendDs.userSearch?.data" :key="user.id" :user="user" user-row-class="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <template #subtext="{ user }">
                                            <template v-if="user.relationship_status === 'pending_outgoing' || user.relationship_status === 'pending_incoming'">
                                                <p class="text-sm text-gray-500">Request {{ user.created_by_id == userStore.userProfile?.id ? 'sent' : 'received' }}: {{ DateUtils.toShortDate(user.created_at) }}</p>
                                            </template>
                                            <template v-else-if="user.relationship_status === 'accepted'">
                                                <p class="text-sm text-gray-500">Friend since {{ DateUtils.toShortDayMonth(user.created_at) }}</p>
                                            </template>
                                        </template>
                                        <template #actions="{ user }">
                                            <template v-if="user.relationship_status == 'accepted'">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            class="opacity-60 active:opacity-100 rounded-full size-6"
                                                            aria-label="Open edit menu"
                                                        >
                                                            <Ellipsis :size="16" aria-hidden="true" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <UserFriendDropdownContent :friend="user" :friendDs="dataSources.userFriends" />
                                                </DropdownMenu>
                                            </template>
                                            <div class="flex gap-2 w-full sm:w-auto" v-else>
                                                <Button size="sm" @click="sendFriendRequest(user.id)" class="w-full sm:w-auto" v-if="user.relationship_status === 'none'">
                                                    Send Friend Request
                                                </Button>
                                                <Button size="sm" @click="cancelFriendRequest(user)" class="w-full sm:w-auto" variant="secondary" v-else-if="user.relationship_status === 'pending_outgoing'">
                                                    Cancel Request
                                                </Button>
                                                <template v-else-if="user.relationship_status === 'pending_incoming'">
                                                    <Button variant="secondary" size="sm" @click="deleteFriendRequest(user)" class="w-full sm:w-auto">
                                                        Delete
                                                    </Button>
                                                    <Button size="sm" @click="acceptFriendRequest(user)" class="w-full sm:w-auto">
                                                        Confirm
                                                    </Button>
                                                </template>
                                            </div>
                                        </template>
                                    </UserCard>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </MainContent>
            </template>
        </IonContent>
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
import { ref, computed, reactive } from 'vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { dataSources, friendFields } from '@/api/dataObjects';
import { Ellipsis, Users, UserX, TextAlignStart, UserPlus, ListTodo, User } from "lucide-vue-next";
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import BlurredHeader from '@/components/header/Blurred.vue';
import Loading from '@/components/custom/UI/Loading.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast, useToast } from '@/components/ui/toast';
import MainContent from '@/components/custom/UI/MainContent.vue';
import SelectionControl from '@/components/custom/UI/selectionControl/SelectionControl.vue';
import { useSelectionControl } from '@/components/custom/UI/selectionControl/useSelectionControl';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import DateUtils from '@/utils/DateUtils';
import { DataRecord } from 'supabase-dataobject-core/dist/dataRecord';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDataObject, DataObject, SortConfig, WhereClause } from 'supabase-dataobject-core';
import UserCard from '@/components/custom/UI/UserCard.vue';
import { supabase } from "@/api/supabase";
import { Spinner } from "@/components/ui/spinner";
import { userStore } from '@/store/userStore';
import { active } from 'sortablejs';
import { UserFriendDropdownContent } from '@/components/custom/UI/dropdownContent';

const isLoading = ref(true);
const searchQuery = ref('');
const whereClauses = ref<WhereClause[]>([]);
const userFriendsBaseClause = { field: 'status', operator: 'equals', value: 'accepted' }

type TabKey = 'tab-friends' | 'tab-requests' | 'tab-find';
const activeTab = ref<TabKey>('tab-friends');

const friendDs = reactive({
    requests: null as DataObject<any> | null,
    userSearch: null as DataObject<any> | null
});

onIonViewDidEnter(async () => {
    createDataObjects();
});

async function createDataObjects() {
    try {
        isLoading.value = true;
        await dataSources.userFriends?.refresh();

        friendDs.requests = await createDataObject('friend_requests', {
            viewName: 'friends_view',
            tableName: 'friends',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            masterDataObjectBinding: {
                masterDataObjectId: 'user',
                childBindingField: 'owner_user_id',
                masterBindingField: 'id'
            },
            sort: [
                { field: 'created_at', direction: 'desc'}
            ],
            fields: friendFields,
            whereClauses: [
                { field: 'status', operator: 'equals', value: 'pending' },
                // { field: 'created_by_id', operator: 'notequals', value: userStore.userProfile?.id },
            ]
        }); 

        friendDs.userSearch = await createDataObject('user_search', {
            viewName: 'user_friend_search_view',
            canInsert: false,
            canUpdate: false,
            canDelete: false,
            fields: [
                { name: 'id', type: 'number' },
                { name: 'username', type: 'string' },
                { name: 'profile_picture_url', type: 'string' },
                { name: 'bg_colour', type: 'string' },
                { name: 'relationship_status', type: 'string' },
                { name: "created_by_id", type: 'number' },
                { name: "created_at", type: 'Date' },
            ],
        });
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function handleTabSwitch(newValue: TabKey) {
    activeTab.value = newValue;
    searchQuery.value = '';
    updateWhereClauses();
}

function handleSearchQuery(query: string) {
    searchQuery.value = query;
    updateWhereClauses();
}

function updateWhereClauses(pSkipUpdate = false) {
    whereClauses.value = []
    if (searchQuery.value) {
        whereClauses.value.push({ field: 'username', operator: 'ilike', value: searchQuery.value });
    }
    if (!pSkipUpdate) {
        if (activeTab.value === 'tab-friends') {
            dataSources.userFriends.whereClauses = [userFriendsBaseClause, ...whereClauses.value];
        } else if (activeTab.value === 'tab-find') {
            friendDs.userSearch.whereClauses = whereClauses.value;
        }
    }
}

function handleFriendRemoved() {
    if (activeTab.value === 'tab-friends') {
        dataSources.userFriends?.refresh();
    } else if (activeTab.value === 'tab-requests') {
        friendDs.requests?.refresh();
    } else if (activeTab.value === 'tab-find') {
        friendDs.userSearch?.refresh();
    }
}

async function deleteFriendRequest(request: DataRecord<any>) {
    try {
        await request.delete();
        await friendDs.userSearch?.refresh();

        toast({
            title: 'Friend Request Deleted',
            description: `You have deleted the friend request from ${request.username}.`,
        });
    } catch(err) {
        toast({
            title: 'Error',
            description: 'An error occurred while trying to delete the friend request. Please try again.',
        });
        console.error(err);
    }
}

async function acceptFriendRequest(request: DataRecord<any>) {
    try {
        await friendDs.requests?.update(request.id, { status: 'accepted' });
        await dataSources.userFriends?.refresh();
        await friendDs.userSearch?.refresh();

        toast({
            title: 'Friend Request Accepted',
            description: `You are now friends with ${request.username}.`,
        });
    } catch(err) {
        toast({
            title: 'Error',
            description: 'An error occurred while trying to accept the friend request. Please try again.',
        });
        console.error(err);
    }
}

const isSendingRequest = ref(false);
async function sendFriendRequest(friendId: number) {
    try {
        isSendingRequest.value = true;
        const result = await supabase.rpc('send_friend_request', {
            friend_id: friendId
        });

        friendDs.userSearch?.refresh();
        friendDs.requests?.refresh();

        toast({
            title: 'Friend Request Sent',
            description: 'Your friend request has been sent successfully.',
        });
    } catch(err) {
        toast({
            title: 'Error',
            description: 'An error occurred while trying to send the friend request. Please try again.',
        });
        console.error(err);
    } finally {
        isSendingRequest.value = false;
    }
}

async function cancelFriendRequest(friend: DataRecord<any>) {
    try {
        const friendRequest = friendDs.requests?.data.find(x => x.friend_user_id === friend.id);
        debugger
        if (!friendRequest) {
            throw new Error('Friend request not found');
        }
        await friendDs.requests?.delete(friendRequest.id);
        await friendDs.userSearch?.refresh();

        toast({
            title: 'Friend Request Cancelled',
            description: 'Your friend request has been cancelled.',
        });
    } catch(err) {
        toast({
            title: 'Error',
            description: 'An error occurred while trying to cancel the friend request. Please try again.',
        });
        console.error(err);
    }
}

onIonViewDidLeave(() => {
    dataSources.manager?.removeDataObject('friend_requests');
    dataSources.manager?.removeDataObject('user_search');
    friendDs.requests = null;
    friendDs.userSearch = null;
});
</script>