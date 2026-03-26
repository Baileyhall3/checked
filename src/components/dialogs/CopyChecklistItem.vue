<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Copy Item</DialogTitle>
                <DialogDescription>
                    <p>
                        Create a specified number of copies of <span class="font-semibold"> {{ props.item.name }}</span> in the current checklist. 
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="copyChecklist" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="itemName">
                        New Checklist Name
                    </Label>
                    <Input 
                        id="itemName" 
                        placeholder="Name... e.g. 'Groceries'" 
                        type="text" 
                        required 
                        v-model="itemName" 
                        class="border-gray-300 focus:ring-blue-500"
                    />
                </div>
                <div class="*:not-first:mt-2">
                    <Label for="copyCount">
                        Number of Copies to Create
                    </Label>
                    <Input 
                        id="copyCount" 
                        type="number" 
                        required 
                        v-model="copyCount" 
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
    item: DataObjectRecord;
}>();

const emit = defineEmits<{
  (e: 'item-copied'): void
}>();

const isCopying = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);
const itemName = ref<string>();
const copyCount = ref<number>(1);

async function copyChecklist() {
    const { toast } = useToast();

    try {
        isCopying.value = true;

        if (!itemName.value) {
            toast({
                title: 'Could not copy checklist item.',
                description: 'Please enter a name.',
                variant: "destructive"
            });
            return; 
        }

        const { data, error } = await supabase.rpc('copy_checklist_item', {
            p_source_id: props.item.id,
            p_copy_count: copyCount.value,
            p_name: itemName.value
        });

        if (error) {
            toast({
                title: 'Could not copy checklist item. An error occurred.',
                description: `Error: ${error.message}`,
                variant: "destructive"
            });
            throw new Error(`Error copying item: ${error.message}`);
        } else {
            toast({title: 'Item copied!'});
            emit("item-copied");
            itemName.value = '';
            close();
        }
    } catch (err) {
        console.error(err);
    } finally {
        isCopying.value = false;
    }
}

const show = () => {
    itemName.value = props.item.name + ' (Copy)';
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