<template>
    <Sheet>
        <SheetTrigger as-child>
            <Button
                size="icon"
                variant="ghost"
                class="rounded-full"
                aria-label="Open edit menu"
            >
                <Menu :size="16" aria-hidden="true" />
            </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 pt-3 px-6">
            <SheetHeader class="text-left">
                <SheetTitle>Checked</SheetTitle>
                
            </SheetHeader>
            <ChecklistTree />
        </SheetContent>
    </Sheet>
</template>

<script setup lang="ts">
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetContent,
  SheetClose
} from '@/components/ui/sheet';
import Button from '@/components/ui/button/Button.vue';
import { Menu } from 'lucide-vue-next';
import ChecklistTree from './ChecklistTree.vue';
</script>