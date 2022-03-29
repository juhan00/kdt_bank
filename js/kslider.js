const kSlider = function(target, option) {
  
  innerName(target, option);

  function innerName(target, option) {
    const slider = document.querySelector(`${target}`);
    slider.classList.add('k_list');

    const kindSlider = document.createElement('div');
    const kindWrap = document.createElement('div');
    
    slider.parentNode.insertBefore(kindWrap, slider);
    kindSlider.className = 'kind_slider';
    kindWrap.className = 'kind_wrap';
    kindSlider.appendChild(slider);
    kindWrap.appendChild(kindSlider);
  
    const moveButton = document.createElement('div');
    moveButton.className = 'arrow';
    const prevA = document.createElement('a');
    const nextA = document.createElement('a');
    moveButton.className = 'arrow';
    prevA.className = 'prev';
    nextA.className = 'next';
    prevA.innerHTML = '이전';
    nextA.innerHTML = '다음';
    prevA.href = '';
    nextA.href = '';
    moveButton.appendChild(prevA);
    moveButton.appendChild(nextA);
    kindWrap.appendChild(moveButton);

    const slideLis = slider.querySelectorAll('.k_list > *');
    const liWidth = document.body.offsetWidth;    
    setScreenWidth(slideLis, liWidth);
    
    const OPTION = (option => {
      const OPTION = {...option};
      if (OPTION.speed <= 0){
        throw new Error('0 이상의 값을 사용하세요');
      }else{
        return Object.freeze(OPTION);
      }
    })(option);

    let moveDist = -liWidth;
    let currentNum = 1;
    const speedTime = OPTION.speed;
    const touchExcept = document.querySelector(`${OPTION.touchExcept}`);

    const cloneA = slideLis[0].cloneNode(true);
    const cloneC = slideLis[slideLis.length - 1].cloneNode(true);
    slider.insertBefore(cloneC, slideLis[0]);
    slider.appendChild(cloneA);
  
    const slideCloneLis = slider.querySelectorAll('.k_list > *');
    const sliderWidth = liWidth * slideCloneLis.length;
    
    slider.style.width = sliderWidth + 'px';
    slider.style.left = `${moveDist}px`;

    moveButton.addEventListener('click', moveSlide);  

    function moveSlide(e){
      e.preventDefault();
      if(e.target.className === 'next'){ 
        clickNext();
      }else{  
        clickPrev();
      }      
    }

    function move(direction){        
      currentNum += (-1 * direction)
      moveDist += liWidth * direction;
      slider.style.transition = `all ${speedTime}ms ease`;
      slider.style.left = `${moveDist}px`; 
    }

    function clickNext(){
      move(-1);
      if(currentNum === (slideCloneLis.length - 1)){
        setTimeout(() => {
          slider.style.transition = 'none';
          moveDist = -liWidth;
          slider.style.left = `${-liWidth}px`;
          currentNum = 1;
        }, speedTime);
      }
    }

    function clickPrev(){
      move(1);
      if(currentNum === 0){  
        setTimeout(() => {
          slider.style.transition = 'none';
          moveDist = -liWidth * (slideCloneLis.length - 2);
          slider.style.left = `${moveDist}px`;
          currentNum = slideCloneLis.length - 2;
        }, speedTime);
      } 
    }

    //슬라이드 드래그 실행
    const sliderDragItem = document.querySelector('.k_list');
    const sliderDragContainer = document.querySelector('.k_list');
    const dragLength = 50;
    sliderDragMotion(sliderDragItem, sliderDragContainer);

    //슬라이드 드래그
    function sliderDragMotion(sliderDragItem, container){
      const sliderDragItemEl = sliderDragItem;
      const containerEl = container;
      
      let activeItem = null;
      let active = 'false';
      let xOffset, initialX, currentX;

      sliderDragItemEl.addEventListener('touchstart', sliderDragStart, false);
      sliderDragItemEl.addEventListener('touchend', sliderDragEnd, false);
      
      sliderDragItemEl.addEventListener('mousedown', sliderDragStart, true);
      sliderDragItemEl.addEventListener('mouseup', sliderDragEnd, false);

      //드래그 시작
      function sliderDragStart(e) { 
        
        if(e.target.parentNode <= touchExcept){
          return;
        }
        document.addEventListener('touchmove', sliderDrag, false);
        document.addEventListener('mousemove', sliderDrag, false);

        currentX = 0;
        activeItem = containerEl;  
        active = true;

        if (e.target === sliderDragItemEl) {     
          active = true;        
        }
        if (activeItem !== null) {
          if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX;
          } else {
            initialX = e.pageX;
          }      
        }    
      }

      //드래그 중
      function sliderDrag(e) {
        if (active) {
          if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
          } else {
            currentX = e.pageX - initialX;
          }     
          setTranslate(activeItem, currentX);
        }
      }

      //드래그 끝
      function sliderDragEnd(e) {
        
        if (active) {
          slider.style.transform = `translateX(0px)`;
          if(Math.abs(currentX) > dragLength){
            if(Math.sign(currentX) === -1){
              clickNext();
            }else{
              clickPrev();
            }
          }       
          sliderActiveOff();
        }

        function move(direction){        
          currentNum += (-1 * direction)
          moveDist += liWidth * direction;
          slider.style.transition = `all ${speedTime}ms ease`;
          slider.style.left = `${moveDist}px`; 
        }
      }

      //드래그 컨테이너 크기 변경
      function setTranslate(el, xMove) {
        el.style.transform = `translateX(${xMove}px)`;
      }

      //드래그 활성화 끄기
      function sliderActiveOff(){
        active = false;

        document.removeEventListener('touchmove', sliderDrag, false);
        document.removeEventListener('mousemove', sliderDrag, false);
      }
    }
  }

  function setScreenWidth(el, liWidth){ 
    el.forEach( item => {
      item.classList.add('k_item');
      item.style.width = `${liWidth}px`;
    });
  }

  window.addEventListener('resize', function() { 
    window.location.href=window.location.href;
  }, true);
}
