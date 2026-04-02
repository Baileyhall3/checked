<template>
    <div class="pb-4">
        <div class="flex items-center justify-between pb-4">
            <div>
                <span class="font-semibold">
                    {{ selectedIds.size }} selected
                </span>
            </div>
            <div>
                <slot name="actions" />
            </div>
        </div>
        <div class="justify-between flex items-center">
            <div class="flex items-center gap-2">
                <Checkbox 
                    id="selectAll"
                    :model-value="selectedIds.size === allIds.length"
                    :indeterminate="isIndeterminate"
                    @update:model-value="selectAll"
                />
                <Label for="selectAll" class="text-sm">
                    {{ selectedIds.size === allIds.length ? 'Unelect All' : 'Select All' }}
                </Label>
            </div>
            <div>
                <Button variant="secondary" @click="emit('select-cancelled')">
                    Cancel
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const props = defineProps<{
    selectedIds: Set<number>;
    allIds: number[];
}>();
const emit = defineEmits<{
    (e: 'selectAll', value: boolean): void;
    (e: 'deselectAll'): void;
    (e: 'select-cancelled'): void;
}>();

const isIndeterminate = computed(() =>
    props.selectedIds.size > 0 &&
    props.selectedIds.size < props.allIds.length
)

function selectAll(value: boolean) {
    if (value) {
        emit('selectAll', true);
    } else {
        emit('deselectAll');
    }
}
</script>