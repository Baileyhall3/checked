<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Import Items</DialogTitle>
                <DialogDescription>
                    <p>
                        Paste a <span class="font-bold">line-separated list</span> below. 
                    </p>
                    <p v-if="importItems.length" class="text-sm mt-2 text-muted-foreground">
                        {{ importItems.length }} item{{ importItems.length === 1 ? '' : 's' }} will be created.
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="copyChecklist" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="checklistName">
                        Items to Create
                    </Label>
                    <div class="rounded-xl border border-gray-300">
                        <!-- Editable Area -->
                        <div
                            ref="editor"
                            class="rich-editor p-4 h-[14rem] outline-none text-sm sm:text-base overflow-y-auto"
                            contenteditable="true"
                            @input="onInput"
                            @paste="sanitizePaste"
                        ></div>
                    </div>
                </div>
            </form>

            <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button
                    type="button"
                    :disabled="isImporting || importItems.length === 0"
                    @click="copyChecklist()"
                >
                    <Spinner v-if="isImporting" />
                    Import {{ importItems.length || '' }} Items
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
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ref} from 'vue';
import { supabase } from "@/api/supabase";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { DataObjectRecord } from "supabase-dataobject-core";

const props = defineProps<{
    checklist: DataObjectRecord;
}>();

const emit = defineEmits<{
  (e: 'items-imported'): void
}>();

const isImporting = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);
const editor = ref<HTMLElement | null>(null);
const importHtml = ref('');
const importItems = ref<string[]>([]);

function parseLines(html: string) {
    const temp = document.createElement('div')
    temp.innerHTML = html

    const text = temp.innerText

    return text
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean)
}

function onInput() {
    const html = editor.value?.innerHTML || ''
    importHtml.value = html
    importItems.value = parseLines(html)
}

function sanitizePaste(event: ClipboardEvent) {
    event.preventDefault()

    const text = event.clipboardData?.getData('text/plain') || ''

    document.execCommand('insertText', false, text)
}

async function copyChecklist() {
    const { toast } = useToast();

    try {
        isImporting.value = true;

        if (importItems.value.length == 0) {
            toast({
                title: 'Could not import items.',
                description: 'You must paste at least one line.',
                variant: "destructive"
            });
            return; 
        }

        const { error } = await supabase.rpc('import_checklist_items', {
            p_checklist_id: props.checklist.id,
            p_items: importItems.value
        });

        if (error) {
            toast({
                title: 'Could not copy checklist. An error occurred.',
                description: `Error: ${error.message}`,
                variant: "destructive"
            });
            throw new Error(`Error copying checklist: ${error.message}`);
        } else {
            toast({title: 'Checklist copied!'});
            emit("items-imported");
            importItems.value = [];
            close();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isImporting.value = false;
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