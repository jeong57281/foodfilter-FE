<template>
  <GoogleMap/>
</template>

<script>
import GoogleMap from '@/views/map/GoogleMap';
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io';

export default ({
  name: 'MainPage',
  beforeCreate() {
    Vue.use(new VueSocketIO({ 
      connection: '/room'
    }));
  },
  components: {
    'GoogleMap': GoogleMap
  }
})
</script>

<style>
</style>