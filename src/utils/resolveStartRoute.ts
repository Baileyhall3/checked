import router from '@/router';
import { userStore } from '@/store/userStore';

let startRouteResolved = false;

export function resolveStartRoute() {
    if (router.currentRoute.value.path !== '/') return;

    if (startRouteResolved) return;
    if (!userStore.isLoaded) return;
    if (!userStore.userProfile) return;

    startRouteResolved = true;

    const profile = userStore.userProfile;

    // 1️⃣ Explicit default
    if (profile.default_view_type === 'checklist' && profile.default_view_id) {
        router.replace(`/checklist/${profile.default_view_id}`);
        return;
    }

    if (profile.default_view_type === 'folder' && profile.default_view_id) {
        router.replace(`/folder/${profile.default_view_id}`);
        return;
    }

    // 2️⃣ Last opened
    if (profile.default_view_type === 'last_opened') {
        if (profile.last_opened_type === 'checklist' && profile.last_opened_id) {
            router.replace(`/checklist/${profile.last_opened_id}`);
            return; 
        }

        if (profile.last_opened_type === 'folder' && profile.last_opened_id) {
            router.replace(`/folder/${profile.last_opened_id}`);
            return;
        }
    }

    // 3️⃣ Fallback
    router.replace('/');
}
