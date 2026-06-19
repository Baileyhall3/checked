<template>
    <div
        class="search-container"
        :class="{ 
            expanded: isExpanded,
            animated: props.animateSearch
        }"
        @focusout="collapseSearch"
    >
        <InputGroup class="bg-white rounded-xl search-group">

            <InputGroupAddon
                :class="{ 'cursor-pointer': props.animateSearch }"
                class="cursor-pointer text-black hover:text-black/70"
                @click="expandSearch"
            >
                <Search :size="16" />
            </InputGroupAddon>

            <InputGroupInput
                ref="searchInput"
                :placeholder="props.placeHolder"
                v-model="searchQuery"
                class="search-input"
                @keydown.enter="enterSearch"
                @input="enterSearch"
                @focus="isExpanded = true"
            />

            <InputGroupAddon
                v-if="searchQuery"
                align="inline-end"
                @click="clearSearch"
            >
                <InputGroupButton size="icon-sm">
                    <X :size="16" />
                </InputGroupButton>
            </InputGroupAddon>

        </InputGroup>
    </div>
</template>

<script setup lang="ts">
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupButton
} from "@/components/ui/input-group";

import { Search, X } from "lucide-vue-next";
import { ref, nextTick } from "vue";

export interface IProps {
    placeHolder?: string
    animateSearch?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    placeHolder: "Search..."
});

const emit = defineEmits(["search-entered"]);

const searchQuery = ref("");
const isExpanded = ref(false);
const searchInput = ref();

async function expandSearch() {
    if (!props.animateSearch) {
        return;
    }
    isExpanded.value = true;

    await nextTick();
    searchInput.value?.$el?.focus();
}

function enterSearch() {
    emit("search-entered", searchQuery.value);
}

function clearSearch() {
    searchQuery.value = "";
    emit("search-entered", "");
}

function collapseSearch() {
    if (props.animateSearch && !searchQuery.value) {
        isExpanded.value = false;
    }
}

</script>

<style scoped>
.search-container {
    width: 100%;
}

.search-container.animated {
    width: 40px;
    transition: width 250ms ease;
}

.search-container.animated.expanded {
    width: 300px;
}

.search-input {
    width: auto;
}

/* Only collapse input for animated mode */
.search-container.animated .search-input {
    width: 0;
    opacity: 0;
    padding: 0;
    border: 0;
    transition: width 250ms ease, opacity 150ms ease, padding 250ms ease;
}

.search-container.animated.expanded .search-input {
    width: 100%;
    opacity: 1;
    padding: 0 8px;
}
</style>