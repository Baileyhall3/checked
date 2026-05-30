<template>
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          class="flex items-center gap-2 rounded-lg px-1 py-0.5 border bg-gray-100 text-sm"
          :class="{ 'cursor-pointer hover:bg-gray-200' : !props.disabled }"
          :title="`${priorityLabel(props.priority)} priority`"
        >
          <template v-if="props.priority">
            <ItemPriorityCircle :priority="props.priority" />
            <span>{{ priorityLabel(props.priority) }}</span>
          </template>
          <template v-else>
            <span class="text-gray-500">Priority</span>
          </template>
        </div>
      </DropdownMenuTrigger>
      <ItemPriorityDropdownContent @update:priority="handlePriorityUpdate" v-if="!props.disabled" />
    </DropdownMenu>
</template>

<script setup lang="ts">
import ItemPriorityCircle from '../ItemPriorityCircle.vue'; 
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ItemPriorityDropdownContent from '../ItemPriorityDropdownContent.vue';

type Priority = 1 | 2 | 3 | null

const props = defineProps<{
    priority: Priority;
    disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:priority', value: Priority): void;
}>();

const priorityLabel = (priority: Priority) => {
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

function handlePriorityUpdate(newPriority: Priority) {
    emit('update:priority', newPriority);
}
</script>