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

                <div class="*:not-first:mt-2" v-if="!props.folder">
                    <Label for="checklistFolder">Folder</Label>
                    <div class="select-input">
                        <Select 
                          class="select-input" 
                          :disabled="dataSources.myFolders?.data.length === 0"
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

                <div class="*:not-first:mt-2">
                    <Label for="checklistMembers">Checklist Members</Label>
                    <div class="select-input">
                      <Select multiple class="select-input" v-model="checklistData.checklistMembers" :disabled="dataSources.userFriends?.data.length == 0">
                        <SelectTrigger id="checklistMembers" class="relative ps-9 rounded-lg">
                            <div
                                class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50"
                            >
                                <Users class="h-4 w-4" aria-hidden="true" />
                            </div>
                            <SelectValue placeholder="Select members">
                              <template v-if="checklistData.checklistMembers.length > 0">
                                <div v-for="member in checklistData.checklistMembers" :key="member.id" class="flex items-center">
                                  <UserDisplayAvatar :user="member" class="mr-1" size="sm" data-select-ignore />
                                  {{ member.username }}
                                </div>
                              </template>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <template v-for="friend in dataSources.userFriends?.data" :key="friend.id">
                              <SelectItem :value="friend" itemTextClass="flex items-center" :text-value="friend.username">
                                <UserDisplayAvatar :user="friend" class="mr-1" size="sm" data-select-ignore />
                                {{ friend.username }}
                              </SelectItem>
                            </template>
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                <div class="items-top flex gap-x-2 pb-4 mt-2">
                    <Checkbox id="isTemplate" v-model="checklistData.redirect" />
                    <div class="grid gap-1.5 leading-none">
                        <label
                            for="isTemplate"
                            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Open Checklist
                        </label>
                        <p class="text-sm text-muted-foreground">
                          Check this to open the checklist once it has been created.
                        </p>
                    </div>
                </div>
            </form>

            <DialogFooter class="pt-4 gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" class="border">Cancel</Button>
                </DialogClose>
                <Button type="button" :disabled="isCreating || !canCreateChecklist" @click="createChecklist()">
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, Users } from "lucide-vue-next";
import { computed, ref, watch, reactive } from 'vue';
import { supabase } from "@/api/supabase";
import { userStore } from "@/store/userStore";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { dataSources } from "@/api/dataObjects";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "vue-router";
import UserDisplayAvatar from "../custom/UI/UserDisplayAvatar.vue";
import { DataObjectRecord } from "supabase-dataobject-core";

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
  members?: DataObjectRecord<any>[];
}>();

const emit = defineEmits<{
  (e: 'checklist-created'): void
}>();

const checklistData = reactive({
    name: '',
    folder_id: props.folder?.id ?? null,
    folder: props.folder?.name ?? '',
    checklistMembers: [],
    owner_id: userStore.userProfile?.id,
    redirect: true
});

const isCreating = ref<boolean>(false);
const isDialogOpen = ref<boolean>(false);

const canCreateChecklist = computed(() => {
  return checklistData.name.trim() !== '';
});

const router = useRouter();

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

    const memberIds = checklistData.checklistMembers.map((member: DataObjectRecord<any>) => member.friend_user_id);

    const { data, error } = await supabase.rpc('create_checklist', {
      p_name: checklistData.name,
      p_folder_id: props.folder?.id ?? checklistData.folder_id,
      p_owner_id: checklistData.owner_id,
      p_is_template: false,
      p_member_ids: memberIds
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
      if (checklistData.redirect) {
        const newChecklistId = data[0].checklist_id;
        router.push(`/checklist/${newChecklistId}`);
      }
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
  if (props.members && props.members.length > 0) {
    checklistData.checklistMembers = props.members;
  }
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