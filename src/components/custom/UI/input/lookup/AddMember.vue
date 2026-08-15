<template>
    <Popover v-model:open="openPopover">
        <PopoverTrigger as-child>
            <slot name="trigger" :openPopover="openPopover" />
            <Button 
                v-if="!$slots.trigger"
                variant="secondary" 
                class="w-full"
                role="combobox"
                :aria-expanded="openPopover"
            >
                Add Member
            </Button>
        </PopoverTrigger>
        <PopoverContent class="border-input w-full min-w-[var(--reka-popper-anchor-width)] p-0" align="start">
            <Command>
                <div class="flex items-center border-b px-3" cmdk-input-wrapper>
                    <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search users..."
                        auto-focus
                        class="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <CommandList>
                    <Loading v-if="isRunningSearch" />
                    <template v-else>
                        <div v-if="props.membersData.length === 0" class="p-4 items-center flex justify-center">
                            <span class="text-sm">No users found.</span>
                        </div>

                        <CommandGroup v-else>
                            <CommandItem
                                v-for="user in props.membersData"
                                :key="user.id"
                                :value="user.username"
                                class="hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                @select="handleSelect(user)"
                            >
                                <div class="flex items-center gap-4 w-full">
                                    <UserDisplayAvatar :user="user" size="sm" />
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium truncate">{{ user.username }}</p>                        
                                    </div>
                                </div>
                            </CommandItem>
                        </CommandGroup>
                    </template>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import Loading from "../../Loading.vue";
import { Search } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import UserCard from "../../UserCard.vue";
import { Button } from "@/components/ui/button";

import UserDisplayAvatar from "../../UserDisplayAvatar.vue";
import { DataObjectRecord } from "supabase-dataobject-core";

const props = defineProps<{
    membersData: DataObjectRecord<any>[];
}>();

const emit = defineEmits<{
    (e: 'search-users', query: string | null): void;
    (e: 'select-user', user: DataObjectRecord<any>): void;
}>()

const openPopover = ref<boolean>(false);
const searchQuery = ref<string>('');
const isRunningSearch = ref<boolean>(false);

watch(searchQuery, (newVal) => {
    handleUserSearch(newVal);
});

let timeout
function handleUserSearch(query: string | null) {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
        emit('search-users', query);
    }, 300)
}

function handleSelect(user: DataObjectRecord<any>) {
    emit('select-user', user);
    openPopover.value = false;
    searchQuery.value = '';
}
</script>