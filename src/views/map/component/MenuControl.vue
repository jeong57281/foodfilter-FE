<template>
  <div id="menuControl">
    <div><button v-on:click="copyURL()" id="menuShare">공유</button></div>
    <div><button v-on:click="openFilter()" id="menuFilter">필터</button></div>
    <div><button v-on:click="myLoc()" id="menuLocation">위치</button></div>
    <input type='text' style="font-size:16px" id='copyText'/>
  </div>
</template>

<script>
  export default ({
    methods: {
      myLoc: function() {
        this.$emit('changeMyLoc');
      },
      openFilter: function() {
        eventBus.$emit('toggleFilter');
      },
      copyURL: function() {
        let copyText = document.querySelector('#copyText');
        copyText.value = document.location.href;
        copyText.focus();
        copyText.select();
        document.execCommand('copy');
        alert('현재 URL 이 복사되었습니다. 공유해서 사용하세요.');
      }
    }
  })
</script>

<style>
  #menuControl {
    margin: 5px;
  }

  #menuControl > div {
    margin-bottom: 5px;
  }

  #menuControl > div > button {
    border: 0px;
    border-radius: 6px;
    box-shadow: 0px 2px 2px 0px gray;
    padding: 6px;
    font-size: 16px;
    background: white;
  }

  #menuControl > div > button:focus {
    outline: none;
  }

  #copyText {
    position: absolute;
    left: -9999px;
  }
</style>