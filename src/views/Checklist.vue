<template>
    <IonPage>
        <IonContent>
            <div class="min-h-screen bg-gray-100">
                <div class="container mx-auto px-6 py-8">
                    <template v-if="!isLoading">
                        <div class="text-lg font-medium">{{ checklistDs.checklist?.currentRecord?.name }}</div>
                        <RoundedContainer class="flex flex-col p-4 space-y-3">
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
                                class="flex justify-between items-center bg-white rounded-2xl shadow-sm px-4 py-3 transition hover:shadow-md">
                                <div>
                                    <input
                                        v-model="item.name"
                                        type="text"
                                        class="flex-1 bg-transparent border-none focus:outline-none text-gray-800"
                                    />
                                </div>
                                <div>
                                    <button
                                        class="ml-3 hover:text-indigo-500 transition"
                                        :class="{ 
                                            'text-green-600' : item.is_checked, 
                                            'text-gray-400' : !item.is_checked
                                        }"
                                        @click="toggleCheck(item)"
                                    >
                                        <component
                                            :is="item.is_checked ? CheckCircle2Icon : CircleIcon"
                                            class="w-6 h-6"
                                        />
                                    </button>
                                </div>
                            </div>

                            <!-- Add Button -->
                            <!-- <div class="flex justify-center mt-3">
                                <Button
                                    class="rounded-full w-12 h-12 flex items-center justify-center text-white shadow-md"
                                    @click="toggleAddInput"
                                >
                                    <PlusIcon class="w-5 h-5" />
                                </Button>
                            </div> -->
                        </RoundedContainer>
                    </template>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { createDataObject, DataObject } from 'supabase-dataobject-core';
import { IonContent, IonPage, onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { reactive, ref } from 'vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-vue-next';
import { useToast } from "@/components/ui/toast/use-toast";
import { userStore } from '@/store/userStore';
import { CircleIcon, CheckCircle2Icon } from "lucide-vue-next";

const route = useRoute();

const isLoading = ref<boolean>(true);

const checklistDs = reactive({
    checklist: null as DataObject | null,
    checklistItems: null as DataObject | null
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

function toggleAddInput() {
    showAddInput.value = !showAddInput.value;
}

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
        const { toast } = useToast();
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