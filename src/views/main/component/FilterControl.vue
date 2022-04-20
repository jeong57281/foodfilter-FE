<template>
  <div>
    <div v-if="!activate" id="research">
      <button v-on:click="loadShop()">여기서 다시 검색하기</button>
    </div>
		<div v-else id="filterControl">
      <div>
        <p>필터</p>
        <div id="userFilter">
          <div v-for="(item, index) in sampleFilters" v-if="isGuide">
            <input
              v-model="item.checked"
              v-bind:id="'sampleItem' + index"
              v-bind:type="'checkbox'"
            />
            <label
              v-bind:for="'sampleItem' + index"
            >
              {{ item.name }}
            </label>
            <img
              v-if="item.change && item.checked"
              src = '@/assets/img/exclamation.png'
            />
          </div>
          <div v-for="(item, index) in userFilters">
            <input
              v-model="item.checked"
              v-bind:id="'userItem' + index"
              v-bind:type="'checkbox'"
              v-on:change="clickUserFilter(item.sid)"
            />
            <label
              v-bind:for="'userItem' + index"
            >
              {{ item.name }}
            </label>
            <img
              v-if="item.change && item.checked"
              src = '@/assets/img/exclamation.png'
            />
          </div>
        </div>
        <div id="myFilter">
          <div v-for="(item, index) in myFilter">
            <input
              v-model="item.checked"
              v-bind:id="'myItem' + index"
              v-bind:type="'checkbox'"
            />
            <label
              v-bind:for="'myItem' + index"
              v-bind:class="{invalid:!item.valid && item.checked}"
            >
              {{ item.keyword }}
            </label>
          </div> 
        </div>
        <div id="applyFilter">
          <button v-on:click="applyFilter()">적용</button>
        </div>
      </div>
		</div>
	</div>
</template>

<script>
  export default ({
    sockets: {
      init: function(data){
        this.mySid = data.sid;
        // 기존 정보를 삭제한다.
        this.userFilters = [];
        // 필터를 연다.
        this.activate = true;
        // 필터 정보를 초기화한다.
        for(let i = 0; i < data.filter.length; i++){
          this.myFilter[i].checked = data.filter[i];
        }
        // 사용법 소개를 위한 샘플 필터를 갱신한다.
        this.initMyFilter();
        this.updateSampleFilters();
        this.updateUserFilters();
      },
      join: function(data){
        if(this.mySid != data.sid){
          this.userFilters.push({
            sid: data.sid,
            name: data.name, 
            filter: data.filter,
            change: false,
            checked: false
          });
        }
      },
      changeName: function(data){
        if(this.mySid != data.sid){
          const idx = this.userFilters.findIndex(x => x.sid === data.sid);
          this.userFilters[idx].name = data.name;
        }
      },
      changeFilter: function(data){
        if(this.mySid != data.sid){
          const idx = this.userFilters.findIndex(x => x.sid === data.sid);
          const user = this.userFilters[idx];
          user.filter = data.filter;
          user.change = true;
        }
        else{
          for(let i = 0; i < this.myFilter.length; i++){
            this.myFilter[i].checked = data.filter[i];
          }
        }
      },
      exit: function(data){
        if(this.mySid !== data.sid){
          const idx = this.userFilters.findIndex(x => x.sid === data.sid);
          this.userFilters.splice(idx, 1);
        }
      }
    },
    props: ['isGuide'],
    methods: {
      applyFilter: function(){
        // 필터 창 닫기
        this.activate = false;
        // 현재 필터 정보를 다른 사용자에게 알리기
        const filter = [];
        for(let i = 0; i < this.myFilter.length; i++){
          filter.push(this.myFilter[i].checked);
        }
        this.$socket.emit('changeFilter', {
          filter: filter
        });
        // 선택된 정보로 음식점 검색하기
        this.loadShop();
      },
      loadShop: function(){
        const search = [];
        for(let i = 0; i < this.myFilter.length; i++){
          if(this.myFilter[i].valid && this.myFilter[i].checked){
            search.push(this.myFilter[i].keyword);
          }
        }
        eventBus.$emit('loadShop', {
          search: search
        })
      },
      clickUserFilter: function(sid){
        // 필터 정보 업데이트
        this.initMyFilter();
        this.updateUserFilters();
        // 필터의 변경을 알리는 느낌표를 제거
        const idx = this.userFilters.findIndex(x => x.sid === sid);
        this.userFilters[idx].change = false;
      },
      initMyFilter: function(){
        for(let i = 0; i < this.myFilter.length; i++){
          this.myFilter[i].valid = true;
        }
      },
      updateUserFilters: function(){
        for(let c = 0; c < this.myFilter.length; c++){
          let isValid = true;
          for(let r = 0; r < this.userFilters.length; r++){
            if(!this.userFilters[r].checked) continue;
            if(this.userFilters[r].filter[c]) continue;
            isValid = false;
          }
          if(!isValid){
            this.myFilter[c].valid = false;
          }
        }
      },
      updateSampleFilters: function(){
        for(let c = 0; c < this.myFilter.length; c++){
          let isValid = true;
          for(let r = 0; r < this.sampleFilters.length; r++){
            if(!this.sampleFilters[r].checked) continue;
            if(this.sampleFilters[r].filter[c]) continue;
            isValid = false;
          }
          if(!isValid){
            this.myFilter[c].valid = false;
          }
        }
      }
    },
    mounted() {
      // filter renew
      eventBus.$on('updateFilter', () => {
        if(this.activate){
          this.initMyFilter();
          this.updateUserFilters();
        }
      });
      // filter toggle
      eventBus.$on('toggleFilter', () => {
        if(!this.activate){
          for(let i = 0; i < this.userFilters.length; i++){
            this.userFilters[i].change = false;
          }
          this.initMyFilter();
          this.updateUserFilters();
        }
        this.activate = !this.activate;
      });
    },
    data() {
      return {
        activate: true, // 필터 창 활성화 여부
        mySid: '',
        myFilter: [
          {
            keyword: '치킨',
            checked: true,
            valid: true
          },
          {
            keyword: '피자',
            checked: true,
            valid: true
          },
          {
            keyword: '햄버거',
            checked: true,
            valid: true
          },
          {
            keyword: '돈까스',
            checked: true,
            valid: true
          },
        ],
        userFilters: [/*
          {
            sid: '',
            name: '',
            filter: [true, false, true, true],
            change: false,
            checked: true
          }
        */],
        sampleFilters: [
          {
            name: '야생의 사자',
            filter: [true, false, true, true],
            change: true,
            checked: true
          },
          {
            name: '많이먹는 타조',
            filter: [true, true, true, true],
            change: false,
            checked: false
          }
        ]
      };
    }
  })
</script>

<style>
  .invalid {
    background-color: gray !important;
  }

  #research {
    position: absolute;
    bottom: 0%;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }

  #research > button {
    font-size: 16px;
    background: white;
    padding: 6px;
    border: 0px;
    border-radius: 6px;
    box-shadow: 0px 2px 2px 0px gray;
  }

  #filterControl {
    transition: all .2s linear 0s;
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 0%;
    z-index: 10;
    width: 100%;
  }

  #filterControl > div {
    background-color: white;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: 0px 0px 10px 2px lightgray;
    width: 100%;
    margin: 0px 10px;
    max-width: 500px;
  }

  #filterControl > div > p {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    padding: 5px;
    border-bottom: 1px solid lightgray;
  }

  #filterControl > div > div {
    min-height: 20px;
  }

  #userFilter {
    padding: 10px 15px;
    border-bottom: 1px solid lightgray;
    display: flex;
    flex-wrap: wrap;
  }

  #userFilter > div {
    margin: 10px 3px;
    position: relative;
  }

  #userFilter > div > img {
    position: absolute;
    right: -5px;
    top: -5px;
  }

  #myFilter {
    padding: 10px 15px;
    display: flex;
    flex-wrap: wrap;
  }

  #myFilter > div {
    margin: 10px 3px;
  }

  #filterControl input[type="checkbox"], #userFilter > div input[type="checkbox"] {
    display: none;
  }

  #filterControl input[type="checkbox"] + label, #userFilter > div input[type="checkbox"] + label{
    padding: 6px;
    border: 0px;
    border-radius: 14px;
    background: white;
    box-shadow: 0px 1px 2px 0px lightgray;
    font-size: 14px;
  }

  #filterControl input[type="checkbox"]:checked + label, #userFilter > div input[type="checkbox"]:checked + label{
    padding: 6px;
    border: 0px;
    border-radius: 14px;
    background: lightgreen;
    box-shadow: 0px 1px 2px 0px lightgray;
    color: white;
    font-size: 14px;
  }

  #applyFilter {
    padding: 0 10px 10px 10px;
    text-align: center;
    padding-top: 0px;
  }

  #applyFilter > button {
    width: 100%;
    padding: 6px;
    font-size: 16px;
    background: white;
    border: 1px solid lightgray;
    border-radius: 2px;
  }
</style>