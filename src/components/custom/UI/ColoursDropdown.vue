<template>
    <DropdownMenuContent>
        <DropdownMenuLabel>Select Colour</DropdownMenuLabel>
        <div class="flex flex-wrap justify-center gap-4 border-t pt-6 w-full p-4">
            <div v-for="colour in selectableColours"
                :key="colour"
                class="flex items-center justify-center rounded-full text-white text-lg font-semibold cursor-pointer transition duration-200"
                @click="selectColour(colour)"
                :style="{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: colour,
                    border: colour === props.currentColour ? '2px solid black' : 'none'
                }"
            >
            </div>
            <!-- <div v-if="props.allowClear" class="flex items-center justify-center rounded-full text-gray-500 text-lg font-semibold cursor-pointer transition duration-200">
                <Ban 
                    style="width: 1rem; height: 1rem"
                    @click="selectColour(null)" 
                />
            </div> -->
        </div>
    </DropdownMenuContent>
</template>

<script setup lang="ts">
import { DropdownMenuContent,  DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Ban } from "lucide-vue-next";

const props = defineProps<{
    currentColour?: string;
    allowClear?: boolean;
}>();

const emit = defineEmits<{
    (e: 'colour-selected', colour: string | null): void
}>();

const selectableColours = [
    '#FF6B6B', // red
    '#6BCB77', // green
    '#4D96FF', // blue
    '#FFD93D', // yellow
    '#FF6EC7', // pink
    '#9D4EDD', // purple
    '#00C49A', // teal
    '#FFA07A', // light salmon
    '#20B2AA', // light sea green
    '#778899'  // light slate gray
]

function selectColour(colour: string | null) {
    emit("colour-selected", colour);
}
</script>