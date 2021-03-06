import Vue from 'vue'
import App from './App'
import router from './router'

window.eventBus = new Vue();

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
})
