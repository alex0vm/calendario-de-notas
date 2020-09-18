import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

import VueTextAreaAutosize from 'vue-textarea-autosize'
Vue.use(VueTextAreaAutosize);

import firebase from 'firebase/app';
import 'firebase/firestore';

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCoitDZJH5uUtyLw0S7GZIpuq9aG4WiBYA",
    authDomain: "calendario-vue-e3371.firebaseapp.com",
    databaseURL: "https://calendario-vue-e3371.firebaseio.com",
    projectId: "calendario-vue-e3371",
    storageBucket: "calendario-vue-e3371.appspot.com",
    messagingSenderId: "419834151121",
    appId: "1:419834151121:web:4f70f90415fc40654c05f0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  export const db = firebase.firestore();


Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
