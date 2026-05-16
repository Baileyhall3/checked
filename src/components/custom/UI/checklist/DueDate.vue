<template>
  <div ref="pickerRoot" class="relative inline-block">
    <!-- Trigger -->
    <div
      class="flex items-center gap-2 rounded-lg px-1 py-0.5 border text-sm"
      :class="[backgroundClass, props.class, { 'cursor-pointer hover:bg-gray-200' : props.editable }]"
      :title="dueTitle"
      @click.stop="toggleDatePicker"
    >
      <Clock class="size-4" :class="{ 'opacity-50' : !modelValue }" />

      <span v-if="modelValue">
        {{ props.showTime ? DateUtils.toDateTime(modelValue) : DateUtils.toShortDate(modelValue) }}
      </span>

      <span v-else class="text-gray-500">Set due date</span>

      <button
        v-if="modelValue && props.editable"
        type="button"
        class="ml-1  hover:text-gray-700 transition"
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
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Clock, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: Date | null | string
  showTime?: boolean;
  class?: string;
  editable?: boolean;
  isComplete?: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const datePickerOpen = ref(false)
const internalDate = ref<Date | null>(normalizeDate(props.modelValue))
const pickerRoot = ref<HTMLElement | null>(null);

const backgroundClass = computed(() => {
  if (!internalDate.value) return 'bg-gray-100'

  if (props.isComplete) {
    return 'bg-green-600 text-white';
  }

  const now = new Date()
  const due = internalDate.value
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffMs < 0) {
    return 'bg-red-200 border-red-700 text-red-700'
  }

  if (diffHours <= 24) {
    return 'bg-yellow-200 border-yellow-700 text-yellow-700'
  }

  return 'bg-gray-100'
});

const dueTitle = computed(() => {
  if (!internalDate.value) return 'No due date set'

  if (props.isComplete) return 'Item completed'

  const now = new Date()
  const due = internalDate.value
  const diffMs = due.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const formatted = props.showTime
    ? DateUtils.toDateTime(due)
    : DateUtils.toShortDate(due)

  if (diffMs < 0) {
    const overdueMinutes = Math.abs(diffMinutes)
    const overdueHours = Math.abs(diffHours)
    const overdueDays = Math.abs(diffDays)

    if (overdueMinutes < 60) {
      return `Overdue by ${overdueMinutes} minute${overdueMinutes === 1 ? '' : 's'}`
    }

    if (overdueHours < 24) {
      return `Overdue by ${overdueHours} hour${overdueHours === 1 ? '' : 's'}`
    }

    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`
  }

  if (diffMinutes < 60) {
    return `Due in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`
  }

  if (diffHours < 24) {
    return `Due in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
  }

  if (diffDays === 1) {
    return `Due tomorrow at ${DateUtils.toDateTime(due)}`
  }

  return `Due on ${formatted}`
});

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