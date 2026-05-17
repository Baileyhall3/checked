<template>
    <div class="flex items-center justify-between gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg p-2 bg-white hover:bg-gray-100"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
        <a 
            :href="props.link.url" 
            target="_blank" 
            class="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
            <Link class="size-3" />
            {{ props.link.title || props.link.url }}
        </a>
        <div
            class="flex justify-center transition-opacity duration-150"
            :class="(isHovered || menuOpen || isMobile) ? 'opacity-100' : 'opacity-0'"
        >
            <DropdownMenu :open="menuOpen" @update:open="menuOpen = $event">
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        class="opacity-60 active:opacity-100 rounded-full size-6"
                        aria-label="Open edit menu"
                    >
                        <Ellipsis  aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <!-- <DropdownMenuItem class="cursor-pointer justify-between text-red-600" @click="beginEditing">
                        Edit
                    </DropdownMenuItem> -->
                    <DropdownMenuItem class="cursor-pointer justify-between" @click="copyUrl">
                        Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="cursor-pointer justify-between text-red-600" @click="removeLink">
                        Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
        
            </DropdownMenu>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DataObjectRecord } from 'supabase-dataobject-core';
import { Link, Ellipsis } from "lucide-vue-next";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ref, computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const props = defineProps<{
    link: DataObjectRecord<any>;
}>();
const emit = defineEmits<{
    (e: 'remove-link', link: DataObjectRecord<any>): void;
}>();

const isHovered = ref(false);
const menuOpen = ref(false);

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

function copyUrl() {
    navigator.clipboard.writeText(props.link.url);
    menuOpen.value = false;
}

function removeLink() {
    emit('remove-link', props.link);
    menuOpen.value = false;
}
</script>