<template>
    <IonPage>
        <IonContent :fullscreen="true">
            <header class="sticky top-0 z-50">
                <div class="backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-sm">
                    <div class="container mx-auto px-6 py-3 flex justify-between items-center">
                        <div class="flex flex-col gap-2 w-full">
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
                        </div>
                    </div>
                </div>
            </header>
            <template v-if="dataSources.user?.currentRecord">
                <div class="min-h-screen bg-gray-100">
                    <div class="container mx-auto px-6 py-2">
                        <div class="flex justify-center gap-2">
                            <div
                                class="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10"
                            >
                                <img v-if="avatarPreviewUrl"
                                    :src="avatarPreviewUrl"
                                    class="h-full w-full object-cover"
                                    width="80"
                                    height="80"
                                    alt="Profile image"
                                />
                                <button
                                    type="button"
                                    class="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                    @click="handleAvatarThumbnailClick"
                                    aria-label="Change profile picture"
                                >
                                    <LucideImagePlus class="size-4" aria-hidden="true" />
                                </button>
                                <input
                                    type="file"
                                    ref="avatarFileInputRef"
                                    @change="handleAvatarFileChange"
                                    class="hidden"
                                    accept="image/*"
                                    aria-label="Upload profile picture"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div
                                        class="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10"
                                    >
                                        <div
                                            class="flex items-center justify-center rounded-full w-full h-full text-white text-lg font-medium cursor-pointer"
                                            :style="{ backgroundColor: dataSources.user?.currentRecord.bg_colour || '#ccc' }"
                                        >
                                            {{ dataSources.user?.currentRecord.username.charAt(0).toUpperCase() }}
                                        </div>
                                    </div>
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
                        <form class="mt-4 gap-4 flex flex-col" novalidate>
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
import { LucideImagePlus } from 'lucide-vue-next';
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

// const current = dataSources.user?.currentRecord;

const isSaving = ref<boolean>(false);
const avatarFileInputRef = useTemplateRef("avatarFileInputRef");
const avatarFile = ref<File | null>(null);
const avatarPreviewUrl = useObjectUrl(avatarFile);

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

const handleAvatarFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    avatarFile.value = target.files?.[0] || null;
};

const handleAvatarThumbnailClick = () => {
    avatarFileInputRef.value?.click();
};

function setNewColour(colour: string) {
    if (dataSources.user?.currentRecord) {
        dataSources.user.currentRecord.bg_colour = colour;
        debugger
    }
}
</script>