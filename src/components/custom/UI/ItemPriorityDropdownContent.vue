<template>
    <DropdownMenuContent>
        <DropdownMenuItem class="cursor-pointer" @click="emit('update:priority', 3)">
            <ItemPriorityCircle :priority="3" />
            Low
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" @click="emit('update:priority', 2)">
            <ItemPriorityCircle :priority="2" />
            Medium
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer" @click="emit('update:priority', 1)">
            <ItemPriorityCircle :priority="1" />
            High
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer" @click="emit('update:priority', null)">
            <ItemPriorityCircle :priority="null" />
            None
        </DropdownMenuItem>
    </DropdownMenuContent>
</template>

<script setup lang="ts">
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import ItemPriorityCircle from "./ItemPriorityCircle.vue";

const emit = defineEmits<{
    (e: 'update:priority', priority: number | null): void;
}>();
</script>