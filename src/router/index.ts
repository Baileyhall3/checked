import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import Checklist from '@/views/Checklist.vue';
import Folder from '@/views/Folder.vue';
import UserProfile from '@/views/UserProfile.vue';

import { userStore } from '@/store/userStore';
import { hasAuthState } from '@/utils/authPersistence';

// Auth views
import Register from '@/views/auth/Register.vue';
import Login from '@/views/auth/Login.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    component: HomePage 
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
        title: 'Register',
        requiresAuth: false
      }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
        title: 'Login',
        requiresAuth: false
      }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: {
        title: 'Profile',
        // requiresAuth: true
      }
  },
  {
    path: '/checklist/:id',
    name: 'Checklist',
    component: Checklist,
    meta: {
      title: 'Checklist',
      // requiresAuth: true
    }
  },
  {
    path: '/folder/:id',
    name: 'Folder',
    component: Folder,
    meta: {
      title: 'Folder',
      // requiresAuth: true
    }
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

let startRouteResolved = false;

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Checked';

  console.log('to:', to.path);
  console.log('userstore ', userStore);

  await userStore.ready();

  if (
    to.path === '/' &&
    !startRouteResolved &&
    userStore.userProfile
  ) {
    startRouteResolved = true;

    const profile = userStore.userProfile;

    if (profile.default_view_type === 'checklist' && profile.default_view_id) {
      return next(`/checklist/${profile.default_view_id}`);
    }

    if (profile.default_view_type === 'folder' && profile.default_view_id) {
      return next(`/folder/${profile.default_view_id}`);
    }

    if (profile.default_view_type === 'last_opened') {
      if (profile.last_opened_type === 'checklist' && profile.last_opened_id) {
        return next(`/checklist/${profile.last_opened_id}`);
      }

      if (profile.last_opened_type === 'folder' && profile.last_opened_id) {
        return next(`/folder/${profile.last_opened_id}`);
      }
    }

    return next('/home');
  }

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth);
  const isAuthenticated = userStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    return next('/home');
  }

  next();
});


// Handle page reloads and direct URL access
// This ensures the auth state is properly restored from localStorage/cookies
router.beforeResolve((to, from, next) => {
  // If this is an initial page load (from is an empty route)
  if (from.name === null && to.name !== null) {
    // Check if we have a session in localStorage
    const hasSession = hasAuthState()
    
    // If we have a session but the user is not loaded yet, wait for auth to initialize
    if (hasSession && !userStore.user) {
      console.log('Waiting for auth to initialize...')
      
      // Poll for auth initialization
      const checkAuth = () => {
        if (userStore.user) {
          // Auth is initialized and user is loaded
          console.log('Auth initialized, proceeding with navigation')
          next()
        } else {
          // Check again in a short while
          setTimeout(checkAuth, 50)
        }
      }
      
      checkAuth()
    } else {
      // Either no session or user is already loaded, proceed normally
      next()
    }
  } else {
    // Not an initial page load, proceed normally
    next()
  }
});

export default router