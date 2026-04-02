import { ref, computed, watch } from 'vue'

export function useSelectionControl(ids: number[]) {
    const isAllSelected = ref(false);
    const selectedIds = ref(new Set<number>());
    const allowSelection = ref(false);

    function selectAll(val: boolean) {
        selectedIds.value = val ? new Set(ids) : new Set()
    }

    const isIndeterminate = computed(() =>
        selectedIds.value.size > 0 &&
        selectedIds.value.size < ids.length
    )

    watch(allowSelection, val => {
        if (!val) selectedIds.value = new Set()
    });

    function updateSelected(isSelected: boolean, id: number) {
        if (!allowSelection.value && isSelected && selectedIds.value.size === 0) {
            allowSelection.value = true;
        } else if (allowSelection.value && !isSelected && selectedIds.value.size === 1) {
            allowSelection.value = false;
        }
        if (isSelected) {
            selectedIds.value.add(id);
        } else {
            selectedIds.value.delete(id);
        }
    }

    return {
        isAllSelected,
        selectedIds,
        allowSelection,
        selectAll,
        isIndeterminate,
        updateSelected
    }
}