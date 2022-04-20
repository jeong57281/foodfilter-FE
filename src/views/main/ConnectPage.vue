<template>
  <MainPage/>
</template>

<script>
import MainPage from '@/views/main/MainPage';
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io';

export default ({
  name: 'ConnectPage',
  beforeCreate() {
    Vue.use(new VueSocketIO({ 
      debug: true,
      connection: '/room'
    }));
  },
  components: {
    'MainPage': MainPage
  }
})
</script>

<style>
</style>