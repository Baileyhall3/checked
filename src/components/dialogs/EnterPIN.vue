<template>
    <AlertDialog v-model:open="isDialogOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Enter PIN</AlertDialogTitle>
                <AlertDialogDescription>
                    This {{ props.type }} is protected by a PIN. Enter the correct PIN to continue.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div class="flex justify-center mt-6">
                <PinInput
                    v-model="pinValue"
                    class="flex items-center gap-3"
                    @complete="handleComplete"
                >
                    <PinInputGroup class="flex items-center gap-3">
                        <PinInputSlot
                            :disabled="isChecking"
                            v-for="(id, index) in 4"
                            :key="id"
                            :index="index"
                            ref="inputRef"
                            class="focus:border-ring focus:ring-ring/50 border-input size-9 rounded-md border font-medium shadow-xs transition-[color,box-shadow] focus:ring-[3px]"
                        ></PinInputSlot>
                    </PinInputGroup>
                </PinInput>
            </div>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import { DataObjectRecord } from 'supabase-dataobject-core';
import { ref } from 'vue';
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";
import { useToast } from '../ui/toast';
import { supabase } from "@/api/supabase";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const props = defineProps<{
    item: DataObjectRecord;
    type: 'folder' | 'checklist';
}>();

const emit = defineEmits<{
    (e: 'pin-accepted'): void;
}>();

const isDialogOpen = ref<boolean>(false);
const isChecking = ref<boolean>(false);

const pinValue = ref<string[]>([]);

const { toast } = useToast();

async function handleComplete() {
    const pin = pinValue.value.join('');
    if (pin.length !== 4) return;

    isChecking.value = true;

    try {
        const fn = props.type === 'folder' ? 'verify_folder_pin' : 'verify_checklist_pin';
        const { data, error } = await supabase.rpc(fn, {
            p_id: props.item.id,
            p_pin: pin
        });

        if (error) throw error;

        if (data === true) {
            toast({ title: 'PIN accepted' });
            emit("pin-accepted");
            close();
        } else {
            toast({
                title: 'Incorrect PIN. Please try again.',
                variant: "destructive"
            });
            pinValue.value = []; // reset inputs
        }
    } catch (err: any) {
        console.error(err);
        toast({
            title: 'Error verifying PIN',
            description: err.message,
            variant: "destructive"
        });
    } finally {
        isChecking.value = false;
    }
}

const show = () => {
    pinValue.value = [];
    isDialogOpen.value = true;
}

const close = () => {
    pinValue.value = [];
    isDialogOpen.value = false;
}

defineExpose({ show, close })
</script>