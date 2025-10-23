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
                <!-- <div class="*:not-first:mt-2">
                    <Label for="checklistFolder">Folder</Label>
                    <div class="select-input">
                        <Select default-value="1" class="select-input">
                            <SelectTrigger id="checklistFolder" class="relative ps-9 rounded-lg">
                                <div
                                    class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[select[disabled]]:opacity-50"
                                >
                                    <Folder class="h-4 w-4" aria-hidden="true" />
                                </div>
                                <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">00:00 AM - 11:59 PM</SelectItem>
                                <SelectItem value="2">01:00 AM - 12:59 PM</SelectItem>
                                <SelectItem value="3">02:00 AM - 01:59 PM</SelectItem>
                                <SelectItem value="4">03:00 AM - 02:59 PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div> -->
                <!-- <div>
                    <Label for="checklistMembers">Checklist Members</Label>
                    <ComboboxRoot
                      v-model="values"
                      multiple
                      ignore-filter
                      class="my-4 mx-auto relative"
                    >
                      <ComboboxAnchor class="w-[400px] inline-flex items-center justify-between rounded-lg p-2 text-[13px] leading-none  gap-[5px] bg-white text-grass11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-grass9 outline-none">
                        <TagsInputRoot
                          v-model="values"
                          delimiter=""
                          class="flex gap-2 items-center rounded-lg flex-wrap"
                        >
                          <TagsInputItem
                            v-for="item in values"
                            :key="item"
                            :value="item"
                            class="flex items-center justify-center gap-2 text-white bg-grass8 aria-[current=true]:bg-grass9 rounded px-2 py-1"
                          >
                            <TagsInputItemText class="text-sm" />
                            <TagsInputItemDelete>
                              <Icon icon="lucide:x" />
                            </TagsInputItemDelete>
                          </TagsInputItem>

                          <ComboboxInput
                            v-model="query"
                            as-child
                          >
                            <TagsInputInput
                              placeholder="Fruits..."
                              class="focus:outline-none flex-1 rounded !bg-transparent  placeholder:text-mauve10 px-1"
                              @keydown.enter.prevent
                            />
                          </ComboboxInput>
                        </TagsInputRoot>

                        <ComboboxTrigger>
                          <Icon
                            icon="radix-icons:chevron-down"
                            class="h-4 w-4 text-grass11"
                          />
                        </ComboboxTrigger>
                      </ComboboxAnchor>

                      <ComboboxContent class="absolute z-10 w-full mt-2 bg-white overflow-hidden rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
                        <ComboboxViewport class="p-[5px]">
                          <ComboboxGroup v-if="filteredOptions.length">
                            <ComboboxLabel class="px-[25px] text-xs leading-[25px] text-mauve11">
                              Fruits
                            </ComboboxLabel>

                            <ComboboxItem
                              v-for="(option, index) in filteredOptions"
                              :key="index"
                              class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-grass8 data-[highlighted]:text-grass1"
                              :value="option"
                            >
                              <ComboboxItemIndicator
                                class="absolute left-0 w-[25px] inline-flex items-center justify-center"
                              >
                                <Icon icon="radix-icons:check" />
                              </ComboboxItemIndicator>
                              <span>
                                {{ option }}
                              </span>
                            </ComboboxItem>
                          </ComboboxGroup>
                        </ComboboxViewport>
                      </ComboboxContent>
                    </ComboboxRoot>
                </div> -->
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

interface ChecklistMember {
    id: number;
    username: string;
}

const emit = defineEmits<{
  (e: 'checklist-created'): void
}>();

const checklistData = reactive({
    name: '',
    folder_id: null,
    folder: '',
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
      p_folder_id: checklistData.folder_id,
      p_owner_id: checklistData.owner_id,
      p_is_template: false,
      p_member_ids: checklistData.checklistMembers
    });

    if (error) {
      toast({
          title: 'Could not create checklist. An error occurred.',
          description: `Error: ${error}`,
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