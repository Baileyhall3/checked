<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    <div class="flex justify-between items-center">
                        <div class="w-full">
                            <input
                                v-model="props.checklist.name"
                                type="text"
                                class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 w-full"
                                :disabled="props.readonly"
                            />
                        </div>
                    </div>
                </DialogTitle>
            </DialogHeader>
            <Loading v-if="isLoading" />
            <template v-else>
                <div class="px-6 pt-4 pb-6">
                    <div class="items-top flex gap-x-2 pb-4">
                        <Checkbox id="isTemplate" v-model="props.checklist.is_template" :disabled="props.readonly" />
                        <div class="grid gap-1.5 leading-none">
                            <label
                                for="isTemplate"
                                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Is Template
                            </label>
                            <p class="text-sm text-muted-foreground">
                                Marking a checklist as a template allows you to copy the checklist and all of its items, resetting their checked status each time.
                            </p>
                        </div>
                    </div>
    
                    <!-- <div class="pb-4">
                        <span>
                            Theme
                        </span>
                        <div class="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        :style="{ backgroundColor: 'rgb(0 0 0 / 0.6)' }"
                                        class="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full text-white transition-[color,box-shadow] outline-none hover:opacity-80 focus-visible:ring-[3px]"
                                        aria-label="Change background colour"
                                    >
                                        <Palette class="size-4" aria-hidden="true" />
                                    </button>
                                </DropdownMenuTrigger>
                                <ColoursDropdown  @colour-selected="setNewColour" />
                            </DropdownMenu>
                            <button
                                type="button"
                                :style="{ backgroundColor: 'rgb(0 0 0 / 0.6)' }"
                                class="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full text-white transition-[color,box-shadow] outline-none hover:opacity-80 focus-visible:ring-[3px]"
                                aria-label="Change background colour"
                            >
                                <Image class="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div> -->
                    <div class="flex flex-col pb-4">
                        <span class="font-medium">Owner</span>
                        <p class="text-sm text-muted-foreground">{{ props.checklist.owner_username }}</p>
                        <!-- <p class="text-sm text-muted-foreground">{{ props.checklist.owner_email }}</p> -->
                    </div>
                    <div class="flex flex-col pb-4" v-if="props.checklist.completed_at">
                        <span class="font-medium">Completed</span>
                        <p class="text-sm text-muted-foreground">{{ DateUtils.toDateTime(props.checklist.completed_at) }} {{ props.checklist.completed_by_username ? ` by ${props.checklist.completed_by_username}` : '' }}</p>
                        <!-- <p class="text-sm text-muted-foreground">{{ props.checklist.owner_email }}</p> -->
                    </div>
                    <div class="flex flex-col pb-4" v-if="props.checklist.items_updated_at">
                        <span class="font-medium">Last Updated</span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklist.items_updated_at) }} {{ props.checklist.items_updated_by_username ? ` by ${props.checklist.items_updated_by_username}` : '' }}
                        </p>
                    </div>
                    <DialogFooter class="pt-4 gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" class="border">Close</Button>
                        </DialogClose>
                        <Button type="button" :disabled="!dataObject.hasChanges" @click="saveChanges()">
                            <Spinner v-if="isSaving" />
                            Save
                        </Button>
                    </DialogFooter>
                </div>
            </template>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord, createDataObject } from 'supabase-dataobject-core';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { ref, computed, reactive } from 'vue';
import Textarea from '../ui/textarea/Textarea.vue';
import DateUtils from '@/utils/DateUtils';
import { Palette, Image } from 'lucide-vue-next';
import { Checkbox } from "@/components/ui/checkbox"
import Loading from "../custom/UI/Loading.vue";

const props = defineProps<{
    checklist: DataObjectRecord<any>;
    dataObject: DataObject;
    readonly?: boolean;
}>();

const checklistDs = reactive({
    members: null as DataObject<any> | null
});

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isLoading = ref<boolean>(false);

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
    checklistDs.members = null;
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>