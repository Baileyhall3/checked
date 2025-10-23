<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
                <DialogDescription>
                    Create a new folder.
                </DialogDescription>
            </DialogHeader>
            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="createFolder" novalidate v-if="isLoaded">
                <div class="*:not-first:mt-2">
                    <Label for="folderName">
                        Name
                    </Label>
                    <Input 
                        id="folderName" 
                        placeholder="Name... e.g. 'Shopping Lists'" 
                        type="text" 
                        required 
                        v-model="folderData.name" 
                        class="border-gray-300 focus:ring-blue-500"
                    />
                </div>
                <!-- <div class="*:not-first:mt-2" v-if="options.length > 0">
                    <Label>Select Checklists</Label>
                    <MultiSelect
                        :options="options"
                        v-model="values"
                        v-model:query="query"
                        placeholder="Select checklists"
                    />
                </div> -->
            </form>
            <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button type="button" :disabled="isCreating" @click="createFolder()">
                    <Spinner v-if="isCreating" />
                    Create
                </Button>
            </DialogFooter>
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
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-vue-next";
import { computed, ref, watch, reactive } from 'vue';
import { supabase } from "@/api/supabase";
import { userStore } from "@/store/userStore";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { MultiSelect, type Option } from "@/components/ui/multi-select";
import { createDataObject, DataObject } from "supabase-dataobject-core";
import { dataSources } from "@/api/dataObjects";

const emit = defineEmits<{
    (e: 'folder-created'): void
}>();

const isDialogOpen = ref<boolean>(false);
const isCreating = ref<boolean>(false);
const query = ref<string>('');
const values = ref<Option[]>([]);
const options = ref<Option[]>([]);
const isLoaded = ref<boolean>(false);

const folderData = reactive({
    name: '',
    user_id: userStore.userProfile?.id,
    checklistIds: []
});

async function createFolder() {
    const { toast } = useToast();

    try {
        isCreating.value = true;
        
        if (values.value.length > 0) {
            console.log('vals ', values.value)
            return
        }

        if (!folderData.name) {
            toast({
                title: 'Could not create folder.',
                description: 'Please enter a name.',
                variant: "destructive"
            });
            return; 
        }


        const { data, error } = await supabase.rpc('create_folder', {
            p_name: folderData.name,
            p_user_id: folderData.user_id,
            p_checklist_ids: folderData.checklistIds
        });

        if (error) {
        toast({
            title: 'Could not create folder. An error occurred.',
            description: `Error: ${error.message}`,
            variant: "destructive"
        });
        throw new Error(`Error creating folder: ${error.message}`);
        } else {
            toast({title: 'Folder created!'});
            emit("folder-created");
            resetChecklistData();
            close();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isCreating.value = false;
    }
}

function resetChecklistData() {
    folderData.name = '';
    folderData.checklistIds = [];

}

async function loadDataObject() {
  try {
    isLoaded.value = false;

    await dataSources.checklistsNoFolderLkp?.refresh();

    if (dataSources.checklistsNoFolderLkp?.data.length) {
        for (const checklist of dataSources.checklistsNoFolderLkp.data) {
            options.value.push({
                value: checklist.id,
                label: checklist.name
            });
        }
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoaded.value = true;
  }
}

const show = () => {
    isDialogOpen.value = true;
    folderData.name = '';
    folderData.checklistIds = [];
    values.value = [];
    options.value = [];
    loadDataObject();
}

const close = () => {
  isDialogOpen.value = false;
}

defineExpose({show, close})
</script>