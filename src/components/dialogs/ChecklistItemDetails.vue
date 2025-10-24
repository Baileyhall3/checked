<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    <div class="flex justify-between items-center">
                        <button
                            v-if="!props.checklistItem.deleted_at"
                            class="mr-2 hover:text-indigo-500 transition"
                            :class="{ 
                                'text-green-600' : props.checklistItem.is_checked, 
                                'text-gray-400' : !props.checklistItem.is_checked
                            }"
                            @click="toggleCheck(props.checklistItem)"
                        >
                            <component :is="props.checklistItem.is_checked ? CheckCircle2Icon : CircleIcon" class="w-6 h-6" />
                        </button>
                        <div class="w-full">
                            <input
                                v-model="props.checklistItem.name"
                                type="text"
                                class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 w-full"
                            />
                        </div>
                    </div>
                </DialogTitle>
            </DialogHeader>
            <!-- <DialogDescription class="px-6">
                <span class="italic">
                    Created by {{ props.checklistItem.created_by_username }} at {{ DateUtils.toDateTime(props.checklistItem.created_at) }}
                </span>
            </DialogDescription> -->

            <div class="px-6 pt-4 pb-6">
                <form class="space-y-4 pb-4">
                    <div class="*:not-first:mt-2">
                        <Label for="description">Description</Label>
                        <Textarea
                            if="description"
                            placeholder="Add a description to this item"
                            v-model="props.checklistItem.description"
                            :maxLength="maxLength"
                            aria-describedby="desc"
                        />
                        <p
                            id="desc"
                            class="text-muted-foreground mt-2 text-right text-xs"
                            role="status"
                            aria-live="polite"
                        >
                            <span class="tabular-nums">
                                {{ maxLength - characterCount }}
                            </span>
                            characters left
                        </p>
                    </div>
                </form>
                <div class="flex flex-col">
                    <span class="italic text-sm text-gray-500">
                        Created by {{ props.checklistItem.created_by_username }} {{ DateUtils.toDateTime(props.checklistItem.created_at) }}
                    </span>
                    <span class="italic text-sm text-gray-500">
                        Last updated by {{ props.checklistItem.updated_by_username }} {{ DateUtils.toDateTime(props.checklistItem.updated_at) }}
                    </span>
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

        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
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
import { ref, computed } from 'vue';
import Textarea from '../ui/textarea/Textarea.vue';
import DateUtils from '@/utils/DateUtils';
import { CheckCircle2Icon, CircleIcon } from 'lucide-vue-next';

const props = defineProps<{
    checklistItem: DataObjectRecord;
    dataObject: DataObject
}>();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const maxLength = 180;
const characterCount = computed(() => props.checklistItem.description?.length ?? maxLength);

function toggleCheck(item: any) {
    item.is_checked = !item.is_checked;
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

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
  isDialogOpen.value = false;
}

defineExpose({show, close})
</script>