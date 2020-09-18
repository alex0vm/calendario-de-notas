<template>
  <v-app>
    <Calendario/>
  </v-app>
</template>
<script src="https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js"></script>
<script>

import Calendario from './components/Calendario'; 

export default {
  name: 'App',

  components: {
    Calendario,
  },

  data: () => ({
    //
  }),
};
</script>
