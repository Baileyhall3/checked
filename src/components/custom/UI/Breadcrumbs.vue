<template>
    <Breadcrumb>
        <BreadcrumbList>
            <template v-for="(item, idx) in props.items" :key="idx">
                <BreadcrumbItem>
                    <!-- If link exists -->
                    <BreadcrumbLink
                        v-if="item.href"
                        :href="item.href"
                        class="inline-flex items-center gap-1.5"
                    >
                        <component
                            v-if="item.icon"
                            :is="item.icon"
                            class="size-4"
                            aria-hidden="true"
                        />
                        <span v-if="!isMobile">
                            {{ item.label }}
                        </span>
                    </BreadcrumbLink>

                    <!-- If it's the current (last) item -->
                    <BreadcrumbPage v-else class="inline-flex items-center gap-1.5">
                        <component
                            v-if="item.icon"
                            :is="item.icon"
                            class="size-4"
                            aria-hidden="true"
                        />
                        {{ item.label }}
                    </BreadcrumbPage>

                    <!-- Optional dropdown -->
                    <DropdownMenu v-if="item.dropdown">
                        <DropdownMenuTrigger class="inline-flex items-center gap-1.5">
                            <ChevronDown class="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <template v-for="subItem in item.dropdown" :key="subItem.href">
                                <RouterLink :to="subItem.href">
                                    <DropdownMenuItem class="cursor-pointer">
                                        {{ subItem.label }}
                                    </DropdownMenuItem>
                                </RouterLink>
                            </template>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>

                <!-- Separator between items -->
                <BreadcrumbSeparator v-if="idx < items.length - 1" />
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>

<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-vue-next";
import type { Component } from "vue";
import { computed } from 'vue';
import { useWindowSize } from "@vueuse/core";

export interface IBreadcrumbItem {
    href: string;
    icon: Component;
    label: string;
    dropdown?: IBreadcrumbItem[]
}

const props = defineProps<{
    items: IBreadcrumbItem[]
}>();

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
</script>