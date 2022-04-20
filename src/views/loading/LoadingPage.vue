<template>
  <div v-if='!error' class="loading">
    <div>
      <p class="title">Loading...</p>
      <p class="content">잠시만 기다려 주세요</p>
    </div>
  </div>
  <ErrorPage v-else v-bind:content='content'/>
</template>

<script>
import axios from 'axios';
import ErrorPage from '@/views/common/component/ErrorPage';

export default ({
  name: 'LoadingPage',
  mounted() {
    const newRoom = Math.random().toString(16).substr(2, 8);
    axios.get('/api/maps', {
      params: { roomId: newRoom }
    })
    .then(() => {
      location.replace(`/room/${newRoom}`);
    })
    .catch(() => {
      this.content = '오류가 발생했습니다.';
      this.error = true;
    })
  },
  data() {
    return {
      error: false,
      content: ''
    }
  },
  components: {
    'ErrorPage': ErrorPage
  }
})
</script>

<style>
  .loading {
    background-image: linear-gradient(230deg, rgb(113, 197, 152), rgb(254, 191, 16), rgb(254, 191, 16), rgb(239, 72, 35));
    width: 100%;
    height: 100%; 
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading > div {
    text-align: center;
  }

  .home {
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 3px 10px;
    margin-top: 30px;
    font-size: 12px;
  }

  .title {
    color: white;
    font-size: 50px;
    font-weight: bold;
  }

  .content {
    color: white;
    font-size: 16px;
    font-weight: bold;
  }

  @media all and (max-width: 768px){
    .title {
      font-size: 36px;
    }

    .content {
      font-size: 14px;
    }

    .home{
      margin-top: 20px;
      font-size: 10px;
    }
  }
</style>