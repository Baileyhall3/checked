<template>
    <Sheet>
        <SheetTrigger as-child>
            <Button
                size="icon"
                variant="ghost"
                class="rounded-full shadow-none gap-0 block me-3"
                aria-label="Open edit menu"
            >
                <Menu :size="16" aria-hidden="true" />
            </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 pt-3 px-6">
            <SheetHeader class="text-left">
                <SheetTitle>Checked</SheetTitle>
                <SheetDescription>
                    Make changes to your profile here. Click save when you're done.
                </SheetDescription>
            </SheetHeader>
            <div class="grid gap-4 py-4">
                oioiiii
            </div>
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
</script>