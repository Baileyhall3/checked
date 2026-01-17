<template>
    <Star 
        v-if="isDefault"
        class="size-4 opacity-60 fill-yellow-400 text-yellow-400" 
        aria-hidden="true" 
    />
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import { computed } from 'vue';
import { dataSources } from '@/api/dataObjects';

const props = defineProps<{
    type: "folder" | "checklist";
    id: number;
}>();

const isDefault = computed(() => {
    return dataSources.user?.currentRecord?.default_view_type === props.type &&
        dataSources.user?.currentRecord?.default_view_id === props.id;
});
</script>