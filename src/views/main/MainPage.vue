<template>
  <div v-if="!error" id="main">
    <!-- google map -->
    <div id="map"></div>
    <!-- filter control -->
    <FilterControl v-bind:isGuide="isGuide"></FilterControl>
    <!-- navigation bar -->
    <div id="navbar">
      <UserControl v-bind:isGuide="isGuide"></UserControl>
      <MenuControl v-on:changeMyLoc="changeMyLoc"></MenuControl>
    </div>
    <!-- loading image -->
    <img
      v-bind:class="{off:!loading}"
      id="loading"
      src="@/assets/img/loading.gif"
    /> 
    <!-- guide screen -->
    <div v-if="isGuide" id="guide">
      <button v-if="ready" v-on:click="startUsing()">시작하기</button>
      <div id="guideInfo">
        <div>
          <p id="guideTitle"> 모두에게 만족스러운 식사 메뉴가 필요할 때, </p>
          <p> 사용법 예시) </p>
          <table>
            <tr>
              <td><div class="num">1</div></td>
              <td>URL 주소를 친구에게 공유한 후 접속합니다.</td>
            </tr>
            <tr>
              <td><div class="num">2</div></td>
              <td>각자 먹고 싶은 음식을 고릅니다.</td>
            </tr>
            <tr>
              <td><div class="num">3</div></td>
              <td>서로의 필터를 사용할 수 있습니다.</td>
            </tr>
            <tr>
              <td><div class="num">4</div></td>
              <td>적용하면 함께 선택한 음식점이 검색됩니다.</td>
            </tr>
            <tr>
              <td style="text-align: center">
                <img src="@/assets/img/exclamation.png"/>
              </td>
              <td style="font-size: 12px">
                 : 해당 사용자의 필터가 변경되었음을 뜻합니다.
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
  <ErrorPage v-else v-bind:title='title' v-bind:content='content'/>
</template>

<script>
import FilterControl from '@/views/main/component/FilterControl';
import MenuControl from '@/views/main/component/MenuControl';
import UserControl from '@/views/main/component/UserControl';
import ErrorPage from '@/views/common/component/ErrorPage';
import axios from 'axios';
import sally from '@/assets/img/sally.png';
import graySally from '@/assets/img/graySally.png';

let map;
let service;
let defaultPosition;

export default ({
  name: 'MainPage',
  methods: {
    checkMap: async function() {
      try{
        const res = await axios.get('/api/maps/isvalid');
        if(!res.data.valid){
          this.title = 'Invalid Page';
          this.content = '만료된 페이지 입니다.';
          this.error = true;
        }
      } catch (err) {
        this.content = '오류가 발생했습니다.';
        this.error = true;
      }
    },
    initMap: function() {
      // google maps api
      defaultPosition = new google.maps.LatLng(37.3595704, 127.105399);
      const mapOptions = {
        center: defaultPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      }
      map = new google.maps.Map(document.querySelector('#map'), mapOptions);
      // google places api
      service = new google.maps.places.PlacesService(map);
    },
    changeMyLoc: function() {
      // gps (loading 시작, 종료 위치 다시 고민)
      this.loading = true;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const coord = new google.maps.LatLng(lat, lng);
            this.myMarker.setPosition(coord);
            map.setCenter(coord);
            map.setZoom(15);
            this.$socket.emit('changeLoc', {
              loc: {
                lat: lat,
                lng: lng
              }
            });
            this.loading = false;
          },
          (err) => {
            this.loading = false;
          }
        )
      }
    },
    startUsing: function() { 
      // 가이드 화면이 사라진 후 샘플이 없는 상태에서 필터 업데이트
      this.isGuide = false;
      eventBus.$emit('updateFilter');
      this.changeMyLoc();
    },
    resizeLoading: function() {
      // 로딩 사진 위치 조정
      const loading = document.querySelector('#loading');
      loading.style.left = `${window.innerWidth/2-100}px`;
      loading.style.top = `${window.innerHeight/2-100}px`;
    },
    resizeGuide: function() {
      // 컨트롤 번호 위치 조정
      if(this.isGuide){
        const numObj = document.querySelectorAll('#guide > .num');
        for(let i = 0; i < 4; i++){
          const obj = document.querySelector(`#${this.useOrderObjName[i]}`);
          const clientRect = obj.getBoundingClientRect();
          numObj[i].style.top = `${clientRect.top}px`;
          numObj[i].style.left = `${clientRect.left-this.useOrderObjLoc[i]}px`;
        }
      }
    }
  },
  sockets: {
    init: function(data) {
      // 소켓 연결 시 안내 화면, 시작 버튼 활성화
      this.isGuide = true;
      this.ready = true;
      // 로딩창의 위치를 재설정
      this.resizeLoading();
      // 나의 세션 아이디를 저장한다.
      this.mySid = data.sid;
      // 기존 정보를 삭제한다.
      if(this.myMarker){
        this.myMarker.setMap(null);
      }
      for(let i = 0; i < this.userMarkers.length; i++){
        this.userMarkers[i].marker.setMap(null);
      }
      this.userMarkers = [];
      for(let i = 0; i < this.shops.length; i++){
        this.shops[i].setMap(null);
      }
      this.shops = [];
      this.infos = [];
      // 내 위치를 표시할 마커를 생성한다.
      map.setCenter(defaultPosition);
      this.myMarker = new MarkerWithLabel({
        position: defaultPosition,
        map: map,
        labelContent: data.name,
        labelAnchor: new google.maps.Point(40, -26),
        labelClass: 'label',
        icon: {
          url: sally,
          size: new google.maps.Size(50, 52),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 26)
        }
      });
    },
    join: function(data) {
      if(this.mySid !== data.sid){
        this.userMarkers.push({
          sid: data.sid,
          loc: data.loc,
          marker: new MarkerWithLabel({
            position: new google.maps.LatLng(data.loc.lat, data.loc.lng),
            map: map,
            labelContent: data.name,
            labelAnchor: new google.maps.Point(40, -26),
            labelClass: 'label',
            icon: {
              url: graySally,
              size: new google.maps.Size(50, 52),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(25, 26)
            }
          })
        });
      }
    },
    changeName: function(data) {
      if(this.mySid !== data.sid){
        const idx = this.userMarkers.findIndex(x => x.sid === data.sid);
        this.userMarkers[idx].marker.labelContent = data.name;
        map.setCenter(map.center);
      }
      else{
        this.myMarker.labelContent = data.name;
        map.setCenter(map.center);
      }
    },
    changeLoc: function(data) {
      const coord = new google.maps.LatLng(data.loc.lat, data.loc.lng);
      if (this.mySid != data.sid) {
        const idx = this.userMarkers.findIndex(x => x.sid === data.sid);
        const user = this.userMarkers[idx];
        user.loc = data.loc;
        user.marker.setPosition(coord);
      }
      else {
        this.myMarker.setPosition(coord);
      }
    },
    exit: function(data){
      if(this.mySid !== data.sid){
        const idx = this.userMarkers.findIndex(x => x.sid === data.sid);
        this.userMarkers[idx].marker.setMap(null);
        this.userMarkers.splice(idx, 1);
      }
    }
  },
  mounted() {
    // 지도 유효성 검사
    this.checkMap();
    // 구글 맵 초기화
    this.initMap();
    // 설계상 지울 수 없는 이벤트 버스들
    eventBus.$on('changeName', (data) => {
      this.myMarker.labelContent = data.name;
      map.setCenter(map.center);
      alert('이름 변경이 완료되었습니다.');
    })
    eventBus.$on('changeUserLoc', (data) => {
      const idx = this.userMarkers.findIndex(x => x.sid === data.sid);
      const user = this.userMarkers[idx];
      const coord = new google.maps.LatLng(user.loc.lat, user.loc.lng);
      map.setCenter(coord);
    });
    eventBus.$on('loadShop', (data) => {
      this.loading = true;
      // 기존 매장 정보를 삭제
      for(let i = 0; i < this.shops.length; i++){
        this.shops[i].setMap(null);
      }
      this.shops = [];
      this.infos = [];
      // create infowindow
      const infoWindow = new google.maps.InfoWindow();
      // call api
      for(let word of data.search){
        const request = {
          location: map.center,
          radius: '500',
          type: ['restaurant'],
          keyword: word
        };
        service.nearbySearch(request, (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            // 전달받은 매장 정보를 마커로 등록
            for(let shop of results){
              this.shops.push(new google.maps.Marker({
                position: new google.maps.LatLng(shop.geometry.location.lat(), shop.geometry.location.lng()),
                map: map
              }));
              const contentString = [
                '<div>',
                '   <p>' + shop.name + '</p>',
                '</div>'
              ].join('');
              this.infos.push(contentString); // infos 삭제 가능
              const idx = this.shops.length-1;
              google.maps.event.addListener(this.shops[idx], 'click', () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, this.shops[idx]);
              });
            }
          }
        });
      }
      this.loading = false;
    });
    // 사용 순서번호를 매긴다.
    this.useOrderObjName = ['menuShare', 'myFilter', 'userFilter', 'applyFilter'];
    this.useOrderObjLoc = [10, 0, 0, 0];
    const guide = document.querySelector('#guide');
    for(let i = 0; i < 4; i++){
      const obj = document.querySelector(`#${this.useOrderObjName[i]}`);
      const clientRect = obj.getBoundingClientRect();
      const div = document.createElement('div');
      div.innerText = `${i+1}`;
      div.style.position = 'absolute';
      div.className = 'num';
      div.style.top = `${clientRect.top}px`;
      div.style.left = `${clientRect.left-this.useOrderObjLoc[i]}px`;
      guide.appendChild(div);
    }
    // 브라우저 화면 크기조정 시 위치조정
    window.addEventListener('resize', () => {
      this.resizeLoading();
      this.resizeGuide();
    }, true)
  },
  components: {
    'FilterControl': FilterControl,
    'UserControl': UserControl,
    'MenuControl': MenuControl,
    'ErrorPage': ErrorPage
  },
  data() {
    return {
      // error
      error: false,
      title: '',
      content: '',
      // guide, loading, filter
      ready: false,
      loading: false,
      isGuide: true,
      filter: true,
      useOrderObjName: [],
      useOrderObjLoc: [],
      // google map
      mySid: '',
      myMarker: undefined,
      shops: [],
      userMarkers: [/*
        {
          sid: '',
          loc: Object,
          marker: Object
        }
      */]
    };
  }
})
</script>

<style>
  #map {
    width: 100%;
    height: 100%;
  }

  .label {
    text-align: center;
    width: 80px;
    background-color: white;
    border: 1px solid lightgray;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    font-family: 'NanumGothic';
  }

  #main {
    width: 100%;
    height: 100%;
  }

  #navbar {
    display: flex;
    position: absolute;
    z-index: 10;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    top: 0%;
  }

  .off {
    display: none !important;
  }

  .num {
    text-align: center;
    background-color: lightskyblue;
    width: 20px;
    height: 20px;
    color: black;
    font-weight: bold;
    border-radius: 10px;
  }

  #loading {
    position: absolute;
    z-index: 100;
  }

  #loading > p {
    color:white;
    font-weight: bolder;
    font-size: 20px;
    position: absolute;
    text-align: center;
    width: 100%;
    top:45%;
  }

  #guide {
    top: 0%;
    position: absolute;
    width: 100%;
    height :100%;
    background-color: rgba(0,0,0,0.6);
    z-index: 100;
  }

  #guide > button {
    position: inherit;
    bottom: 10px;
    right: 10px;
    border: 0px;
    border-radius: 4px;
    padding: 6px;
    font-size: 16px;
    color: white;
    background: rgb(122, 144, 169);
    box-shadow: 1px 1px 4px 0px black;
  }

  #guideInfo > div > p {
    color: white;
    margin-bottom: 15px;
    width: 100%;
    text-align: left;
  }

  #guideInfo > div > table {
    width: 100%;
  }

  #guideInfo > div > table > tr > td {
    padding-bottom: 5px;
    color: white;
    font-size: 15px;
  }

  #guideInfo > div > table > tr > td > img {
    vertical-align: middle;
  }

  #guideInfo {
    width: 100%;
    height: 100%;
    display: flex;
    justify-self: center;
    align-items: center;
  }

  #guideInfo > div {
    margin: 20px;
    display: inherit;
    justify-self: center;
    align-items: center;
    flex-direction: column;
  }

  #guideTitle {
    font-size: 20px;
  }
</style>