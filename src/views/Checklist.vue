<template>
    <IonPage>
        <IonContent>
            <!-- <Header :title="checklistDs.checklist?.currentRecord?.name" /> -->
            <template v-if="checklistDs.checklist && checklistDs.checklist.data.length">
                <header class="sticky top-0 z-50">
                    <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
                        <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/home" class="inline-flex items-center gap-1.5">
                                            <Home class="size-4" aria-hidden="true" />
                                            Home
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="#" class="inline-flex items-center gap-1.5">
                                            <Folder class="size-4" aria-hidden="true" />
                                            Folder
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{{ checklistDs.checklist?.currentRecord?.name }}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                </header>
                <div class="min-h-screen bg-gray-100">
                    <div class="container mx-auto px-6 py-2">
                        <template v-if="!isLoading">
                            <div class="flex flex-col space-y-3">
    
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
                                    <div v-if="showAddInput" class="flex items-center space-x-2">
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
                                <div v-for="(item, index) in checklistDs.checklistItems?.data" :key="index"
                                    class=" bg-white rounded-2xl shadow-sm px-4 py-3 transition hover:shadow-md"
                                >
                                    <div class="flex justify-between items-center">
                                        <button
                                            v-if="!item.deleted_at"
                                            class="mr-2 hover:text-indigo-500 transition"
                                            :class="{ 
                                                'text-green-600' : item.is_checked, 
                                                'text-gray-400' : !item.is_checked
                                            }"
                                            @click="toggleCheck(item)"
                                        >
                                            <component :is="item.is_checked ? CheckCircle2Icon : CircleIcon" class="w-6 h-6" />
                                        </button>
                                        <Trash v-else class="w-6 h-6 text-red-600 mr-2" />
                                        <div class="w-full">
                                            <input
                                                v-model="item.name"
                                                type="text"
                                                class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 w-full"
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    class="rounded-full shadow-none ml-3"
                                                    aria-label="Open edit menu"
                                                >
                                                    <Ellipsis :size="16" aria-hidden="true" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem class="cursor-pointer">
                                                    <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
                                                    Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" class="cursor-pointer" @click="setDeleted(item)" v-if="!item.deleted_at">
                                                    <Trash class="size-4" aria-hidden="true" />
                                                    Delete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem class="cursor-pointer" @click="recoverItem(item)" v-else>
                                                    <RotateCcw class="size-4" aria-hidden="true" />
                                                    Recover
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <span v-if="item.deleted_at" class="text-red-600 italic text-sm">
                                        Deleted {{ DateUtils.toDateTime(item.deleted_at) }} by {{ item.deleted_by_username }}
                                    </span>
                                    <span class="text-sm text-gray-600">
                                        {{ item.description }}
                                    </span>
                                </div>
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
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { createDataObject, DataObject } from 'supabase-dataobject-core';
import { IonContent, IonPage, onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { reactive, ref, computed } from 'vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { userStore } from '@/store/userStore';
import { RotateCcw, Folder, Home, Trash, TextAlignStart, CircleIcon, CheckCircle2Icon, Ellipsis, X } from "lucide-vue-next";
import Header from '@/components/header/Checklist.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import DateUtils from '@/utils/DateUtils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const route = useRoute();

const isLoading = ref<boolean>(true);
const { toast } = useToast();

const checklistDs = reactive({
    checklist: null as DataObject | null,
    checklistItems: null as DataObject | null
});

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
            fields: [
                { name: "id" },
                { name: "prim_key" },
                { name: "name" },
                { name: "is_template" },
                { name: "created_at" },
                { name: "updated_at" },
                { name: "folder_id" },
                { name: "folder_name" },
                { name: "owner_id" },
                { name: "owner_username" },
                { name: "owner_email" },
                { name: "updated_by_id" },
                { name: "updated_by_username" },
                { name: "deleted_at" }
            ]
        }); 

        if (checklistData?.data.length) {
            checklistDs.checklist = checklistData;
        }

        checklistDs.checklistItems = await createDataObject('checklist_items', {
            viewName: 'checklist_items_view',
            tableName: 'checklist_items',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            // whereClauses: [
            //     { field: 'deleted_at', operator: 'equals', value: null }
            // ],
            masterDataObjectBinding: {
                masterDataObjectId: 'checklist',
                childBindingField: 'checklist_id',
                masterBindingField: 'id'
            },
            sort: { field: "created_at", direction: 'desc' },
            fields: [
                { name: "id" },
                { name: "prim_key" },
                { name: "name" },
                { name: "description" },
                { name: "checklist_id" },
                { name: "is_checked" },
                { name: "created_at" },
                { name: "created_by_id" },
                { name: "created_by_username" },
                { name: "updated_at" },
                { name: "updated_by_id" },
                { name: "updated_by_username" },
                { name: "deleted_by_id" },
                { name: "deleted_by_username" },
                { name: "deleted_at" },
            ]
        }); 
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
            created_by_id: userStore.userProfile?.id
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

function toggleCheck(item: any) {
    checklistDs.checklistItems?.update(item.id, {
        is_checked: !item.is_checked,
        updated_by_id: userStore.userProfile?.id
    });
}

function setDeleted(item: any) {
    checklistDs.checklistItems?.update(item.id, {
        deleted_at: new Date(),
        updated_by_id: userStore.userProfile?.id,
        deleted_by_id: userStore.userProfile?.id
    });

    toast({
        title: 'Item deleted.',
        description: 'Deleted items are recoverable for 30 days.',
    });
}

function recoverItem(item: any) {
    checklistDs.checklistItems?.update(item.id, {
        deleted_at: null,
        updated_by_id: userStore.userProfile?.id,
        deleted_by_id: null
    });
} 

onIonViewDidLeave(() => {
    dataSources.manager?.removeDataObject('checklist');
    dataSources.manager?.removeDataObject('checklist_items');

    // checklistDs.checklist?.dispose();
    // checklistDs.checklistItems?.dispose();
    checklistDs.checklist = null;
    checklistDs.checklistItems = null;
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