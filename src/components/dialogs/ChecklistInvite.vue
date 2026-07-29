<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Share Checklist</DialogTitle>
                <DialogDescription>
                    <p>
                        Copy the invite token below and share it with others to allow them to access this checklist. 
                    </p>
                </DialogDescription>
            </DialogHeader>

            <form class="gap-4 flex flex-col" novalidate>
                <div class="*:not-first:mt-2">
                    <Label for="inviteToken">
                        Invite Token
                    </Label>
                    
                    <ButtonGroup class="w-full">
                        <Input 
                            id="inviteToken" 
                            disabled
                            required 
                            v-model="inviteToken" 
                            class="border-gray-300"
                        />
                        <Button
                            type="button"
                            aria-label="Copy Invite Token"
                            variant="secondary"
                            @click="copyInviteToken"
                        >
                            <Copy :size="16" aria-hidden="true" />
                        </Button>
                    </ButtonGroup>
                </div>
            </form>

            <div class="mt-4 gap-2 flex w-full">
                <Button type="button" class="w-full" :disabled="isRegenerating" @click="regenerateInviteToken">
                    Regenerate Invite Token
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ref, computed } from 'vue';
import { supabase } from "@/api/supabase";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast/use-toast";
import { DataObjectRecord } from "supabase-dataobject-core";
import { Copy } from "lucide-vue-next";

const props = defineProps<{
    checklist: DataObjectRecord<any>;
}>();

const isDialogOpen = ref<boolean>(false);
const isRegenerating = ref<boolean>(false);

const { toast } = useToast();

const inviteToken = computed(() => {
    if (!props.checklist.invite_token) {
        return '';
    }

    return `${window.location.origin}/invite/${props.checklist.invite_token}`;
});

async function copyInviteToken() {
    await navigator.clipboard.writeText(inviteToken.value);

    toast({
        title: 'Invite link copied',
    });
}

async function regenerateInviteToken() {
    isRegenerating.value = true;

    try {
        const { data, error } = await supabase.rpc(
            'regenerate_checklist_invite_token',
            {
                p_checklist_id: props.checklist.id
            }
        );

        isRegenerating.value = false;

        if (error) {
            console.error(error);
            return;
        }

        toast({
            title: 'Invite token regenerated',
        });

        const newToken = data[0].invite_token;
        props.checklist.invite_token = newToken;
        props.checklist.refresh();
    } catch(err) {
        console.error(err);
    } finally {
        isRegenerating.value = false;
    }
}

const show = () => {
    isDialogOpen.value = true;
}

const close = () => {
    isDialogOpen.value = false;
}

defineExpose({show, close})
</script>