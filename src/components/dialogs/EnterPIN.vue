<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    Enter PIN
                </DialogTitle>
            </DialogHeader>
            <div class="justify-center p-6">
                <p class="text-sm text-muted-foreground">
                    This {{ props.type }} is protected by a PIN. Enter the correct PIN to continue.
                </p>
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
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { DataObjectRecord } from 'supabase-dataobject-core';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ref } from 'vue';
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";
import { useToast } from '../ui/toast';
import { supabase } from "@/api/supabase";

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