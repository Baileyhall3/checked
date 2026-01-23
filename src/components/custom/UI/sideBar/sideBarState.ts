import { reactive, computed, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import type { Router } from 'vue-router';

const { width } = useWindowSize();

export const sideBarState = reactive({
    isSidebarOpen: false,
    isMobile: computed(() => width.value < 768),
    foldersExpanded: true,
    toggleFoldersExpanded: () => {
        sideBarState.foldersExpanded = !sideBarState.foldersExpanded
    },
    hoveredItemKey: null,
    onTreeItemClick: (itemType) => {
        if (sideBarState.isMobile) {
            sideBarState.isSidebarOpen = false;
        }
    },
    installRouterWatcher(router: Router) {
        watch(
            () => router.currentRoute.value.fullPath,
            () => {
                if (this.isMobile) {
                this.isSidebarOpen = false
                }
            }
        )
    }
});