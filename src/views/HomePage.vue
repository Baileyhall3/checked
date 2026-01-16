<template>
  <IonPage>
    <div v-if="!userStore.isAuthenticated" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8 text-center">
      <!-- Logo / App Name -->
      <div class="mb-10">
        <div class="text-5xl font-extrabold text-indigo-600 tracking-tight mb-2">
          Checked
        </div>
        <p class="text-gray-600 text-lg max-w-md mx-auto">
          Organize your life effortlessly using smart checklists and folders.
        </p>
      </div>
      
      <!-- Illustration -->
      <div class="w-full max-w-md mb-10">
        <img
          src="/public/assets/images/check-icon-no-bg.png"
          alt="Checklist Illustration"
          class="w-64 h-64 mx-auto drop-shadow-xl opacity-90"
        />
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col gap-4 w-full max-w-sm">
        <router-link to="/register">
          <button
            class="w-full py-3 bg-indigo-600 text-white rounded-2xl text-lg font-semibold shadow-lg hover:bg-indigo-700 transition"
          >
            Create an Account
          </button>
        </router-link>


        <router-link to="/login">
          <button
            class="w-full py-3 bg-white text-indigo-700 border border-indigo-300 rounded-2xl text-lg font-semibold shadow hover:bg-gray-50 transition"
          >
            Log In
          </button>
        </router-link>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-sm text-gray-500">
        Stay organized. Stay in control.
      </div>
    </div>
    <template v-else>
      <IonContent :fullscreen="true">
        <Blurred>
          <template #center>
              <span class="text-lg font-semibold text-foreground flex items-center">
                  <img src="/public/assets/images/check-icon-no-bg.png"
                      alt="Checked Logo"
                      class="h-6 w-6 mr-1" 
                  />
                  Checked-it
              </span>
          </template>
        </Blurred>
        <MainContent>
          <!-- <div class="text-lg font-medium">Hey, {{ userStore.userProfile?.username }}!</div> -->
          <Empty class="bg-white shadow-lg rounded-xl p-6 mb-8" v-if="dataSources.myChecklists?.data.length === 0 && dataSources.myFolders?.data.length === 0">
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
            <div class="flex items-center space-x-2 mb-4">
                <div class="w-full">
                  <SearchBar @search-entered="handleSearchQuery" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AddNewBtn add-terminology="Add...">
                      <ChevronDown
                        :size="16"
                        class="-me-1 opacity-60 rounded-xl"
                        aria-hidden="true"
                      />
                    </AddNewBtn>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem @click="createChecklistDialog.show()" class="cursor-pointer"> 
                      <ListTodo :size="16" class="opacity-60" aria-hidden="true" />
                      Checklist
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="createFolderDialog.show()" class="cursor-pointer">
                      <FolderIcon :size="16" class="opacity-60" aria-hidden="true" />
                      Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div class="mb-4" v-if="dataSources.myFolders && dataSources.myFolders.data.length > 0">
              <div class="text-xl font-medium flex items-center">
                <FolderIcon class="me-2" aria-hidden="true" />
                Folders
              </div>
              <RoundedContainer class="flex flex-col">
                  <template v-for="(folder, index) in dataSources.myFolders?.data" :key="folder.id">
                      <Folder 
                        :folder="folder" 
                        :folder-data="dataSources.myFolders" 
                      />
                  </template>
              </RoundedContainer>
            </div>

            <!-- <div class="mb-8" v-if="dataSources.myChecklists?.data.length">
              <div class="text-xl font-medium flex items-center">
                <ListTodo class="me-2" aria-hidden="true" />
                Checklists
              </div>
                <RoundedContainer class=" flex flex-col">
                    <template v-for="(checklist, index) in dataSources.myChecklists?.data" :key="checklist.id">
                        <Checklist 
                          :checklist="checklist" 
                          :checklist-data="dataSources.myChecklists" 
                        />
                    </template>
                </RoundedContainer>
            </div> -->

            <div v-if="dataSources.deletedChecklists?.data && dataSources.deletedChecklists?.data.length > 0">
              <RouterLink to="/deleted-items" class="cursor-pointer hover:underline text-xl font-medium flex items-center">
                <Trash class="me-2 text-red-600" aria-hidden="true" />
                Deleted Checklists ({{ dataSources.deletedChecklists?.data.length }})
              </RouterLink>
              <RoundedContainer class=" flex flex-col">
                  <template v-for="(checklist, index) in dataSources.deletedChecklists?.data.slice(0, 5)" :key="checklist.id">
                      <Checklist 
                        :checklist="checklist" 
                        :checklist-data="dataSources.deletedChecklists" 
                        hideDeletedIcon
                        hideItemsCount
                      />
                  </template>
                  <div class="text-center py-4" v-if="dataSources.deletedChecklists.data.length > 5">
                    <RouterLink to="/deleted-items" class="text-sm text-indigo-600 hover:underline">
                      View All Deleted Items
                    </RouterLink>
                  </div>
              </RoundedContainer>
            </div>
          </template>
        </MainContent>
      </IonContent>
    </template>

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
import { ListTodo, ChevronDown, Folder as FolderIcon, Trash } from 'lucide-vue-next';
import { userStore } from '@/store/userStore';
import CreateChecklist from '@/components/dialogs/CreateChecklist.vue';
import { ref } from 'vue';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { dataSources } from '@/api/dataObjects';
import UnauthenticatedHeader from '@/components/header/Unauthenticated.vue';
import { onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import SearchBar from '@/components/custom/UI/SearchBar.vue';
import CreateFolder from '@/components/dialogs/CreateFolder.vue';
import Checklist from '@/components/custom/UI/Checklist.vue';
import Folder from '@/components/custom/UI/Folder.vue';
import AddNewBtn from '@/components/custom/UI/buttons/AddNewBtn.vue';
import MainContent from '@/components/custom/UI/MainContent.vue';
import Blurred from '@/components/header/Blurred.vue';

const createChecklistDialog = ref();
const createFolderDialog = ref();
const searchQuery = ref<string>('');

function refreshChecklists() {
  dataSources.myChecklists?.refresh();
  dataSources.deletedChecklists?.refresh();
}

function refreshFolders() {
  dataSources.myFolders?.refresh();
}

onIonViewDidEnter(() => {
  refreshChecklists();
});

function handleSearchQuery(query: string) {
  searchQuery.value = query;
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
