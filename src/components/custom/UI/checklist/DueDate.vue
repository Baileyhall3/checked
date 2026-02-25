<template>
  <div ref="pickerRoot" class="relative inline-block">
    <!-- Trigger -->
    <div
      class="flex items-center gap-2 rounded-lg px-1 py-0.5 border bg-gray-100 text-sm"
      :class="props.class, { 'cursor-pointer' : props.editable }"
      @click.stop="toggleDatePicker"
    >
      <Clock class="size-4" :class="{ 'opacity-50' : !modelValue }"/>

      <span v-if="modelValue">
        {{ props.showTime ? DateUtils.toDateTime(modelValue) : DateUtils.toShortDate(modelValue) }}
      </span>

      <span v-else class="text-gray-500">Set due date</span>

      <button
        v-if="modelValue && props.editable"
        type="button"
        class="ml-1 text-gray-400 hover:text-gray-700 transition"
        @click.stop="clearDate"
      >
        <X class="size-4" />
      </button>
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
import { Clock, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: Date | null | string
  showTime?: boolean;
  class?: string;
  editable?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const datePickerOpen = ref(false)
const internalDate = ref<Date | null>(normalizeDate(props.modelValue))
const pickerRoot = ref<HTMLElement | null>(null);

function normalizeDate(v: unknown): Date | null {
  if (!v) return null
  if (v instanceof Date) return v
  const d = new Date(v as any)
  return isNaN(d.getTime()) ? null : d
}

watch(
  () => props.modelValue,
  (v) => {
    const normalized = normalizeDate(v)
    if (
      (normalized?.getTime() ?? null) !==
      (internalDate.value?.getTime() ?? null)
    ) {
      internalDate.value = normalized
    }
  }
)

watch(internalDate, (v) => {
  emit('update:modelValue', v)
  datePickerOpen.value = false
})

function toggleDatePicker() {
  if (props.editable) {
    datePickerOpen.value = !datePickerOpen.value
  }
}

function clearDate() {
  internalDate.value = null
  emit('update:modelValue', null)
  datePickerOpen.value = false
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