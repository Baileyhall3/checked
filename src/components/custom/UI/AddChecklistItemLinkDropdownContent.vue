<template>
    <DropdownMenuContent>
        <DropdownMenuLabel>Add Link</DropdownMenuLabel>
        <div class="gap-4 flex flex-col p-2">
            <div class="*:not-first:mt-2">
                <Label for="linkUrl">
                    URL
                </Label>
                <Input 
                    id="linkUrl" 
                    placeholder="https://example.com" 
                    type="text" 
                    required 
                    v-model="link.url" 
                    class="border-gray-300 focus:ring-blue-500"
                />
            </div>
            <div class="*:not-first:mt-2">
                <Label for="linkTitle">
                    Title (optional)
                </Label>
                <Input 
                    id="linkTitle" 
                    placeholder="Example.com" 
                    type="text" 
                    required 
                    v-model="link.title" 
                    class="border-gray-300 focus:ring-blue-500"
                />
            </div>
            <div class="flex flex-col w-full mt-2 gap-2">
                <Button size="sm" @click="emit('add-link', link)" class="w-full">
                    Add
                </Button>
                <Button variant="secondary" size="sm" @click="emit('cancel-create')" class="w-full">
                    Cancel
                </Button>
            </div>
        </div>
    </DropdownMenuContent>
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from 'vue';

interface LinkData {
    url: string;
    title?: string;
}

// const props = defineProps<{
//     link: LinkData
// }>();
const emit = defineEmits<{
    // (e: 'update:modelValue', value: LinkData): void;
    (e: 'add-link', link: LinkData): void;
    (e: 'cancel-create'): void;
}>();

const link = ref({
    url: '',
    title: ''
});

// const link = computed({
//     get: () => props.modelValue,
//     set: (val) => emit('update:modelValue', val)
// });
</script>