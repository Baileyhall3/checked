<template>
    <Dialog v-model:open="isDialogOpen" @update:open="handleOpenUpdated">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Notification Preferences</DialogTitle>
                <DialogDescription>
                    <p>
                        Set your notification preferences for <span class="font-semibold"> {{ props.checklist.name }}</span> below.
                    </p>
                </DialogDescription>
            </DialogHeader>
            <Loading v-if="isLoading" />
            <div class="gap-4 grid" v-else-if="preferenceDs.checklist?.data">
                <div 
                    v-for="(pref, index) in preferenceDs.checklist.data" 
                    :key="pref.id"
                    class="flex flex-col"
                    :class="{ 'border-b pb-4' : index !== (preferenceDs.checklist.data.length - 1)}"
                >
                    <div class="mb-2">
                        <div class="font-semibold">{{ formatNotifType(pref.type) }}</div>
                        <div class="text-sm text-muted-foreground">
                            {{ pref.description }}
                        </div>
                    </div>

                    <div class="flex gap-x-6">
                        <!-- Email -->
                        <div v-if="pref.supports_email" class="flex flex-col">
                            <div class="flex items-center gap-2">
                                <Switch
                                    v-model="pref.allow_email"
                                    @update:model-value="newVal => handleUpdate(pref, newVal, true)"
                                    :disabled="pref.email_disabled_globally"
                                />
                                <span class="text-sm">Allow Email</span>
                            </div>

                            <p
                                v-if="pref.email_disabled_globally"
                                class="text-xs text-gray-500 mt-1"
                            >
                                Disabled by your <router-link to="/preferences" class="underline">global notification settings</router-link>.
                            </p>
                        </div>

                        <!-- Push -->
                        <div v-if="pref.supports_push" class="flex flex-col">
                            <div class="flex items-center gap-2">
                                <Switch
                                    v-model="pref.allow_push"
                                    @update:model-value="newVal => handleUpdate(pref, newVal)"
                                    :disabled="pref.push_disabled_globally"
                                />
                                <span class="text-sm">Allow Push</span>
                            </div>

                            <p
                                v-if="pref.push_disabled_globally"
                                class="text-xs text-gray-500 mt-1"
                            >
                                Disabled by your <router-link to="/preferences" class="underline">global notification settings</router-link>.
                            </p>
                        </div>

                        </div>
                    
                    <!-- <div class="flex gap-x-4">
                        <div class="flex items-center gap-2" v-if="pref.supports_email">
                            <Switch v-model="pref.allow_email" @update:model-value="newVal => handleUpdate(pref, newVal, true)" :disabled="pref.email_disabled_globally && pref.supports_email" />
                            <span class="text-sm">Allow Email</span>
                        </div>
                        <div class="flex items-center gap-2" v-if="pref.supports_push">
                            <Switch v-model="pref.allow_push" @update:model-value="newVal => handleUpdate(pref, newVal)" :disabled="pref.push_disabled_globally && pref.supports_push" />
                            <span class="text-sm">Allow Push</span>
                        </div>
                    </div> -->
                </div>
            </div>

            <!-- <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button type="button" :disabled="isCopying" @click="copyChecklist()">
                  <Spinner v-if="isCopying" />
                  Create
                </Button>
            </DialogFooter> -->
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { ref, reactive } from 'vue';
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { DataObjectRecord } from "supabase-dataobject-core";
import { formatNotifType } from '@/utils/shared';
import { Switch } from "@/components/ui/switch";
import { createDataObject, DataObject } from 'supabase-dataobject-core';
import { dataSources } from "@/api/dataObjects";
import Loading from "../custom/UI/Loading.vue";

const props = defineProps<{
    checklist: DataObjectRecord;
}>();

const emit = defineEmits<{
  (e: 'checklist-copied', newChecklistId: number): void
}>();

const preferenceDs = reactive({
    checklist: null as DataObject<any> | null
});

const isDialogOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

async function createDataObjects(id: number) {
    preferenceDs.checklist = null;
    dataSources.manager?.removeDataObject('checklistNotificationPreferences');

    try {
        isLoading.value = true;

        const preferencesData = await createDataObject('checklistNotificationPreferences', {
            viewName: 'notification_preferences_checklist_view',
            tableName: 'notification_preferences_checklist',
            canInsert: false,
            canUpdate: true,
            canDelete: false,
            whereClauses: [
                { field: 'checklist_id', operator: 'equals', value: id }
            ],
            fields: [
                { name: "id" },
                { name: "user_id" },
                { name: "checklist_id" },
                { name: "type" },
                { name: "description" },
                { name: "supports_email" },
                { name: "supports_push" },
                { name: "allow_push" },
                { name: "allow_email" },
                { name: "push_disabled_globally" },
                { name: "email_disabled_globally" },
            ]
        }); 

        preferenceDs.checklist = preferencesData;
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

function handleOpenUpdated(newVal: boolean) {
    if (newVal == true) {
        createDataObjects(props.checklist.id);
    } else {
        dataSources.manager?.removeDataObject('checklistNotificationPreferences');
        preferenceDs.checklist = null;
    }
}
async function handleUpdate(pref: DataObjectRecord<any>, newVal: boolean, isEmail = false) {
    const { toast } = useToast(); 
    try {
        await pref.save();
        toast({
            title: `Preference Updated.`,
            description: `You will ${newVal == true ? 'now' : 'no longer'} receive ${isEmail ? 'email' : 'notification'}s of this type for this checklist.`
        });
    } catch(err) {
        console.error(err);
    }
}
const show = () => {
    createDataObjects(props.checklist.id);
    isDialogOpen.value = true;
}

const close = () => {
    preferenceDs.checklist = null;
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>