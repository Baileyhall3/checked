<template>
    <DropdownMenuContent class="w-56">
        <!-- <DropdownMenuLabel class="flex items-center gap-2">
            <UserDisplayAvatar :user="dataSources.user?.currentRecord" size="sm" />
            {{ dataSources.user?.currentRecord?.username }}
        </DropdownMenuLabel>
        <DropdownMenuSeparator /> -->
        <DropdownMenuGroup>
            <RouterLink to="/profile">
                <DropdownMenuItem class="cursor-pointer font-semibold">
                    <UserDisplayAvatar :user="dataSources.user?.currentRecord" size="sm" />
                    {{ dataSources.user?.currentRecord?.username }}
                </DropdownMenuItem>
            </RouterLink>
            <DropdownMenuSeparator />
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
        <DropdownMenuItem class="cursor-pointer" @click="logOut">
            <LogOut class="size-4" aria-hidden="true" />
            Log out
        </DropdownMenuItem>
    </DropdownMenuContent>
</template>

<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator ,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { userStore } from "@/store/userStore";
import { CircleUserRound, Settings2, Users, LogOut } from "lucide-vue-next";
import { dataSources } from "@/api/dataObjects";
import { useRouter } from "vue-router";
import UserDisplayAvatar from "./UserDisplayAvatar.vue";

const router = useRouter();

function logOut() {
    userStore.signOut();
    router.push(`/`);
}
</script>