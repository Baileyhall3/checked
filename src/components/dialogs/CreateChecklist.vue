<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Create Checklist</DialogTitle>
                <DialogDescription>
                    Create a new checklist.
                </DialogDescription>
            </DialogHeader>

            <form class="mt-4 gap-4 flex flex-col" @submit.prevent="createChecklist" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="checklistName">
                        Name
                    </Label>
                    <Input 
                        id="checklistName" 
                        placeholder="Name... e.g. 'Groceries'" 
                        type="text" 
                        required 
                        v-model="checklistData.name" 
                        class="border-gray-300 focus:ring-blue-500"
                    />
                    <!-- <p
                        class="text-destructive mt-2 text-xs"
                        role="alert"
                        aria-live="polite"
                        >
                        {{ errors.username }}
                    </p> -->
                </div>
                <div class="*:not-first:mt-2">
                    <Label for="checklistFolder">Folder</Label>
                    <div class="select-input">
                        <Select 
                          :default-value="props.folder?.id" 
                          class="select-input" 
                          :disabled="dataSources.myFolders?.data.length === 0 || props.folder?.id"
                          v-model="checklistData.folder_id"
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
                                <template v-for="folder in dataSources.myFolders?.data" :key="folder.id">
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
                <Button type="button" :disabled="isCreating" @click="createChecklist()">
                  <Spinner v-if="isCreating" />
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
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { ComboboxAnchor, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxLabel, ComboboxRoot, ComboboxTrigger, ComboboxViewport, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText, TagsInputRoot, useFilter } from 'reka-ui'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder } from "lucide-vue-next";
import { computed, ref, watch, reactive } from 'vue';
import { supabase } from "@/api/supabase";
import { userStore } from "@/store/userStore";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { dataSources } from "@/api/dataObjects";

interface ChecklistMember {
    id: number;
    username: string;
}

interface ChecklistFolder {
  id: number;
  name: string;
}

const props = defineProps<{
  folder?: ChecklistFolder;
}>();

const emit = defineEmits<{
  (e: 'checklist-created'): void
}>();

const checklistData = reactive({
    name: '',
    folder_id: props.folder?.id ?? null,
    folder: props.folder?.name ?? '',
    checklistMembers: [],
    owner_id: userStore.userProfile?.id
});

const isCreating = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);

const { contains } = useFilter({ sensitivity: 'base' })

const query = ref('')
const values = ref(['Apple'])
const options = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']

const filteredOptions = computed(() => options.filter(option => contains(option, query.value) && !values.value.includes(option)))

watch(values, () => {
  query.value = ''
}, { deep: true })

async function createChecklist() {
  const { toast } = useToast();

  try {
    isCreating.value = true;

    if (!checklistData.name) {
      toast({
          title: 'Could not create checklist.',
          description: 'Please enter a name.',
          variant: "destructive"
      });
      return; 
    }

    const { data, error } = await supabase.rpc('create_checklist', {
      p_name: checklistData.name,
      p_folder_id: props.folder?.id ?? checklistData.folder_id,
      p_owner_id: checklistData.owner_id,
      p_is_template: false,
      p_member_ids: checklistData.checklistMembers
    });

    if (error) {
      toast({
          title: 'Could not create checklist. An error occurred.',
          description: `Error: ${error.message}`,
          variant: "destructive"
      });
      throw new Error(`Error creating checklist: ${error.message}`);
    } else {
      toast({title: 'Checklist created!'});
      emit("checklist-created");
      resetChecklistData();
      close();
    }

  } catch (err) {
    console.error(err);
  } finally {
    isCreating.value = false;
  }
}

function resetChecklistData() {
  checklistData.name = '';
  checklistData.checklistMembers = [];
  checklistData.folder = '';
  checklistData.folder_id = null;
  checklistData.owner_id = userStore.userProfile?.id
}

const show = () => {
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