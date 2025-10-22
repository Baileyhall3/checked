import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import {  IonicVue } from '@ionic/vue';

import '@ionic/vue/css/core.css';       // required for ion-page/ion-content layout
import '@ionic/vue/css/structure.css';  // required for inner-scroll sizing
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/typography.css';
import './index.css'; // your Tailwind

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router)

router.isReady().then(() => {
  app.mount('#app');
});
