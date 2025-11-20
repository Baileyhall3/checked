<template>
    <div>
        <div class="flex justify-between items-center">
            <span class="text-xl font-medium flex items-center">
                {{ props.headerText }}
                <slot name="header"></slot>
            </span>
            <Button
                @click="toggleCollapse"
                variant="ghost"
                class="rounded-xl shadow-none hover:bg-gray-200"
            >
                <ChevronRight :size="16" aria-hidden="true" v-if="isCollapsed" />
                <ChevronDown :size="16" aria-hidden="true" v-else />
            </Button>
        </div>
        <div class="space-y-3" v-if="!isCollapsed">
            <template v-for="(item, index) in props.items" :key="item.id">
                <ChecklistItem :item="item" :checklistData="props.checklistData" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChecklistItem from './UI/ChecklistItem.vue';
import type { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { Button } from "@/components/ui/button";

const props = defineProps<{
    items: DataObjectRecord[];
    checklistData: DataObject;
    headerText?: string;
    collapsible?: boolean;
}>()

const isCollapsed = ref<boolean>(false);

function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value;
}
</script>