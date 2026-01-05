<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Move Checklist</DialogTitle>
                <DialogDescription>
                    <p>
                        Move {{ props.checklist.name }} to a new folder. 
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="moveChecklist" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="checklistFolder">New Folder</Label>
                    <div class="select-input">
                        <Select 
                            class="select-input" 
                            :disabled="folderData.length === 0"
                            v-model="newFolderId"
                        >
                            <SelectTrigger id="checklistFolder" class="relative ps-9 rounded-lg">
                                <div
                                    class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50"
                                >
                                    <Folder class="h-4 w-4" aria-hidden="true" />
                                </div>
                                <SelectValue placeholder="Select folder" />
                            </SelectTrigger>
                            <SelectContent>
                                <template v-for="folder in folderData" :key="folder.id">
                                    <SelectItem :value="folder.id">{{ folder.name }}</SelectItem>
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
                <Button type="button" :disabled="isMoving" @click="moveChecklist()">
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
import { Folder } from "lucide-vue-next";
import { dataSources } from "@/api/dataObjects";
import { useRouter } from "vue-router";

const props = defineProps<{
    checklist: DataObjectRecord;
    checklistData: DataObject;
}>();

const emit = defineEmits<{
  (e: 'checklist-moved', newFolderId: number): void
}>();

const isMoving = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);

const router = useRouter();

const folderData = computed(() => {
    return dataSources.myFolders?.data.filter(x => x.id !== props.checklist.folder_id) || [];
});

const newFolderId = ref<number | null>(null);

async function moveChecklist() {
    const { toast } = useToast();

    try {
        isMoving.value = true;

        if (!newFolderId.value) {
            toast({
                title: 'Could not copy checklist.',
                description: 'Please select a folder.',
                variant: "destructive"
            });
            return; 
        }

        props.checklist.folder_id = newFolderId.value;
        await props.checklistData.saveChanges();

        toast({title: 'Checklist moved!'});
        emit("checklist-moved", newFolderId.value);
        router.push(`/folder/${newFolderId.value}`);
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
    newFolderId.value = null;
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