<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  @font-face {
    font-family: 'NanumGothic';
    src: url('./assets/font/NanumGothic.ttf');
  }
  p, html, body, button{
    margin: 0px;
    font-family: 'NanumGothic';
  }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  body {
    margin: 0px;
  }
  #app {
    width: 100%;
    height: 100%;
  }
</style>
