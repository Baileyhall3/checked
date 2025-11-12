<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader class="contents space-y-0 text-left">
                <DialogTitle class="border-b px-6 py-4 text-base">
                    Remove PIN
                </DialogTitle>
            </DialogHeader>
            <div class="justify-center p-6">
                <p class="text-sm text-muted-foreground">
                    Enter the PIN for this {{ props.type }} in order to remove it.
                </p>
            </div>
            <div class="space-y-4">
                <div class="flex justify-center">
                    <PinInput
                        v-model="pinValue"
                        class="flex items-center gap-3"
                    >
                        <PinInputGroup class="flex items-center gap-3">
                            <PinInputSlot
                                v-for="(id, index) in 4"
                                :disabled="isChecking"
                                :key="id"
                                :index="index"
                                ref="inputRef"
                                class="focus:border-ring focus:ring-ring/50 border-input size-9 rounded-md border font-medium shadow-xs transition-[color,box-shadow] focus:ring-[3px]"
                            ></PinInputSlot>
                        </PinInputGroup>
                    </PinInput>
                </div>
            </div>
            <div class="px-6 pt-4 pb-6">
                <DialogFooter class="pt-4 gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" class="border">Cancel</Button>
                    </DialogClose>
                    <Button type="button" :disabled="pinValue.length !== 4" @click="removePin()">
                        <Spinner v-if="isChecking" />
                        Save
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { DataObject, DataObjectRecord } from 'supabase-dataobject-core';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ref } from 'vue';
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";
import { useToast } from '../ui/toast';
import { supabase } from "@/api/supabase";

const props = defineProps<{
    item: DataObjectRecord;
    dataObject: DataObject;
    type: 'folder' | 'checklist';
}>();

const isDialogOpen = ref<boolean>(false);
const isChecking = ref<boolean>(false);

const pinValue = ref<string[]>([]);

const { toast } = useToast();

async function removePin() {
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
            await props.dataObject.update(props.item.id, {
                pin_protected_at: null
            });
            toast({ title: 'PIN removed' });
            // props.dataObject.refresh();
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