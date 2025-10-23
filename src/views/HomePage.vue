<template>
  <IonPage>
    <UnauthenticatedHeader />
    <IonContent :fullscreen="true">
      <div class="min-h-screen bg-gray-100">
        <div class="container mx-auto px-6 py-8">
          <template v-if="userStore.isAuthenticated">
            <!-- <div class="text-lg font-medium">Hey, {{ userStore.userProfile?.username }}!</div> -->
            <Empty class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="dataSources.myChecklists?.data.length === 0">
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
            
            <template v-else>
              <div class="flex items-center space-x-2 mb-8">
                  <div class="w-full">
                    <SearchBar />
                  </div>
                  <Button @click="createChecklistDialog.show()" class="text-white rounded-xl">
                      Add New
                  </Button>
              </div>
              
              <div class="text-lg font-medium">Your Checklists</div>
              <RoundedContainer class=" flex flex-col">
                  <div v-for="(checklist, index) in dataSources.myChecklists?.data" 
                    :key="checklist.id"
                    class="cursor-pointer border-b hover:bg-gray-200"
                  >
                    <RouterLink :to="`/checklist/${checklist.id}`">
                      <div class="p-2">
                        <span class="text-lg font-medium">{{ checklist.name }}</span>
                        <p class="text-muted-foreground text-sm">{{ DateUtils.toDateTime(checklist.created_at) }}</p>
                      </div>
                    </RouterLink>
                  </div>
              </RoundedContainer>
            </template>
          </template>
          <div class="flex justify-center" v-else>
            <router-link to="/register">
              <Button >Go to Register</Button>
            </router-link>
          </div>
        </div>
      </div>
    </IonContent>

    <CreateChecklist ref="createChecklistDialog" @checklist-created="refreshChecklists" />
  </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { Button } from "@/components/ui/button";
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
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { ref } from 'vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { dataSources } from '@/api/dataObjects';
import DateUtils from '@/utils/DateUtils';
import UnauthenticatedHeader from '@/components/header/Unauthenticated.vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';

const createChecklistDialog = ref();

function refreshChecklists() {
  dataSources.myChecklists?.refresh();
}

onIonViewDidEnter(() => {
  refreshChecklists();
});
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
