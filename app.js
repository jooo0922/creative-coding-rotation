'use strict';

import {
  Polygon
} from './polygon.js';

class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    // 사용자의 모니터 해상도 환경을 고려한 것. 
    // 레티나 디스플레이를 지원할만한 해상도가 되면 2를 return해서 stageWidth/Height에 곱해서
    // 캔버스 사이즈를 설정해주려는 거임.
    // 굳이 레티나 지원도 못하는 모니터에서 캔버스 사이즈만 2배로 늘려서 보여줘도 성능 저하만 생길테니까.

    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();

    this.isDown = false; // 마우스 클릭이 눌러진 상태인지를 판단함.
    this.moveX = 0; // 현재 pointer의 x좌표값에서 이전의 x좌표값을 뺀 값, 즉 x좌표를 얼마만큼 움직였는지가 들어갈거임.
    this.offsetX = 0; // 이전에 클릭하거나 움직인 pointer의 x좌표값이 들어갈거임.

    document.addEventListener('pointerdown', this.onDonw.bind(this), false); // 포인터로 document를 클릭을 눌렀을 때
    document.addEventListener('pointermove', this.onMove.bind(this), false); // 포인터를 document 상에서 움직이고 있을 때
    document.addEventListener('pointerup', this.onUp.bind(this), false); // 포인터로 document의 클릭을 뗏을 때
    // 한마디로, 브라우저 화면에 대한 클릭 이벤트를 3단계로 나눠서 걸어준 것. 

    window.requestAnimationFrame(this.animate.bind(this));
    // window. 생략하고 써줘도 똑같은거임. 애초에 requestAnimationFrame이 전역객체(window)의 메소드니까!
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // Polygon resize할 때마다 변화하는 stageWidth/Height에 맞춰 인스턴스 생성
    this.polygon = new Polygon(
      this.stageWidth / 2,
      // this.stageHeight / 2, Polygon을 가운데에 위치시킬 때
      this.stageHeight + (this.stageHeight / 4), // Polygon의 y좌표값을 화면 밑으로, 바깥으로 보내버림. Polgon의 윗부분만 보일거임.

      // this.stageHeight / 3.5, Polygon이 가운데 위치해서 사이즈를 좀 작게해도 됬을 때
      this.stageHeight / 1.5, // Polygon이 아래로 내려버려서 아예 윗부분만 잘 보이도록 사이즈(반지름)을 크게 잡은거임
      15
    );
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this)); // 함수 내부에서 반복 호출해야지?

    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 이전 프레임은 매번 다 지워주고

    this.moveX *= 0.92;
    // pointer가 x좌표로 움직인 만큼에 0.92를 매 프레임마다 곱해줌.
    // Why? moveX는 this.polygon.animate()에 전달되서, rotate 각도에 변화를 줌으로써 회전을 시켜줌.
    // 그런데 항상 똑같은 moveX값이 들어가면 한번 돌렸을 때 계속 돌아감. 감속이 안됨.
    // 그래서 각도가 변화하는 값(즉 속도!)를 매 프레임마다 조금씩 낮추기 위해서 0.92를 곱하는 거.

    this.polygon.animate(this.ctx, this.moveX); // polygon 그려줌
  }

  onDonw(e) {
    this.isDown = true; // 포인터가 클릭이 눌러진 상태를 true로 바꾸고
    this.moveX = 0; // 
    this.offsetX = e.clientX; // pointerdown한 곳의 x좌표 위치를 넣어놓음. 
    /**
     * clientX, offsetX, pageX, screenX, layerX의 차이
     * 
     * clientX : 브라우저 페이지에서의 X좌표 위치를 반환. 스크롤 무시하고 해당 페이지 상단을 0으로 측정.
     * pageX : 브라우저 페이지에서의 x좌표 위치를 반환. 스크롤해서 넘어간 화면을 포함해서 측정.
     * screenX : 전체 모니터 스크린에서의 x좌표 위치를 반환.
     * offsetX : 이벤트 대상 객체에서의 상대적 마우스 x좌표 위치를 반환. (여기서 이벤트 대상은 canvas지?)
     * layerX : offsetX와 비슷함. 현재 레이어에서의 X좌표 위치를 반환.
     */
  }

  onMove(e) {
    if (this.isDown) {
      // this.isDown이 클릭되어서 true일 때에만 if block을 실행함.
      this.moveX = e.clientX - this.offsetX;
      // onDown에서 지정한 offsetX만큼을 현재 pointer가 움직인 x좌표값에서 빼줌
      // 즉, 이전의 x좌표의 위치에 비해 현재 pointer의 x좌표가 얼마나 움직였는지 알 수 있겠지?
      // 콘솔로 찍어보면 pointer를 빨리 움직일수록 moveX의 절대값이 더 커짐.
      // console.log(this.moveX);

      this.offsetX = e.clientX;
      // x좌표가 움직인 값을 계산하고 나서 현재 x좌표값을 이전 x좌표값으로 할당해놓음.
    }
  }

  onUp(e) {
    this.isDown = false;
    // pointer 클릭을 뗀 순간 onMove 메소드 if block을 실행할 수 없음.
    // 즉 x좌표값이 움직인 거리를 계산할 수 없지.
  }
}

window.onload = () => {
  new App();
};