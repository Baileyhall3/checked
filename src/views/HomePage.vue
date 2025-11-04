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
                  <!-- <Button @click="createChecklistDialog.show()" class="text-white rounded-xl">
                      Add New
                  </Button> -->
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        Add New
                        <ChevronDown
                          :size="16"
                          class="-me-1 opacity-60 rounded-xl"
                          aria-hidden="true"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem @click="createChecklistDialog.show()" class="cursor-pointer"> 
                        <ListTodo :size="16" class="opacity-60" aria-hidden="true" />
                        Checklist
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="createFolderDialog.show()" class="cursor-pointer">
                        <Folder :size="16" class="opacity-60" aria-hidden="true" />
                        Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div class="mb-8" v-if="dataSources.myFolders && dataSources.myFolders.data.length > 0">
                <div class="text-lg font-medium">Your Folders</div>
                <RoundedContainer class=" flex flex-col">
                    <div v-for="(folder, index) in dataSources.myFolders?.data" 
                      :key="folder.id"
                      class="cursor-pointer border-b hover:bg-gray-200"
                    >
                      <RouterLink :to="`/folder/${folder.id}`">
                        <div class="p-2">
                          <span class="text-lg font-medium">{{ folder.name }}</span>
                          <p class="text-muted-foreground text-sm">{{ DateUtils.toDateTime(folder.created_at) }}</p>
                        </div>
                      </RouterLink>
                    </div>
                </RoundedContainer>
              </div>

              <div>
                <div class="text-lg font-medium">Your Checklists</div>
                <RoundedContainer class="flex flex-col">
                    <div v-for="(checklist, index) in dataSources.myChecklists?.data" 
                      :key="checklist.id"
                      class="cursor-pointer border-b hover:bg-gray-200"
                    >
                      <RouterLink :to="`/checklist/${checklist.id}`">
                        <div class="p-2">
                          <div class="flex items-center">
                            <template v-if="checklist.folder_name">
                              <Folder class="size-4 me-1" aria-hidden="true" />
                              {{ checklist.folder_name }}
                              <ChevronRight class="size-3.5 mx-1" />
                            </template>
                            {{ checklist.name }}
                          </div>
                          <p class="text-muted-foreground text-sm">
                            {{ DateUtils.toDateTime(checklist.items_updated_at ?? checklist.created_at) }}
                          </p>
                        </div>
                      </RouterLink>
                    </div>
                </RoundedContainer>
              </div>
              
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
    <CreateFolder ref="createFolderDialog" @folder-created="refreshFolders" />
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListTodo, ChevronDown, Folder, ChevronRight } from 'lucide-vue-next';
import { userStore } from '@/store/userStore';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { ref } from 'vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { dataSources } from '@/api/dataObjects';
import DateUtils from '@/utils/DateUtils';
import UnauthenticatedHeader from '@/components/header/Unauthenticated.vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import CreateFolder from '@/components/dialogs/CreateFolder.vue';

const createChecklistDialog = ref();
const createFolderDialog = ref();

function refreshChecklists() {
  dataSources.myChecklists?.refresh();
}

function refreshFolders() {
  dataSources.myFolders?.refresh();
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
