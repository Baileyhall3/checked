<template>
    <AlertDialog v-model:open="isDialogOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ props.title }}</AlertDialogTitle>
                <AlertDialogDescription v-if="props.description">
                    {{ props.description }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="emit('cancelled')">
                    {{ props.cancelText }}
                </AlertDialogCancel>
                <AlertDialogAction @click="emit('confirmed')">
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ref } from 'vue';

const props = withDefaults(defineProps<{
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}>(), {
    title: 'Please Confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
});

const emit = defineEmits<{
    (e: 'confirmed'): void;
    (e: 'cancelled'): void;
}>();

const isDialogOpen = ref<boolean>(false);

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>