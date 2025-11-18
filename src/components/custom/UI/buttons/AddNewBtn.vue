<template>
    <Button @click="handleBtnClick" class="text-white rounded-xl" :class="props.class">
        <Plus v-if="isMobile" :size="16" aria-hidden="true" />
        <span v-else>{{ props.addTerminology }}</span>
    </Button>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useWindowSize } from "@vueuse/core";
import { computed } from 'vue';
import { Plus } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<{
    addTerminology?: string;
    class?: HTMLAttributes["class"];
}>(),
{
    addTerminology: 'Add New'
});

const emit = defineEmits<{
    (e: 'add-clicked'): void
}>();

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

function handleBtnClick() {
    emit("add-clicked");
}
</script>