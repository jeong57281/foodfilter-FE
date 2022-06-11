<template>
  <div id="userControl">
    <div id="userName">
      <div id="userNameInput">
        <input v-model="myName" type="text"/>
        <img src="@/assets/img/x.png"/>
      </div>
      <div id="userNameChange">
        <button v-on:click="changeName()">변경</button>
      </div>
    </div>
    <div id="userList">
      <div v-on:click="toggleUserList()" id="userListLabel">
        <img src='@/assets/img/arrow.png' v-bind:class="{rotate:open}"/>
        <p>접속중인 유저 목록</p>
        <div id="userCount">
          <p v-if="isGuide">({{ userNames.length + sampleNames.length }})</p>
          <p v-else>({{ userNames.length }})</p>
        </div>
      </div>
      <div id="userListTable" v-bind:class="{off:!open}">
        <p
          v-for="item in sampleNames"
          v-if="isGuide"
        >
          {{ item.name }}
        </p>
        <p
          v-for="item in userNames"
          v-on:click="changeLoc(item.sid)"
        >
          {{ item.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  export default ({
    methods: {
      toggleUserList: function(){
        this.open = !this.open;
      },
      changeLoc: function(sid){
        this.$emit('changeUserLoc', sid);
      },
      changeName: function(){
        const input = document.querySelector('#userNameInput > input');
        if(this.myName === ''){
          alert('변경할 이름을 입력해주세요.');
          input.focus();
        }
        else{
          this.$socket.emit('changeName', {
            name: this.myName
          });
          this.$emit('changeName', this.myName);
        }
      }
    },
    sockets: {
      init: function(data){
        this.mySid = data.sid;
        this.myName = data.name;
        this.userNames = [];
        this.open = true;
      },
      join: function(data){
        if(this.mySid != data.sid){
          this.userNames.push({
            sid: data.sid,
            name: data.name
          })
        }
      },
      changeName: function(data){
        if(this.mySid != data.sid){
          const idx = this.userNames.findIndex(x => x.sid === data.sid);
          this.userNames[idx].name = data.name;
        }
        else{
          this.myName = data.name;
        }
      },
      exit: function(data){
        if(this.mySid !== data.sid){
          const idx = this.userNames.findIndex(x => x.sid === data.sid);
          this.userNames.splice(idx, 1);
        }
      }
    },
    props: ['isGuide'],
    mounted() {
      // 이름 한번에 삭제
      document.querySelector('#userNameInput > img').addEventListener('click', () => {
        this.myName = '';
        document.querySelector('#userNameInput > input').focus();
      })
    },
    data() {
      return {
        open: true, // 접속자 명단 열림, 닫힘
        mySid: '',
        myName: '',
        userNames: [/*
          {
            sid: '',
            name: ''
          }
        */],
        sampleNames: [
          {
            name: '야생의 사자'
          },
          {
            name: '많이먹는 타조'
          }
        ]
      };
    }
  })
</script>

<style>
  .off {
    display: none !important;
  }

  .rotate {
    transform: rotate(90deg);
  }

  #userControl {
    display: flex;
    flex-direction: column;
    margin: 5px;
  }

  #userName {
    display: flex;
  }

  #userNameInput {
    border: 0px;
    border-radius: 6px;
    box-shadow: 0px 2px 2px 0px gray;
    padding: 6px;
    background: white;
    margin-right: 5px;
    display: flex;
    align-items: center;
  }

  #userNameInput > input {
    padding: 0px;
    margin: 0px;
    border: 0px;
    outline: none;
    font-size: 16px;
  }

  #userNameInput > img {
    height: 14px;
    padding: 0px;
    margin: 0px;
  }

  #userNameChange > button {
    border: 0px;
    border-radius: 6px;
    box-shadow: 0px 2px 2px 0px gray;
    padding: 6px;
    font-size: 16px;
    background: blue;
    color: white;
  }

  #userControl > div {
    margin-bottom: 5px;
  }

  #userList {
    display: flex;
    flex-direction: column;
  }

  #userListLabel {
    display: flex;
  }

  #userListLabel > p, #userCount > p {
    font-weight: bold;
  }

  #userListLabel > img {
    margin-left: 2px;
    transition: all .2s linear 0s;
  }

  #userListTable {
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0px 2px 2px 0px gray;
  }

  #userListTable > p {
    padding: 4px;
    border-bottom: 1px solid lightgray;
  }

  #userListTable > p:last-child {
    padding: 4px;
    border-bottom: 0px;
  }
</style>