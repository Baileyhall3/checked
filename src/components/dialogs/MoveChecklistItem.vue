<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Move Checklist Item</DialogTitle>
                <DialogDescription>
                    <p>
                        Move <span class="font-semibold"> {{ props.item.name }}</span> to a new checklist. 
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="moveItem" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="itemChecklist">New Checklist</Label>
                    <div class="select-input">
                        <Select 
                            class="select-input" 
                            :disabled="filteredChecklists.length === 0"
                            v-model="newChecklistId"
                        >
                            <SelectTrigger id="itemChecklist" class="relative ps-9 rounded-lg">
                                <div
                                    class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50"
                                >
                                    <ListCheck class="h-4 w-4" aria-hidden="true" />
                                </div>
                                <SelectValue placeholder="Select checklist" />
                            </SelectTrigger>
                            <SelectContent>
                                <template v-for="checklist in filteredChecklists" :key="checklist.id">
                                    <SelectItem :value="checklist.id">{{ checklist.name }}</SelectItem>
                                </template>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </form>

            <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button type="button" :disabled="isMoving" @click="moveItem()">
                  <Spinner v-if="isMoving" />
                  Move
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
import { ref, computed } from 'vue';
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { DataObject, DataObjectRecord } from "supabase-dataobject-core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListCheck } from "lucide-vue-next";
import { dataSources } from "@/api/dataObjects";
import { useRouter } from "vue-router";

const props = defineProps<{
    item: DataObjectRecord;
    checklist: DataObjectRecord;
    checklistData: DataObject
}>();

const emit = defineEmits<{
  (e: 'item-moved', newChecklistId: number): void
}>();

const isMoving = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);

const router = useRouter();

const filteredChecklists = computed(() => {
    return dataSources.myChecklists?.data.filter(x => x.folder_id === props.checklist.folder_id && x.id !== props.checklist.id) || [];
});

const newChecklistId = ref<number | null>(null);

async function moveItem() {
    const { toast } = useToast();

    try {
        isMoving.value = true;

        if (!newChecklistId.value) {
            toast({
                title: 'Could not move checklist item.',
                description: 'Please select a checklist.',
                variant: "destructive"
            });
            return; 
        }
        
        console.log('new id ', newChecklistId.value)
        props.item.checklist_id = newChecklistId.value;
        await props.checklistData.saveChanges();

        debugger

        toast({title: 'Checklist item moved!'});
        emit("item-moved", newChecklistId.value);
        router.push(`/checklist/${newChecklistId.value}`);
        // close();
    } catch (err) {
        console.error(err);
    } finally {
        isMoving.value = false;
    }
}

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
    newChecklistId.value = null;
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