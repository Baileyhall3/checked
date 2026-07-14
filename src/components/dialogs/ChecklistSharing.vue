<template>
    <Dialog v-model:open="isDialogOpen" @update:open="handleOpenUpdated">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    Sharing
                </DialogTitle>
            </DialogHeader>
            <Loading v-if="isLoading" />
            <template v-else>
                <div class="px-6 pt-4 pb-6">
                    <div class="flex flex-col pb-4">
                        <span class="font-medium">Members ({{ checklistDs.members?.data?.length || 0 }})</span>
                        <!-- <div class="pb-4">
                            <SearchBar @search-entered="handleSearchQuery" />
                        </div> -->
                        <div v-if="checklistDs.members?.data?.length > 0" class="flex flex-col gap-2">
                            <UserCard
                                v-for="member in checklistDs.members?.data"
                                :key="member.id"
                                :user="member"
                                containerClass="border"
                                userRowClass="flex items-center justify-between"
                            >
                                <template #subtext="{ user }">
                                    <p class="text-sm text-muted-foreground">
                                        {{ capitalize(user.role) }}
                                        <!-- {{ user.added_at ? `- Added ${DateUtils.toDateTime(user.added_at)}` : '' }}  -->
                                    </p>
                                </template>
                                <template #actions="{ user }">
                                    <template v-if="props.checklist.owner_id !== user.user_id && !props.readonly">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    class="opacity-60 active:opacity-100 rounded-full size-6"
                                                    aria-label="Open edit menu"
                                                >
                                                    <Ellipsis  aria-hidden="true" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger inset class="cursor-pointer">Role</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuRadioGroup v-model="user.role">
                                                                <DropdownMenuRadioItem value="editor" @click="handleRoleUpdate(user, 'editor')" class="cursor-pointer">Editor</DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="viewer" @click="handleRoleUpdate(user, 'viewer')" class="cursor-pointer">Viewer</DropdownMenuRadioItem>
                                                            </DropdownMenuRadioGroup>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem class="cursor-pointer justify-between text-red-600" @click="removeMember(user)">
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </template>
                                </template>
                            </UserCard>
                        </div>
                        <p v-else class="text-sm text-muted-foreground mt-2">No members found.</p>

                        <AddMember 
                            v-if="!props.readonly"
                            :membersData="memberSearchUsers"
                            @search-users="searchUsers"
                            @select-user="handleSelect"
                        >
                            <template #trigger="{ openPopover }">
                                <Button 
                                    variant="secondary" 
                                    class="w-full mt-4"
                                    role="combobox"
                                    :aria-expanded="openPopover"
                                >
                                    Add Member
                                </Button>
                            </template>
                        </AddMember>
                    </div>
                </div>
            </template>
        </DialogContent>
    </Dialog>

    <Confirm
        ref="editorRoleConfirmDialog" 
        title="Change role?"
        description="Are you sure you want to change this user's role to be editor? This will allow the user to edit the checklist and its items."
    />
    <Confirm
        ref="viewerRoleConfirmDialog" 
        title="Change role?"
        description="Are you sure you want to change this user's role to be viewer? This will allow the user to view the checklist and its items, but not edit them."
    />
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord, createDataObject } from 'supabase-dataobject-core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { ref, reactive } from 'vue';
import DateUtils from '@/utils/DateUtils';
import { Ellipsis } from 'lucide-vue-next';
import { DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import Loading from "../custom/UI/Loading.vue";
import { dataSources } from '@/api/dataObjects.js';
import UserCard from '../custom/UI/UserCard.vue';
import { capitalize } from '@/utils/shared.js';
import Confirm from './Confirm.vue';
import { supabase } from '@/api/supabase.js';
import AddMember from '../custom/UI/input/lookup/AddMember.vue';

const props = defineProps<{
    checklist: DataObjectRecord<any>;
    dataObject: DataObject;
    readonly?: boolean;
}>();

const checklistDs = reactive({
    members: null as DataObject<any> | null
});

const { toast } = useToast();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const openPopover = ref<boolean>(false);
const memberSearchUsers = ref<any[]>([]);
const isRunningSearch = ref<boolean>(false);

const viewerRoleConfirmDialog = ref();
const editorRoleConfirmDialog = ref();

async function createDataObjects() {
    checklistDs.members = null;
    dataSources.manager?.removeDataObject('checklistMembers');

    try {
        isLoading.value = true;

        const preferencesData = await createDataObject('checklistMembers', {
            viewName: 'checklist_members_view',
            tableName: 'checklist_members',
            canInsert: !props.readonly,
            canUpdate: !props.readonly,
            canDelete: !props.readonly,
            whereClauses: [
                { field: 'checklist_id', operator: 'equals', value: props.checklist.id }
            ],
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
            ],
            sort: { field: "added_at", direction: 'asc' },
        }); 

        checklistDs.members = preferencesData;
        await searchUsers(null);
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

async function searchUsers(query: string | null) {
    try {
        isRunningSearch.value = true;
        const { data, error } = await supabase
            .rpc('search_users_for_checklist', {
                p_checklist_id: props.checklist.id,
                p_search: query
            });

        if (error) {
            throw error;
        }

        memberSearchUsers.value = data || [];
    } catch (err) {
        console.error(err);
    } finally {
        isRunningSearch.value = false;
    }
}

async function handleSelect(user: DataObjectRecord<any>) {
    try {
        // isLoading.value = true;
        await checklistDs.members?.insert({
            checklist_id: props.checklist.id,
            user_id: user.id,
            role: 'viewer'
        });
        toast({
            title: 'User added.',
            description: `${user.username} has been added to the checklist successfully.`,
        });
        searchUsers(null);
        openPopover.value = false;
    } catch (err) {
        console.error(err);
    } finally {
        // isLoading.value = false;
    }
}

async function handleRoleUpdate(user: any, newRole: string) {
    try {
        // isLoading.value = true;
        // const confirmRef = newRole === 'editor' ? editorRoleConfirmDialog : viewerRoleConfirmDialog;
        // const confirmed = await confirmRef.value.confirm();
        // debugger
        // if (confirmed) {
        //     user.role = newRole;
            await checklistDs.members?.saveChanges();
            toast({
                title: 'User role updated.',
                description: 'The user\'s role has been updated successfully.',
            });
        // }
    } catch (err) {
        console.error(err);
    } finally {
        // isLoading.value = false;
    }
}

async function removeMember(user: any) {
    try {
        // isLoading.value = true;
        await checklistDs.members?.delete(user.id);
        toast({
            title: 'User removed.',
            description: 'The user has been removed from the checklist successfully.',
        });
    } catch (err) {
        console.error(err);
    } finally {
        // isLoading.value = false;
    }
}

async function saveChanges() {
    try {
        isSaving.value = true;
        await props.dataObject.saveChanges();
        close();
    } catch (err) {
        console.error(err);
    } finally {
        isSaving.value = false;        
    }
}

function handleOpenUpdated(newVal: boolean) {
    if (newVal == true) {
        createDataObjects();
    } else {
        dataSources.manager?.removeDataObject('checklistMembers');
        checklistDs.members = null;
    }
}

const show = () => {
    createDataObjects();
    isDialogOpen.value = true;
}

const close = () => {
    checklistDs.members = null;
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>