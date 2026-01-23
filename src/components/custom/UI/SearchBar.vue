<template>
    <InputGroup class="bg-white rounded-md ">
        <InputGroupInput 
            :placeholder="props.placeHolder" 
            type="text" 
            v-model="searchQuery"
            oninput="this.style.cursor='none';" 
            onmousemove="this.style.cursor='auto';" 
            @keydown.enter="enterSearch"
        />
        <InputGroupAddon>
            <Search :size="16" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" v-if="searchQuery" @click="clearSearch">
            <InputGroupButton size="icon-sm" aria-label="Subscribe">
                <X :size="16" aria-hidden="true" />
            </InputGroupButton>
        </InputGroupAddon>
    </InputGroup>
</template>

<script setup lang="ts">
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton
} from "@/components/ui/input-group";
import { Search, X } from "lucide-vue-next";
import { ref } from 'vue';

export interface IProps {
    placeHolder?: string
}
const props = withDefaults(defineProps<IProps>(), { placeHolder: 'Search... '});

const emit = defineEmits(["search-entered"])
const searchQuery = ref<string | null>("");

function enterSearch() {
    emit("search-entered", searchQuery.value);
}

function clearSearch() {
    searchQuery.value = null;
    emit("search-entered", searchQuery.value);
}
</script>