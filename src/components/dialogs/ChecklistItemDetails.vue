<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogTitle></DialogTitle>
            <Loading v-if="isLoading" />
            <template v-else>
                <div class="px-6 py-2 text-base border-b relative grid grid-cols-[85%_15%]">
                    <div :style="{ '--item-colour': props.checklistItem.bg_colour }">
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
                        
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- <LockedLabel 
                                v-if="props.checklistItem.locked_at"
                                :locked-at="props.checklistItem.locked_at"
                                :locked-by="props.checklistItem.locked_by_username"
                            /> -->
                            <PriorityLabel 
                                v-model:priority="props.checklistItem.priority" 
                                @update:priority="props.checklistItem.save()" 
                            />
                            <DueDate 
                                v-model="props.checklistItem.due_date" 
                                showTime 
                                editable 
                                :is-complete="props.checklistItem.is_checked"
                                @update:model-value="props.checklistItem.save()" 
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div class="flex items-center gap-2 rounded-lg px-1 py-0.5 border bg-gray-100 text-sm cursor-pointer hover:bg-gray-200">
                                        <button
                                            type="button"
                                            class="focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-center rounded-full text-white transition-[color,box-shadow] outline-none hover:opacity-80 focus-visible:ring-[3px]"
                                            aria-label="Change background colour"
                                        >
                                            <Palette class="size-4" aria-hidden="true" 
                                            :style="{ color: props.checklistItem.bg_colour ?? 'rgb(107, 114, 128)' }" />
                                        </button>
                                        <span :class="{ 'text-gray-500' : !props.checklistItem.bg_colour }">Colour</span>
                                        <button
                                            v-if="props.checklistItem.bg_colour"
                                            type="button"
                                            class="ml-1  hover:text-gray-700 transition"
                                            @click.stop="setNewColour(null)"
                                        >
                                            <X class="size-4" />
                                        </button>
                                    </div>
                                </DropdownMenuTrigger>
                                <ColoursDropdown :current-colour="props.checklistItem.bg_colour" allowClear @colour-selected="setNewColour" />
                            </DropdownMenu>

                            <DropdownMenu v-model:open="addLinkDropdownOpen">
                                <DropdownMenuTrigger asChild>
                                    <div class="flex items-center gap-2 rounded-lg px-1 py-0.5 border bg-gray-100 text-sm cursor-pointer hover:bg-gray-200">
                                        <Link class="size-4 opacity-50" />
                                        <span class="text-gray-500">Link</span>
                                    </div>
                                </DropdownMenuTrigger>
                                <AddChecklistItemLinkDropdownContent
                                    @add-link="addLink"
                                    @cancel-create="addLinkDropdownOpen = false"
                                />
                            </DropdownMenu>
                        </div>

                        <div class="flex flex-col">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Description</span>
                                <Button v-if="!isEditingDesc && props.checklistItem.description" variant="secondary" size="sm" @click="beginEditingDescription">
                                    Edit
                                </Button>
                            </div>
                            <template v-if="isEditingDesc">
                                <TextEditor ref="textEditorRef" v-model="props.checklistItem.description" />
                                <div class="flex justify-end w-full mt-2 gap-2">
                                    <Button variant="secondary" size="sm" @click="cancelChanges">
                                        Cancel
                                    </Button>
                                    <Button size="sm" @click="saveChanges">
                                        Save
                                    </Button>
                                </div>
                            </template>
                            <div v-else-if="!props.checklistItem.description"
                                class="text-sm text-gray-600 border border-gray-300 rounded-lg p-2 bg-white hover:bg-gray-100 min-h-[5rem] cursor-pointer"
                                @click="beginEditingDescription"
                            >
                                Add a description...
                            </div>
                            <div v-else class="text-sm text-gray-600 hover:bg-gray-50 rounded-lg p-2cursor-pointer min-h-[5rem]" @click="handleDescriptionClick">
                                <div
                                    class="prose prose-sm
                                        prose-ul:list-disc prose-ul:list-inside prose-ul:pl-0
                                        prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-0"
                                    v-html="props.checklistItem.description"
                                ></div>
                            </div>
                        </div>

                        <div class="flex flex-col" v-if="checlistItemDs.links && checlistItemDs.links.data.length > 0">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Links</span>
                                <DropdownMenu v-model:open="addLinkBtnDropdownOpen">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="sm">
                                            Add
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <AddChecklistItemLinkDropdownContent
                                        @add-link="addLink"
                                        @cancel-create="addLinkBtnDropdownOpen = false"
                                    />
                                </DropdownMenu>
                            </div>
                            <div class="flex flex-col gap-2 py-1">
                                <ItemLink 
                                    v-for="link in checlistItemDs.links.data" 
                                    :key="link.id" 
                                    :link="link"
                                    @remove-link="handleLinkRemoved"
                                />
                            </div>
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
            </template>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import type { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { createDataObject } from 'supabase-dataobject-core';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ref, nextTick, reactive } from 'vue';
import DateUtils from '@/utils/DateUtils';
import { Palette, Lock, Trash, Ellipsis, X, Link } from 'lucide-vue-next';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import ColoursDropdown from '../custom/UI/ColoursDropdown.vue';
import TextEditor from '../custom/UI/input/TextEditor.vue';
import { Checkbox } from '../ui/checkbox';
import DueDate from '../custom/UI/checklist/DueDate.vue';
import PriorityLabel from '../custom/UI/checklist/PriorityLabel.vue';
import ChecklistItemDropdownContent from '../custom/UI/ChecklistItemDropdownContent.vue';
import { dataSources } from '@/api/dataObjects';
import Loading from "../custom/UI/Loading.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast/use-toast";
import ItemLink from '../custom/UI/checklist/ItemLink.vue';
import AddChecklistItemLinkDropdownContent from '../custom/UI/AddChecklistItemLinkDropdownContent.vue';

const props = defineProps<{
    checklistItem: DataObjectRecord;
    dataObject: DataObject
}>();

const isDialogOpen = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const nameInput = ref(null);
const isEditingDesc = ref<boolean>(false);
const textEditorRef = ref(null);
const addLinkDropdownOpen = ref<boolean>(false);
const addLinkBtnDropdownOpen = ref<boolean>(false);

const checlistItemDs = reactive({
    links: null as DataObject<any> | null
});

// const newLink = ref({
//     url: '',
//     title: ''
// });

async function createDataObjects(id: number) {
    checlistItemDs.links = null;
    dataSources.manager?.removeDataObject('checklistItemLinks');

    try {
        isLoading.value = true;

        const itemLinksData = await createDataObject('checklistItemLinks', {
            viewName: 'checklist_item_links_view',
            tableName: 'checklist_item_links',
            canInsert: true,
            canUpdate: true,
            canDelete: true,
            whereClauses: [
                { field: 'checklist_item_id', operator: 'equals', value: id }
            ],
            fields: [
                { name: "id" },
                { name: "created_at" },
                { name: "checklist_item_id" },
                { name: "title" },
                { name: "url" },
                { name: "created_by_id" },
                { name: "created_by_username" }
            ]
        }); 

        checlistItemDs.links = itemLinksData;
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
}

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

function handleChecked(isChecked: boolean) {
    props.dataObject.update(props.checklistItem.id, {
        is_checked: isChecked
    }, true);
}

async function addLink(link: { url: string; title?: string }) {
    const { toast } = useToast();

    try {
        if (!link.url) {
            toast({
                title: 'Could not add link.',
                description: 'Please enter a URL.',
                variant: "destructive"
            });
            return; 
        }

        await checlistItemDs.links?.insert({
            checklist_item_id: props.checklistItem.id,
            url: link.url,
            title: link.title
        });

        addLinkDropdownOpen.value = false;
        addLinkBtnDropdownOpen.value = false;
        toast({title: 'Link added!'});
    } catch (err) {
        console.error(err);
        toast({
            title: 'Could not add link. An error occurred.',
            description: `Error: ${err.message}`,
            variant: "destructive"
        });
    }
}

async function handleLinkRemoved(link: DataObjectRecord<any>) {
    await checlistItemDs.links?.delete(link.id);
}

function beginEditingDescription() {
    isEditingDesc.value = true;
    nextTick(() => {
        textEditorRef?.value?.focus();
    });
}

function handleDescriptionClick() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        return;
    }
    beginEditingDescription();
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
        console.log('saved record ', props.checklistItem);
        isEditingDesc.value = false;
        // close();
    } catch (err) {
        console.error(err);
    } finally {
        isSaving.value = false;        
    }
}

function setNewColour(colour: string | null) {
    props.checklistItem.bg_colour = colour;
    props.checklistItem.save();
}

const show = async() => {
    isDialogOpen.value = true;
    isEditingDesc.value = false;
    await createDataObjects(props.checklistItem.id);
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