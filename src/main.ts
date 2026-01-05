import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import {  IonicVue } from '@ionic/vue';

import '@ionic/vue/css/core.css';       // required for ion-page/ion-content layout
import '@ionic/vue/css/structure.css';  // required for inner-scroll sizing
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/typography.css';
import './index.css';
import './theme/variables.css';

import { supabase } from './api/supabase';
import { userStore } from './store/userStore';
import { hasAuthState } from './utils/authPersistence';
import { resolveStartRoute } from './utils/resolveStartRoute';

const app = createApp(App)
  .use(IonicVue)
  .use(router)

let authInitialized = false
app.config.globalProperties.$authInitialized = () => authInitialized

async function initializeAuth() {
  try {
    // optional: check if user had stored session
    const hasStoredAuth = hasAuthState()
    console.log('Has stored auth state:', hasStoredAuth)

    // get initial Supabase session
    const { data } = await supabase.auth.getSession()

    // subscribe to changes
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event)
      userStore.updateAuthState(session)
    })

    // initialize user store (loads persisted state)
    await userStore.init()

    console.log('✅ Auth initialized')
    authInitialized = true
  } catch (err) {
    console.error('❌ Failed to initialize authentication:', err)
    authInitialized = true // prevent app hang
  }
}

/* -------------------------------------------------- */
/* START APP */
/* -------------------------------------------------- */

async function startApp() {
  await initializeAuth();
  await router.isReady();

  resolveStartRoute();
  app.mount('#app');
}

startApp();