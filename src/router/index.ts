import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import Checklist from '@/views/Checklist.vue';

import { userStore } from '@/store/userStore';
import { hasAuthState } from '@/utils/authPersistence';

// Auth views
import Register from '@/views/auth/Register.vue';
import Login from '@/views/auth/Login.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
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
    path: '/checklist/:id',
    name: 'Checklist',
    component: Checklist,
    meta: {
      title: 'Checklist',
      // requiresAuth: true
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Global navigation guard for authentication and SEO
router.beforeEach(async (to, from, next) => {
  // Update page title for SEO
  document.title = to.meta.title || 'Checked'
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = userStore.isAuthenticated
  
  // Handle authentication requirements
  if (requiresAuth && !isAuthenticated) {
    // If the user is not authenticated and the route requires auth, redirect to login
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // If the user is authenticated and tries to access login/register pages, redirect to home
    next('/')
  } else {
    // Otherwise proceed as normal
    next()
  }
})

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