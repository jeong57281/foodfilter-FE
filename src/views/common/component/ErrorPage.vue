<template>
  <div class="error">
    <div>
      <img v-if="!title" src="@/assets/img/sad.png"/>
      <p v-else class="title">{{ title }}</p>
      <p class="content">{{ content }}</p>
      <button v-if="title === 'Invalid Page'" v-on:click="newMap()" class="home">새 지도 생성하기</button>
    </div>
  </div>
</template>

<script>
export default ({
  methods: {
    newMap() {
      location.replace('/');
    }
  },
  name: 'ErrorPage',
  props: ['title', 'content'],
})
</script>

<style>
  .error {
    background-image: linear-gradient(230deg, rgb(113, 197, 152), rgb(254, 191, 16), rgb(254, 191, 16), rgb(239, 72, 35));
    width: 100%;
    height: 100%; 
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .error > div {
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