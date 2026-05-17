<template>
    <SelectRoot
      :model-value="props.priority"
      @update:model-value="(v) => emit('update:priority', v)"
    >

    <!-- 🔘 Custom Trigger (HEADLESS) -->
    <SelectTrigger as-child :disabled="props.disabled">
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
    </SelectTrigger>

    <!-- 📦 Dropdown Content -->
    <SelectContent
      class="
        z-50 mt-6
        min-w-[160px]
        rounded-xl
        border
        bg-white
        shadow-lg
        p-1
      "
    >
      <!-- <SelectScrollUpButton class="flex justify-center py-1">
        <ChevronUp class="h-4 w-4 opacity-50" />
      </SelectScrollUpButton> -->

      <SelectViewport class="p-1" >
        <SelectGroup>

          <SelectItem
            :value="1"
            class="
              flex items-center gap-2
              px-2 py-1.5 rounded-md
              cursor-pointer
              text-sm
              hover:bg-gray-100
              data-[state=checked]:bg-gray-200
            "
          >
            <ItemPriorityCircle :priority="1" />
            High
          </SelectItem>

          <SelectItem
            :value="2"
            class="
              flex items-center gap-2
              px-2 py-1.5 rounded-md
              cursor-pointer
              text-sm
              hover:bg-gray-100
              data-[state=checked]:bg-gray-200
            "
          >
            <ItemPriorityCircle :priority="2" />
            Medium
          </SelectItem>

          <SelectItem
            :value="3"
            class="
              flex items-center gap-2
              px-2 py-1.5 rounded-md
              cursor-pointer
              text-sm
              hover:bg-gray-100
              data-[state=checked]:bg-gray-200
            "
          >
            <ItemPriorityCircle :priority="3" />
            Low
          </SelectItem>

          <SelectSeparator class="my-1 h-px bg-gray-200" />

          <SelectItem
            :value="null"
            class="
              px-2 py-1.5 rounded-md
              cursor-pointer
              text-sm
              hover:bg-gray-100
              text-gray-500
            "
          >
            None
          </SelectItem>

        </SelectGroup>
      </SelectViewport>

      <!-- <SelectScrollDownButton class="flex justify-center py-1">
        <ChevronDown class="h-4 w-4 opacity-50" />
      </SelectScrollDownButton> -->
    </SelectContent>

</SelectRoot>
</template>

<script setup lang="ts">
import ItemPriorityCircle from '../ItemPriorityCircle.vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectGroup,
  SelectSeparator,
} from "reka-ui"

type Priority = 1 | 2 | 3 | null

const props = defineProps<{
    priority: Priority;
    disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:priority', value: Priority): void;
}>()

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
</script>