<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <div class="px-6 py-2 text-base border-b">
                    <div class="flex justify-between items-start">
                    <button
                        v-if="!props.checklistItem.deleted_at"
                        class="mr-2 hover:text-indigo-500 transition"
                        :class="{ 
                        'text-green-600': props.checklistItem.is_checked, 
                        'text-gray-400': !props.checklistItem.is_checked
                        }"
                        @click="toggleCheck(props.checklistItem)"
                    >
                        <component :is="props.checklistItem.is_checked ? CheckCircle2Icon : CircleIcon" class="w-6 h-6" />
                    </button>

                    <div class="w-full pe-4 font-semibold tracking-tight">
                        <textarea
                            ref="nameInput"
                            v-model="props.checklistItem.name"
                            class="block w-full bg-transparent border-none focus:outline-none text-gray-800 resize-none overflow-hidden leading-relaxed"
                            @input="autoResize"
                        ></textarea>
                    </div>
                    </div>
                </div>
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
                            style="min-height: 8rem;"
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

                    <div>
                        <span>
                            Background Colour
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    class="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                    aria-label="Change background colour"
                                >
                                    <Palette class="size-4" aria-hidden="true" />
                                </button>
                            </DropdownMenuTrigger>
                            <ColoursDropdown :current-colour="props.checklistItem.bg_colour" @colour-selected="setNewColour" />
                        </DropdownMenu>
                    </div>

                    <!-- <div class="*:not-first:mt-2">
                        <Popover>
                            <PopoverTrigger as-child>
                                <FormControl>
                                    <Button
                                        variant="outline" :class="cn(
                                        'w-[240px] ps-3 text-start font-normal',
                                        !value && 'text-muted-foreground',
                                        )"
                                    >
                                        <span>{{ value ? df.format(toDate(value)) : "Pick a date" }}</span>
                                        <Calendar class="ms-auto h-4 w-4 opacity-50" />
                                    </Button>
                                <input hidden>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar
                                v-model:placeholder="placeholder"
                                :model-value="value"
                                calendar-label="Date of birth"
                                initial-focus
                                :min-value="new CalendarDate(1900, 1, 1)"
                                :max-value="today(getLocalTimeZone())"
                                @update:model-value="(v) => {
                                    if (v) {
                                    setFieldValue('dob', v.toString())
                                    }
                                    else {
                                    setFieldValue('dob', undefined)
                                    }
                                }"
                                />
                            </PopoverContent>
                        </Popover>
                    </div> -->
                </form>
                <div class="flex flex-col space-y-4">
                    <div class="flex flex-col text-red-600" v-if="props.checklistItem.deleted_at">
                        <span class="font-medium">Deleted</span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.deleted_at) }} by {{ props.checklistItem.deleted_by_username }}
                        </p>
                    </div>
                    <div class="flex flex-col" v-if="props.checklistItem.locked_at">
                        <span class="font-medium">Locked</span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.locked_at) }} by {{ props.checklistItem.locked_by_username }}
                        </p>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-medium">Created</span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.created_at) }} by {{ props.checklistItem.created_by_username }}
                        </p>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-medium">Last Updated</span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.updated_at) }} by {{ props.checklistItem.updated_by_username }}
                        </p>
                    </div>
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
import { CheckCircle2Icon, CircleIcon, Calendar, Palette } from 'lucide-vue-next';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ColoursDropdown from '../custom/UI/ColoursDropdown.vue';

const props = defineProps<{
    checklistItem: DataObjectRecord;
    dataObject: DataObject
}>();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const nameInput = ref(null);

const autoResize = (ev) => {
    const el = ev?.target ?? nameInput.value;
    if (!el) return;
    // make sure box-sizing is predictable
    el.style.boxSizing = 'border-box';
    el.style.height = 'auto';
    // use scrollHeight for natural height; add 1px to avoid clipping in some browsers
    el.style.height = `${el.scrollHeight + 1}px`;
};

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

function setNewColour(colour: string) {
    props.checklistItem.bg_colour = colour;
}

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
  isDialogOpen.value = false;
}

defineExpose({show, close})
</script>