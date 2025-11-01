<template>
    <template v-if="userStore.isAuthenticated && dataSources.user?.currentRecord">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div v-if="dataSources.user?.currentRecord.profile_picture_url" 
                    class=" w-7 h-7 flex items-center justify-center rounded-full overflow-hidden cursor-pointer">
                    <img :src="dataSources.user?.currentRecord.profile_picture_url" alt="Profile Image" class="object-cover w-full h-full" />
                </div>
                <div v-else 
                    class="flex items-center justify-center rounded-full w-7 h-7 text-white text-sm font-medium cursor-pointer"
                    :style="{ backgroundColor: dataSources.user?.currentRecord.bg_colour || '#ccc' }"
                >
                    {{ dataSources.user?.currentRecord.username.charAt(0).toUpperCase() }}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <RouterLink to="/profile">
                        <DropdownMenuItem class="cursor-pointer">
                            <CircleUserRound class="size-4" aria-hidden="true" />
                            Profile
                        </DropdownMenuItem>
                    </RouterLink>
                    <DropdownMenuItem class="cursor-pointer">
                        <Settings2 class="size-4" aria-hidden="true" />
                        Preferences
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem class="cursor-pointer">
                        <Users class="size-4" aria-hidden="true" />
                        Friends
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer" @click="userStore.signOut();">
                    <LogOut class="size-4" aria-hidden="true" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </template>
    <template v-else>
        <RouterLink to="/login">
            <Button size="sm">
                Login
            </Button>
        </RouterLink>
    </template>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator ,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { userStore } from "@/store/userStore";
import { CircleUserRound, Settings2, Users, LogOut } from "lucide-vue-next";
import { dataSources } from "@/api/dataObjects";
</script>