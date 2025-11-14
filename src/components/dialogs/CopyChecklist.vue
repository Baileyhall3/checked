<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Copy Checklist</DialogTitle>
                <DialogDescription>
                    <p>
                        Create a copy of {{ props.checklist.name }} in the current folder. 
                    </p>
                    <p>
                        Copying checklists which are templates will copy all items from the checklists, marking them <span class="font-bold">unchecked</span>.
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="copyChecklist" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="checklistName">
                        New Checklist Name
                    </Label>
                    <Input 
                        id="checklistName" 
                        placeholder="Name... e.g. 'Groceries'" 
                        type="text" 
                        required 
                        v-model="checklistName" 
                        class="border-gray-300 focus:ring-blue-500"
                    />
                </div>
            </form>

            <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button type="button" :disabled="isCopying" @click="copyChecklist()">
                  <Spinner v-if="isCopying" />
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
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  (e: 'checklist-copied', newChecklistId: number): void
}>();

const isCopying = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);
const checklistName = ref<string>();

async function copyChecklist() {
    const { toast } = useToast();

    try {
        isCopying.value = true;

        if (!checklistName.value) {
            toast({
                title: 'Could not copy checklist.',
                description: 'Please enter a name.',
                variant: "destructive"
            });
            return; 
        }

        const { data, error } = await supabase.rpc('copy_checklist', {
            p_source_checklist_id: props.checklist.id,
            p_new_name: checklistName.value,
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
            emit("checklist-copied", data);
            checklistName.value = '';
            close();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isCopying.value = false;
    }
}

const show = () => {
    checklistName.value = props.checklist.name + ' (Copy)';
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>

<style scoped>
.select-input {
    --tw-border-opacity: 1 !important;
    border-color: rgb(209 213 219 / var(--tw-border-opacity, 1)) !important;
    border-width: 1px;
    border-radius: calc(var(--radius) - 2px);
}
</style>