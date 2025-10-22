<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="min-h-screen bg-gray-100">
        <div class="container mx-auto px-6 py-8">
          <template v-if="userStore.isAuthenticated">
            <div class="text-lg font-medium">Hey, {{ userStore.userProfile?.username }}!</div>
            <Empty class="bg-white shadow-lg rounded-xl p-6 mb-8" >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListTodo />
                </EmptyMedia>
                <EmptyTitle>No Checklists Yet</EmptyTitle>
                <EmptyDescription>
                  You haven't created any checklists yet. Get started by creating your first
                  checklist!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div class="flex gap-2">
                  <Button @click="createChecklistDialog.show()">
                    Create Checklist
                  </Button>
                </div>
                <EmptyDescription>
                  Need help? <a href="#">View tutorial</a>
                </EmptyDescription>
              </EmptyContent>
            </Empty>
            
            <div class="text-lg font-medium">Your Checklists</div>
            <RoundedContainer class=" flex flex-col">
                <div v-for="(checklist, index) in dataSources.myChecklists?.data" 
                  :key="checklist.id"
                  class="cursor-pointer border-b hover:bg-gray-200"
                >
                  <div class="p-2">
                    <span class="text-lg font-medium">{{ checklist.name }}</span>
                    <p class="text-muted-foreground text-sm">{{ DateUtils.toDateTime(checklist.created_at) }}</p>
                  </div>
                </div>
            </RoundedContainer>

          </template>
          <div class="flex justify-center" v-else>
            <router-link to="/register">
              <Button >Go to Register</Button>
            </router-link>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
  
  <CreateChecklist ref="createChecklistDialog" @checklist-created="refreshChecklists" />
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ListTodo } from 'lucide-vue-next';
import { userStore } from '@/store/userStore';
import { getDataObjectById } from 'supabase-dataobject-core';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { ref } from 'vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { dataSources } from '@/api/dataObjects';
import DateUtils from '@/utils/DateUtils';

// const checklistsDs = getDataObjectById('my_checklists');

const createChecklistDialog = ref();

function refreshChecklists() {
  console.log('did refresh')
  dataSources.myChecklists?.refresh();
}
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
