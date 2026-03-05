<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class=" text-right">
                <!-- oioi -->
            </DialogHeader>
            <div class="px-6 py-2 text-base border-b relative grid grid-cols-[85%_15%]">
                <div 
                    :style="{ '--item-colour': props.checklistItem.bg_colour }"
                >
                    <div class="flex justify-between items-start">
                        <Checkbox
                            v-if="!props.checklistItem.deleted_at"
                            :style="{ 'background-color': props.checklistItem.is_checked ? '#00bc7d' : 'transparent'}"
                            :class="{ 'border border-gray-400 !border-solid' : !props.checklistItem.is_checked }"
                            class="rounded-full mr-2 mt-1"
                            v-model="props.checklistItem.is_checked"
                            @update:model-value="handleChecked"
                        />
                        <div class="w-full pe-4 font-semibold tracking-tight">
                            <textarea
                                ref="nameInput"
                                v-model="props.checklistItem.name"
                                class="block w-full bg-transparent border-none focus:outline-none resize-none overflow-hidden leading-relaxed"
                                :class="{ 
                                    'text-gray-700' : props.checklistItem.deleted_at || props.checklistItem.is_checked, 
                                    'text-gray-900' : !props.checklistItem.deleted_at && !props.checklistItem.is_checked 
                                }"
                                :rows="1"
                                @input="autoResize"
                                @blur="props.dataObject.saveChanges()"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div class="px-4 py-0.5">
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
                        <ChecklistItemDropdownContent 
                            :checklist-data="props.dataObject" 
                            :item="props.checklistItem" 
                            hideDetailsOption
                        />
                    </DropdownMenu>
                </div>
            </div>

            <div class="px-6 pt-4 pb-6">
                <form class="space-y-4 pb-4" @submit.prevent>
                    <div v-if="props.checklistItem.locked_at" 
                        class="flex items-center gap-2 rounded-lg px-1 py-2 border text-sm bg-gray-300 border-gray-700 text-gray-700 w-100 justify-center">
                        <Lock class="size-4" />
                        {{ `Locked by ${props.checklistItem.locked_by_username} ${DateUtils.toFullDateTime(props.checklistItem.locked_at)}` }}
                    </div>
                    <div v-if="props.checklistItem.deleted_at" 
                        class="flex items-center gap-2 rounded-lg px-1 py-2 border text-sm bg-red-200 border-red-700 text-red-700 w-100 justify-center">
                        <Trash class="size-4" />
                        {{ `Deleted by ${props.checklistItem.deleted_by_username} ${DateUtils.toFullDateTime(props.checklistItem.deleted_at)}` }}
                    </div>
                    <div class="flex items-center h-100">
                        <!-- <LockedLabel 
                            v-if="props.checklistItem.locked_at"
                            :locked-at="props.checklistItem.locked_at"
                            :locked-by="props.checklistItem.locked_by_username"
                        /> -->
                        <PriorityLabel 
                            v-model:priority="props.checklistItem.priority" 
                            @update:priority="props.dataObject.saveChanges()" 
                        />
                        <DueDate 
                            v-model="props.checklistItem.due_date" 
                            showTime 
                            editable 
                            :is-complete="props.checklistItem.is_checked"
                            @update:model-value="props.dataObject.saveChanges()" 
                            class="ms-2" 
                        />
                    </div>

                    <div class="flex flex-col">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Description</span>
                            <Button v-if="!isEditingDesc" variant="secondary" @click="isEditingDesc = !isEditingDesc">
                                Edit
                            </Button>
                        </div>
                        <template v-if="isEditingDesc">
                            <TextEditor v-model="props.checklistItem.description" />
                            <div class="flex gap-2 mt-2 justify-self-end">
                                <Button variant="secondary" @click="cancelChanges">
                                    Cancel
                                </Button>
                                <Button @click="saveChanges">
                                    Save
                                </Button>
                            </div>
                        </template>
                        <div class="text-sm text-gray-600" v-else>
                            <div
                                class="prose prose-sm
                                    prose-ul:list-disc prose-ul:list-inside prose-ul:pl-0
                                    prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-0"
                                v-html="props.checklistItem.description"
                            ></div>
                        </div>
                    </div>

                    <div>
                        <span>
                            Background Colour
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    :style="{ backgroundColor: props.checklistItem.bg_colour ?? 'rgb(0 0 0 / 0.6)' }"
                                    class="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full text-white transition-[color,box-shadow] outline-none hover:opacity-80 focus-visible:ring-[3px]"
                                    aria-label="Change background colour"
                                >
                                    <Palette class="size-4" aria-hidden="true" />
                                </button>
                            </DropdownMenuTrigger>
                            <ColoursDropdown :current-colour="props.checklistItem.bg_colour" @colour-selected="setNewColour" />
                        </DropdownMenu>
                    </div>
                </form>
                <div class="flex flex-col space-y-4">
                    <!-- <div class="flex flex-col text-red-600" v-if="props.checklistItem.deleted_at">
                        <span class="font-medium items-center flex">
                            <Trash class="w-4 h-4 inline-block mr-2" />
                            Deleted
                        </span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.deleted_at) }} by {{ props.checklistItem.deleted_by_username }}
                        </p>
                    </div>
                    <div class="flex flex-col" v-if="props.checklistItem.locked_at">
                        <span class="font-medium items-center flex">
                            <Lock class="w-4 h-4 inline-block mr-2" />
                            Locked
                        </span>
                        <p class="text-sm text-muted-foreground">
                            {{ DateUtils.toDateTime(props.checklistItem.locked_at) }} by {{ props.checklistItem.locked_by_username }}
                        </p>
                    </div> -->
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
                <!-- <DialogFooter class="pt-4 gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" class="border">Close</Button>
                    </DialogClose>
                    <Button type="button" :disabled="!dataObject.hasChanges" @click="saveChanges()">
                        <Spinner v-if="isSaving" />
                        Save
                    </Button>
                </DialogFooter> -->
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { ref, nextTick } from 'vue';
import Textarea from '../ui/textarea/Textarea.vue';
import DateUtils from '@/utils/DateUtils';
import { CheckCircle2Icon, CircleIcon, Calendar, Palette, Lock, Trash, X, Ellipsis } from 'lucide-vue-next';
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ColoursDropdown from '../custom/UI/ColoursDropdown.vue';
import TextEditor from '../custom/UI/input/TextEditor.vue';
import { Checkbox } from '../ui/checkbox';
import DueDate from '../custom/UI/checklist/DueDate.vue';
import PriorityLabel from '../custom/UI/checklist/PriorityLabel.vue';
import ChecklistItemDropdownContent from '../custom/UI/ChecklistItemDropdownContent.vue';
import LockedLabel from '../custom/UI/checklist/LockedLabel.vue';

const props = defineProps<{
    checklistItem: DataObjectRecord;
    dataObject: DataObject
}>();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const nameInput = ref(null);
const isEditingDesc = ref<boolean>(false);

const autoResize = (ev) => {
    const el = ev?.target ?? nameInput.value;
    if (!el) return;
    // make sure box-sizing is predictable
    el.style.boxSizing = 'border-box';
    el.style.height = 'auto';
    // use scrollHeight for natural height; add 1px to avoid clipping in some browsers
    el.style.height = `${el.scrollHeight + 1}px`;
};

// const maxLength = 180;
// const characterCount = computed(() => props.checklistItem.description?.length ?? maxLength);

const priorityLabel = (priority: number) => {
    switch(priority) {
        case 1:
            return 'High';
        case 2:
            return 'Medium';
        case 3:
            return 'Low';
        default:
            return '';
    }
}

function handleChecked(isChecked: boolean) {
    props.dataObject.update(props.checklistItem.id, {
        is_checked: isChecked
    }, true);
}

function cancelChanges() {
    props.checklistItem.revert();
    isEditingDesc.value = false;
}

async function saveChanges() {
    try {
        isSaving.value = true;
        console.log('record ', props.checklistItem);
        props.checklistItem
        await props.checklistItem.save();
        isEditingDesc.value = false;
        // close();
    } catch (err) {
        console.error(err);
    } finally {
        isSaving.value = false;        
    }
}

function setNewColour(colour: string) {
    if (props.checklistItem.bg_colour === colour) {
        props.checklistItem.bg_colour = null;
    } else {
        props.checklistItem.bg_colour = colour;
    }
}

const show = async() => {
    isDialogOpen.value = true;
    isEditingDesc.value = false;
    await nextTick();
    if (nameInput.value) {
        autoResize(nameInput.value);
    }
}

const close = () => {
  isDialogOpen.value = false;
}

defineExpose({show, close})
</script>

<style scoped>
.header-accent::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 10px;                 /* Thickness of the coloured strip */
    height: 100%;
    background: var(--item-colour);
    border-top-left-radius: 0.75rem;     /* Match your rounded style if needed */
}

</style>