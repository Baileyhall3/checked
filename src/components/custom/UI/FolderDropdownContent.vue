<template>
    <DropdownMenuContent>
        <DropdownMenuLabel v-if="props.label">{{ props.label }}</DropdownMenuLabel>
        <DropdownMenuItem class="cursor-pointer" @click="folderDetailsDialog.show()">
            <TextAlignStart class="size-4 opacity-60" aria-hidden="true" />
            Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
            v-if="!folder.pin_protected_at"
            class="cursor-pointer" 
            title="Locking this item will prevent people from updating it"
            @click="pinSetupDialog.show()" 
        >
            <EyeOff class="size-4 opacity-60" aria-hidden="true" />
            Set PIN
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" @click="pinRemoveDialog.show()" v-else>
            <Eye class="size-4" aria-hidden="true" />
            Remove PIN
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer text-red-600" @click="tryDeleteFolder">
            <Trash class="size-4" aria-hidden="true" />
            Delete
        </DropdownMenuItem>
    </DropdownMenuContent>

    <Confirm
        title="Action Required"
        description="What would you like to happen to the checklists in this folder?"
        ref="confirmDialog" 
        confirm-text="Delete"
        confirm-type="delete"
        @confirmed="handleDeleteConfirm"
    >
        <RadioGroup class="gap-6" v-model="deleteOption">
            <div class="flex items-start gap-2">
                <RadioGroupItem
                    value="nothing"
                    id="nothing"
                />
                <div class="grid grow gap-2">
                    <Label for="nothing">
                        Nothing
                    </Label>
                    <p class="text-muted-foreground text-xs">
                        Checklists will still be visible on the home page, but will not be part of a folder.
                    </p>
                </div>
            </div>
            <div class="flex items-start gap-2">
                <RadioGroupItem
                    value="cascade"
                    id="cascade"
                />
                <div class="grid grow gap-2">
                    <Label for="cascade">
                        Delete All
                    </Label>
                    <p class="text-muted-foreground text-xs">
                        All checklists in this folder will be deleted. Deleted checklists are recoverable for 30 days.
                    </p>
                </div>
            </div>
        </RadioGroup>
    </Confirm>
    <FolderDetails ref="folderDetailsDialog" :folder="props.folder" :data-object="props.folderData" />
    <PINSetup ref="pinSetupDialog" :item="props.folder" :data-object="props.folderData" type="folder" />
    <PINRemove ref="pinRemoveDialog" :item="props.folder" :data-object="props.folderData" type="folder" />
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { TextAlignStart, Trash, Eye, EyeOff } from "lucide-vue-next";
import Confirm from '@/components/dialogs/Confirm.vue';
import { ref } from 'vue';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter, useRoute  } from 'vue-router';
import { supabase } from "@/api/supabase";
import { useToast } from '@/components/ui/toast';
import FolderDetails from '@/components/dialogs/FolderDetails.vue';
import PINSetup from '@/components/dialogs/PINSetup.vue';
import PINRemove from '@/components/dialogs/PINRemove.vue';

const props = defineProps<{
    folder: DataObjectRecord;
    folderData: DataObject;
    label?: string;
}>();

const pinSetupDialog = ref();
const folderDetailsDialog = ref();
const confirmDialog = ref();
const pinRemoveDialog =ref();
const deleteOption = ref<'cascade' | 'nothing'>('nothing');

const { toast } = useToast();
const router = useRouter();
const route = useRoute();

async function tryDeleteFolder() {
    if (props.folder.checklist_count === 0) {
        // hard delete immediately
        try {
            await deleteFolder();
        } catch(err) {
            console.error(err);
        }
    } else {
        confirmDialog.value.show();
    }
}

async function deleteFolder() {
    const hasDeleted = await props.folderData.delete(props.folder.id);
    if (hasDeleted) {
        toast({
            title: 'Folder deleted successfully.',
        });
        redirectToHome();
    }
}

async function handleDeleteConfirm() {
    if (deleteOption.value === 'cascade') {
        try {
            const { data, error } = await supabase.rpc('delete_folder_and_checklists', { p_folder_id: props.folder.id });
            if (error) {
                toast({
                    title: 'Could not delete folder. An error occurred.',
                    description: `Error: ${error.message}`,
                    variant: "destructive"
                });
                throw new Error(`Error deleting folder: ${error.message}`);
            } else {
                redirectToHome();
            }
        } catch (err) {
            console.error(err);
        }
    } else {
        deleteFolder();
    }
}

function redirectToHome() {
    if (route.path !== '/home') {
        router.push(`/home`);
    }
}
</script>