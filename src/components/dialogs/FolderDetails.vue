<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    <div class="flex justify-between items-center">
                        <div class="w-full">
                            <input
                                v-model="props.folder.name"
                                type="text"
                                class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 w-full"
                            />
                        </div>
                    </div>
                </DialogTitle>
            </DialogHeader>
            <div class="px-6 pt-4 pb-6">
                <DialogFooter class="pt-4 gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" class="border">Close</Button>
                    </DialogClose>
                    <Button type="button"  @click="saveChanges()">
                        <Spinner v-if="isSaving" />
                        Save
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ref } from 'vue';

const props = defineProps<{
    folder: DataObjectRecord;
    dataObject: DataObject
}>();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);

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

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

defineExpose({ show, close })
</script>