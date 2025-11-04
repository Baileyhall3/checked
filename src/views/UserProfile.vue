<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <Blurred>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/home" class="inline-flex items-center gap-1.5">
                                <Home class="size-4" aria-hidden="true" />
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Profile</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <template #rightSide>
                    <ProfileDropdown />
                </template>
            </Blurred>
            <template v-if="dataSources.user?.currentRecord">
                <div class="min-h-screen bg-gray-100">
                    <div class="container mx-auto px-6 py-8">
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
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Select Colour</DropdownMenuLabel>
                                            <div class="flex flex-wrap justify-center gap-4 border-t pt-6 w-full p-4">
                                                <div v-for="colour in selectableColours"
                                                    :key="colour"
                                                    class="flex items-center justify-center rounded-full text-white text-lg font-semibold cursor-pointer transition duration-200"
                                                    @click="setNewColour(colour)"
                                                    :style="{
                                                        width: '1rem',
                                                        height: '1rem',
                                                        backgroundColor: colour,
                                                        border: colour === dataSources.user?.currentRecord.bg_colour ? '2px solid black' : 'none'
                                                    }"
                                                >
                                                </div>
                                            </div>
                                        </DropdownMenuContent>
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
                                <div class="w-full justify-end flex">
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
                        <!-- <RoundedContainer class="p-2">
                            <div class="text-lg font-medium">Actions</div>
                        </RoundedContainer> -->
                    </div>
                </div>
            </template>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { createDataObject, DataObject } from 'supabase-dataobject-core';
import { IonContent, IonPage, onIonViewDidEnter, onIonViewDidLeave } from '@ionic/vue';
import { dataSources } from '@/api/dataObjects';
import RoundedContainer from '@/components/RoundedContainer.vue';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideImagePlus, Home, Palette } from 'lucide-vue-next';
import { useTemplateRef, ref } from 'vue';
import { useObjectUrl } from '@vueuse/core';
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator ,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
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

// const current = dataSources.user?.currentRecord;

const isSaving = ref<boolean>(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const hasRemovedProfilePicture = ref<boolean>(false);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const { toast } = useToast(); 

const selectableColours = [
    '#FF6B6B', // red
    '#6BCB77', // green
    '#4D96FF', // blue
    '#FFD93D', // yellow
    '#FF6EC7', // pink
    '#9D4EDD', // purple
    '#00C49A', // teal
    '#FFA07A', // light salmon
    '#20B2AA', // light sea green
    '#778899'  // light slate gray
]

// onIonViewDidEnter(() => {
//     dataSources.user?.refresh();
// });

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
</script>