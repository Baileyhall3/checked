<template>
    <AlertDialog v-model:open="isDialogOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
                <AlertDialogDescription v-if="props.description">
                    {{ props.description }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <slot></slot>
            <AlertDialogFooter>
                <AlertDialogCancel @click.prevent="resolveConfirm(false)">
                    {{ props.cancelText }}
                </AlertDialogCancel>
                <AlertDialogAction 
                    :class="{ 'bg-red-600' : props.confirmType === 'delete' }"
                    @click.prevent="resolveConfirm(true)"
                >
                    {{ props.confirmText }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ref } from 'vue';
import { Button } from "@/components/ui/button";

type ConfirmButtonType = 'default' | 'delete'

const props = withDefaults(defineProps<{
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    confirmType?: ConfirmButtonType
}>(), {
    title: 'Please Confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmType: 'default'
});

const emit = defineEmits<{
    (e: 'confirmed'): void;
    (e: 'cancelled'): void;
}>();

const isDialogOpen = ref<boolean>(false);
let resolver: ((value: boolean) => void) | null = null;

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

const confirm = (): Promise<boolean> => {
    isDialogOpen.value = true;
    return new Promise((resolve) => {
        resolver = resolve;
    });
};

const resolveConfirm = (value: boolean) => {
    emit(value ? 'confirmed' : 'cancelled');
    isDialogOpen.value = false;
    resolver?.(value);
    resolver = null;
};

defineExpose({show, close, confirm });
</script>