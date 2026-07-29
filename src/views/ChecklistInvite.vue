<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <!-- <Blurred>
                <template #center>
                    <div class="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span>Preferences</span>
                    </div>
                </template>
            </Blurred> -->
            <Loading v-if="isLoading" />
            <div v-else class="min-h-screen bg-gray-100 flex items-center justify-center">
                <div class="flex items-center h-full container mx-auto px-4 py-4">
                    <Empty v-if="tokenIsValid">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <X />
                            </EmptyMedia>
                            <EmptyTitle>Invalid Invite Token</EmptyTitle>
                            <EmptyDescription>
                                The invite token you provided is invalid or has expired. Please check the link and try again.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div class="flex gap-2">
                                <RouterLink :to="`/home`">
                                    <Button>
                                        Home
                                    </Button>
                                </RouterLink>
                            </div>
                        </EmptyContent>
                    </Empty>
                    <RoundedContainer v-else class="p-4 mt-6">
                        <div class="mb-4">
                            <p class="text-muted-foreground">
                                You have been invited to join the checklist <span class="font-semibold">{{ inviteDs.checklist?.currentRecord?.name }}</span>. 
                            </p>
                            <p class="text-muted-foreground">
                                Click the button below to join the checklist and start collaborating with others.
                            </p>
                        </div>
                        <div class="w-full">
                            <Button class="w-full" @click="joinChecklist" :disabled="isJoining">Join Checklist</Button>
                        </div>
                    </RoundedContainer>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonPage, onIonViewDidLeave} from '@ionic/vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import Blurred from '@/components/header/Blurred.vue';
import { useToast } from "@/components/ui/toast/use-toast";
import { Button } from "@/components/ui/button";
import type { DataObjectRecord, DataObject } from 'supabase-dataobject-core';
import { onIonViewDidEnter } from '@ionic/vue';
import { reactive, ref } from 'vue';
import { createDataObject } from 'supabase-dataobject-core';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/api/supabase';
import Loading from '@/components/custom/UI/Loading.vue';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { X } from 'lucide-vue-next';

const { toast } = useToast(); 
const route = useRoute();
const router = useRouter();

const inviteDs = reactive({
    checklist: null as DataObject<any> | null
});

const isLoading = ref<boolean>(false);
const isJoining = ref<boolean>(false);
const tokenIsValid = ref<boolean>(true);

onIonViewDidEnter(async() => {
    isLoading.value = true;

    const tokenParam = route.params.token as string;

    if (!tokenParam) {
        console.error('Invalid invite token:', tokenParam);
        return;
    }

    inviteDs.checklist = null;
    dataSources.manager?.removeDataObject('checklistInvite');
    
    try {    
        const checklistInviteData = await createDataObject('checklistInvite', {
            viewName: 'checklists',
            tableName: 'checklists',
            whereClauses: [
                { field: 'invite_token', operator: 'equals', value: tokenParam }
            ],
            fields: [
                { name: "id" },
                { name: "name" },
            ],
        }); 
    
        inviteDs.checklist = checklistInviteData;

        if (checklistInviteData?.data.length === 0 || !checklistInviteData) {
            tokenIsValid.value = true;
            // router.push('/checklists');
        } else {
            tokenIsValid.value = false;
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
});

async function joinChecklist() {
    isJoining.value = true;
    try {
        const { data, error } = await supabase.rpc('join_checklist_from_invite', { p_invite_token: route.params.token });
        
        if (error) {
            toast({
                title: 'Failed to join checklist',
                description: `Error: ${error.message}`,
                variant: "destructive"
            });
            throw new Error(`Error joining checklist: ${error.message}`);
        } else {
            const checklist = data[0];
            router.push(`/checklist/${checklist.joined_checklist_id}`);
        }
    } catch (err) {
        console.error(err);
        toast({
            title: 'Error',
            description: 'Failed to join the checklist. Please try again.',
            variant: 'destructive',
        });
    } finally {
        isJoining.value = false;
    }
}

onIonViewDidLeave(() => {
    inviteDs.checklist = null;
    dataSources.manager?.removeDataObject('checklistInvite');
});
</script>