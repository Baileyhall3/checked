<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Blurred>
                <template #center>
                    <div class="text-lg font-semibold text-foreground flex items-center gap-2">
                        <UserDisplayAvatar :user="dataSources.user?.currentRecord" size="sm" />
                        <span>{{ dataSources.user?.currentRecord?.username }}</span>
                    </div>
                </template>
                <template #rightSide>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                class="rounded-full"
                                aria-label="Open settings"
                            >
                                <Ellipsis :size="16" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <ProfileDropdownContent />
                    </DropdownMenu>
                </template>
            </Blurred>
            <template v-if="dataSources.user?.currentRecord">
                <MainContent>
                    <RoundedContainer class="mb-8">
                        <div class="flex rounded-t-xl p-2 justify-between" :style="{ 'background-color' : dataSources.user?.currentRecord.bg_colour || '#ccc' }">
                            <div
                                class="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-xs shadow-black/10 group"
                            >
                                <img
                                    v-if="previewUrl"
                                    :src="previewUrl"
                                    class="h-full w-full object-cover"
                                    alt="Profile image"
                                />
                                <img
                                    v-else-if="dataSources.user?.currentRecord.profile_picture_url"
                                    :src="dataSources.user?.currentRecord.profile_picture_url"
                                    class="h-full w-full object-cover"
                                    alt="Profile image"
                                />

                                <!-- Image Plus button -->
                                <button
                                    type="button"
                                    class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
                                    @click="triggerFileUpload"
                                    aria-label="Change profile picture"
                                >
                                    <LucideImagePlus class="size-6" aria-hidden="true" />
                                </button>

                                <input
                                    ref="fileInputRef"
                                    type="file"
                                    class="hidden"
                                    accept="image/*"
                                    @change="handleFileChange"
                                />
                            </div>

                            <div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            class="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                            aria-label="Change background colour"
                                        >
                                            <Palette class="size-4" aria-hidden="true" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <ColoursDropdown :current-colour="dataSources.user?.currentRecord.bg_colour" @colour-selected="setNewColour" />
                                </DropdownMenu>
                            </div>
                        </div>
                        <form class="mt-2 gap-4 flex flex-col p-2" novalidate>
                            <div class="*:not-first:mt-2">
                                <Label for="profileUsername">
                                    Username
                                </Label>
                                <Input 
                                    id="username" 
                                    type="text" 
                                    required 
                                    v-model="dataSources.user.currentRecord.username" 
                                    class="border-gray-300 focus:ring-blue-500"
                                />
                            </div>
                            <div class="*:not-first:mt-2">
                                <Label for="profileEmail">
                                    Email
                                </Label>
                                <Input 
                                    id="profileEmail" 
                                    type="email" 
                                    disabled
                                    required 
                                    v-model="dataSources.user.currentRecord.email" 
                                    class="border-gray-300 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div class="w-full justify-end flex gap-2">
                                <Button type="button" variant="secondary" :disabled="!dataSources.user?.hasChanges" class="border" @click="dataSources.user?.cancelChanges()">
                                    Cancel
                                </Button>
                                <Button :disabled="!dataSources.user?.hasChanges" type="button" @click="dataSources.user?.saveChanges()">
                                    <Spinner v-if="isSaving" />
                                    Save
                                </Button>
                            </div>
                        </form>
                    </RoundedContainer>
                    <RoundedContainer class="p-4 mt-6">
                        <div class="text-lg font-semibold mb-3">Start page</div>
                        <div class="space-y-3">
                            <!-- Last opened -->
                            <label class="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="startPage"
                                    value="last_opened"
                                    :checked="dataSources.user.currentRecord.default_view_type === 'last_opened'"
                                    @change="setStartPageLastOpened"
                                />
                                <div>
                                    <div class="font-medium">Last opened</div>
                                    <div class="text-sm text-muted-foreground">
                                        Open where you left off
                                    </div>
                                </div>
                            </label>

                            <!-- Specific item -->
                            <label class="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="startPage"
                                    value="specific"
                                    :checked="isSpecificDefault"
                                    @change="setStartPageSpecific"
                                />
                                <div class="flex-1">
                                    <div class="font-medium flex items-center gap-2">
                                    <Star class="size-4 text-yellow-400" />
                                        Specific item
                                    </div>

                                    <div class="text-sm text-muted-foreground">
                                        <template v-if="defaultItemLabel">
                                            {{ defaultItemLabel }}
                                        </template>
                                        <template v-else>
                                            No item selected
                                        </template>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </RoundedContainer>
                    <!-- <RoundedContainer class="p-2">
                        <div class="text-lg font-medium">Actions</div>
                    </RoundedContainer> -->
                </MainContent>
            </template>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonPage, onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideImagePlus, Home, Palette, Star, Ellipsis } from 'lucide-vue-next';
import { ref, computed } from 'vue';
import { Spinner } from "@/components/ui/spinner";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Blurred from '@/components/header/Blurred.vue';
import ProfileDropdown from '@/components/custom/ProfileDropdown.vue';
import { userStore } from '@/store/userStore';
import { useToast } from "@/components/ui/toast/use-toast";
import ColoursDropdown from '@/components/custom/UI/ColoursDropdown.vue';
import { useThemes } from '@/composables/useThemes';
import UserDisplayAvatar from '@/components/custom/UI/UserDisplayAvatar.vue';
import ProfileDropdownContent from '@/components/custom/UI/ProfileDropdownContent.vue';
import MainContent from '@/components/custom/UI/MainContent.vue';

const isSaving = ref<boolean>(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const hasRemovedProfilePicture = ref<boolean>(false);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
            
const user = computed(() => dataSources.user?.currentRecord);

const { toast } = useToast(); 

const { resolveTheme, themeToCssVars } = useThemes()

const resolvedTheme = computed(() =>
    resolveTheme(null)
)

const themeStyle = computed(() =>
    themeToCssVars(resolvedTheme.value)
)

const handleFileChange = async (event: Event) => {
    hasRemovedProfilePicture.value = false;
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
    const files = (event.target as HTMLInputElement).files;
    // hasChanges.value = true;
    if (files && files.length > 0) {
        selectedFile.value = files[0];
        if (selectedFile.value) {
            previewUrl.value = URL.createObjectURL(selectedFile.value);
            const { data, error } = await userStore.uploadDisplayPicture(selectedFile.value);
            if (error) {
                toast({
                    title: 'Could not upload display picture. An error occurred.',
                    description: `Error: ${error}`,
                    variant: "destructive"
                });
            }
        } else {
            previewUrl.value = null;
        }
    }
};

const triggerFileUpload = () => {
    fileInputRef.value?.click();
};

function setNewColour(colour: string) {
    if (dataSources.user?.currentRecord) {
        dataSources.user.currentRecord.bg_colour = colour;
    }
}

const isSpecificDefault = computed(() =>
    user.value?.default_view_type === 'checklist' ||
    user.value?.default_view_type === 'folder'
);

const defaultItemLabel = computed(() => {
    if (!user.value) return null;

    if (user.value.default_view_type === 'checklist') {
        return `Checklist: ${user.value.default_view_id}`;
        // later you can resolve the actual name
    }

    if (user.value.default_view_type === 'folder') {
        return `Folder: ${user.value.default_view_id}`;
    }

    return null;
});

function setStartPageLastOpened() {
  if (!user.value) return;

  user.value.default_view_type = 'last_opened';
  user.value.default_view_id = null;
}

function setStartPageSpecific() {
  if (!user.value) return;

  // If they already have a starred item, do nothing
  if (isSpecificDefault.value) return;

  toast({
    title: 'Choose a default item',
    description: 'Use the star on a checklist or folder to set it as your start page.'
  });

  // Revert radio visually if needed
  user.value.default_view_type = 'last_opened';
}
</script>

<style scoped>
.checklist-root {
    background-color: var(--bg-main);
}
</style>