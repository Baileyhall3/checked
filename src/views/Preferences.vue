<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Blurred>
                <template #center>
                    <div class="text-lg font-semibold text-foreground flex items-center gap-2">
                        <span>Preferences</span>
                    </div>
                </template>
            </Blurred>
            <MainContent>
                <RoundedContainer class="p-4 mt-6">
                    <div class="mb-4">
                        <div class="text-lg font-semibold">Notification Preferences</div>
                        <p class="text-sm text-muted-foreground">Set your <span class="font-semibold">global</span> notification preferences below.</p>
                        <p class="text-sm text-muted-foreground">These preference will apply to all checklists.</p>
                    </div>
                    <div class="gap-4 grid" v-if="dataSources.globalNotificationPreferences.data">
                        <div 
                            v-for="(pref, index) in dataSources.globalNotificationPreferences.data" 
                            :key="pref.id"
                            class="flex flex-col"
                            :class="{ 'border-b pb-4' : index !== (dataSources.globalNotificationPreferences.data.length - 1)}"
                        >
                            <div class="mb-2">
                                <div class="font-semibold">{{ formatNotifType(pref.type) }}</div>
                                <div class="text-sm text-muted-foreground">
                                    {{ pref.description }}
                                </div>
                            </div>
                            
                            <div class="flex gap-x-4">
                                <div class="flex items-center gap-2" v-if="pref.supports_email">
                                    <Switch v-model="pref.allow_email" @update:model-value="newVal => handleUpdate(pref, newVal, true)" />
                                    <span class="text-sm">Allow Email</span>
                                </div>
                                <div class="flex items-center gap-2" v-if="pref.supports_push">
                                    <Switch v-model="pref.allow_push" @update:model-value="newVal => handleUpdate(pref, newVal)" />
                                    <span class="text-sm">Allow Push</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </RoundedContainer>
            </MainContent>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonPage} from '@ionic/vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import Blurred from '@/components/header/Blurred.vue';
import { useToast } from "@/components/ui/toast/use-toast";
import { Switch } from "@/components/ui/switch";
import MainContent from '@/components/custom/UI/MainContent.vue';
import { formatNotifType } from '@/utils/shared';
import type { DataObjectRecord } from 'supabase-dataobject-core';
            
const { toast } = useToast(); 

async function handleUpdate(pref: DataObjectRecord, newVal: boolean, isEmail = false) {
    try {
        await pref.save();
        toast({
            title: `Preference Updated.`,
            description: `You will ${newVal == true ? 'now' : 'no longer'} receive ${isEmail ? 'email' : 'notification'}s of this type.`
        });
    } catch(err) {
        console.error(err);
    }
}
</script>

<style scoped>
.checklist-root {
    background-color: var(--bg-main);
}
</style>