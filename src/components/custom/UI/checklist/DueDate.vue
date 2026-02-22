<template>
  <div ref="pickerRoot" class="relative inline-block">
    <!-- Trigger -->
    <div
      class="flex items-center gap-1 rounded-lg px-1 py-0.5 border bg-gray-100 cursor-pointer text-sm"
      :class="props.class"
      @click.stop="toggleDatePicker"
    >
      <Clock class="size-4" :class="{ 'opacity-50' : !modelValue }"/>

      <span v-if="modelValue">
        {{ DateUtils.toDateTime(modelValue) }}
      </span>

      <span v-else class="text-gray-500">Set due date</span>
    </div>

    <!-- Inline calendar (floating under button) -->
    <div
      v-if="datePickerOpen"
      class="absolute z-50 mt-2"
    >
      <DatePicker
        v-model="internalDate"
        inline
        showTime
        hourFormat="24"
        class="shadow-lg border rounded-lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePicker from 'primevue/datepicker'
import DateUtils from '@/utils/DateUtils'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Clock } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: Date | null
  class?: string;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const datePickerOpen = ref(false)
const internalDate = ref<Date | null>(props.modelValue);
const pickerRoot = ref<HTMLElement | null>(null);

watch(() => props.modelValue, (v) => {
  internalDate.value = v
})

watch(internalDate, () => {
  datePickerOpen.value = false
})

watch(internalDate, (v) => {
  emit('update:modelValue', v)
})

function toggleDatePicker() {
  datePickerOpen.value = !datePickerOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (!pickerRoot.value) return
  if (!pickerRoot.value.contains(e.target as Node)) {
    datePickerOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>