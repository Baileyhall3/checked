import { reactive, computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const { width } = useWindowSize();

export const sideBarState = reactive({
    isSidebarOpen: false,
    isMobile: computed(() => width.value < 768)
});