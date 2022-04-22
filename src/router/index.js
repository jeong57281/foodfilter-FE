import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/views/main/MainPage'
import LoadingPage from '@/views/loading/LoadingPage'
import ErrorPage from '@/views/common/component/ErrorPage'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'LoadingPage',
      component: LoadingPage
    },
    {
      path: '/room/:id',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '*',
      name: 'NotFoundPage',
      component: ErrorPage,
      props: {
        title: '404',
        content: 'Page Not Found'
      }
    }
  ]
})
