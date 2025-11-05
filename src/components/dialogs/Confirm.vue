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
                <AlertDialogAction 
                    :class="{ 'bg-red-600' : props.confirmType === 'delete' }"
                    @click="emit('confirmed')"
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ref } from 'vue';

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

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>