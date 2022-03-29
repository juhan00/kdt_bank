// json 데이터 가져오기
fetch('https://05castle.github.io/team-study/accounts.json')
  .then(res => res.json())
  .then(accountsData => {startMain(accountsData)});

//메인화면 시작
function startMain(accountsData){
  const homeEl = document.querySelector('.home');
  const homeSectionEl = homeEl.querySelector('section');
  const accountLength = accountsData.accounts.length;

  accountsData.accounts.forEach((el,index) => {
    //section 클론
    if(index !== 0){
      const cloneSection = homeSectionEl.cloneNode(true);
      homeEl.appendChild(cloneSection);
    }
  });

  //메인화면 계좌별 데이터 넣기
  for(let i = 0; i < accountLength; i++){
    const account = accountsData.accounts[i];

    //계좌 데이터 넣기 실행
    mainDataPush(account, i, accountLength);
  }

  //계좌 데이터 넣기
  function mainDataPush(account, index, accountLength){ 
    // 상단 데이터   
    const currentSectionEl = document.querySelector(`.home`).children[index];
    const accountNameEl = currentSectionEl.querySelector('header h3');
    const accountNumEl = currentSectionEl.querySelector('.account_info .info .num');
    const accountCashEl = currentSectionEl.querySelector('.account_info .info > .cash');
    const barColorEl = currentSectionEl.querySelector('.account_info .info .graph .bar_color');
    const notiDateEl = currentSectionEl.querySelector('.account_info .info .noti .date');
    const notiCashEl = currentSectionEl.querySelector('.account_info .info .noti .cash');

    accountNameEl.innerText = account.accountName; 
    accountNumEl.innerText = account.accountNum; 
    accountCashEl.innerHTML = `${accountCashAddComma(account.accountCash)}<span>원</span>`; 
    notiDateEl.innerText = dayLeft(); 
    notiCashEl.innerText = cashLeft(account.useGoal, account.useCash); 
    barColorEl.style.width = `${cashAmount(account.useGoal, account.useCash)}%`; 
    barColorEl.style.backgroundColor = account.useColor; 
    
    //히스토리 영역
    const historyEl = currentSectionEl.querySelector('.account_history');
  
    //저금통 영역
    const saveItemAreaEl = currentSectionEl.querySelector('.save_list .scroll_area');
    const saveItemUlEl = document.createElement('ul');
    saveItemAreaEl.insertBefore(saveItemUlEl, saveItemAreaEl.firstChild);
    const saveLists = account.saveList;
    saveLists.forEach(saveList => {
      const saveItemliEl = document.createElement('li');
      saveItemUlEl.appendChild(saveItemliEl);      
      const saveItemHtml = 
      `
      <div class="save_item">
        <div class="title">
          <h4>${saveList.title}</h4>
          <strong>${accountCashAddComma(saveList.saveCash)}</strong>
        </div>
        <div class="color" style="background-color:${saveList.color};width:${saveAmount(saveList.saveGoal, saveList.saveCash)}%;"></div>
      </div>
      `;

      saveItemliEl.innerHTML = saveItemHtml;
    });

    //recent 영역
    const recentUlEl = document.createElement('ul');
    recentUlEl.classList.add('recent');
    recentUlEl.classList.add(`${index}`);
    historyEl.appendChild(recentUlEl);
    
    let reverseHistoryLists = getReverseHistory(account.accountHistory);
    let historyDate = null;
    let dateIndex = 0;

    reverseHistoryLists.forEach(historyList => {
      if(historyDate !== historyList.date){    
        const recentLiEl = document.createElement('li');
        recentUlEl.appendChild(recentLiEl);

        const recentTitEl = document.createElement('div');
        recentTitEl.classList.add('recent_tit');
        recentLiEl.appendChild(recentTitEl);
        const recentTitHtml =
        `
          <h4>${convertDateFormat(historyList.date)}</h4>
          <strong>${sumDateUseCash(account.accountHistory, historyList.date)}원 지출</strong>
        `;
        recentTitEl.innerHTML = recentTitHtml;
        const recentInnerUlEl = document.createElement('ul');
        recentInnerUlEl.classList.add('recent_list');
        recentLiEl.appendChild(recentInnerUlEl);
        const recentInnerLiEl = document.createElement('li');   
        recentInnerUlEl.appendChild(recentInnerLiEl);
        recentInnerLiEl.innerHTML = `${historyList.history} ${checkIncome(historyList.price, historyList.income)}`;  

        dateIndex = dateIndex + 1;
      }else{          
        const recentInnerLiEl = document.createElement('li');
        const recentInnerUlEl = currentSectionEl.querySelector(`.recent li:nth-child(${dateIndex}) .recent_list`);      
        recentInnerUlEl.appendChild(recentInnerLiEl);
        recentInnerLiEl.innerHTML = `${historyList.history} ${checkIncome(historyList.price, historyList.income)}`;
      }    
      historyDate = historyList.date; 
    });  
    //드래그 실행
    const dragItem = currentSectionEl.querySelector('.drag_bar');
    const dragContainer = currentSectionEl.querySelector('.account_history');
    dragMotion(dragItem, dragContainer, 300);
    
    //마지막턴에 슬라이더 실행
    if(index === accountLength-1){
      kSlider('.home', {
        speed:500,
        touchExcept:'.save_list'
      }); 
    }
  }

  //콤마 추가
  function accountCashAddComma(data){
    const str = `${data}`;
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
  }
  
  //날짜 정보 구하기
  function getDateInfo(){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateInfo = {day:day, month:month, year:year, date:date}
    return dateInfo;
  }
  
  //이번달 남은 일수 계산하기
  function dayLeft(){
    const totalDay = new Date(getDateInfo().year, getDateInfo().month,0).getDate();
    return totalDay - getDateInfo().day;
  }
  
  //이번달 남은 돈
  function cashLeft(useGoal, useCash){
    return useGoal - useCash;
  }

  //목표금액 사용량
  function cashAmount(useGoal, useCash){
    return (useCash/useGoal) * 100;
  }
  
  //저금통 저장량
  function saveAmount(saveGoal, saveCash){
    return (saveCash/saveGoal) * 100;
  }
  
  //recent 날짜 역순 정렬
  function getReverseHistory(accountHistory){
    const reverseHistory = accountHistory.sort((a, b) => {
      return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
    });
    return reverseHistory;
  }
  
  //recent 날자별 지출
  function sumDateUseCash(accountHistory, date){
    const listByDate = accountHistory.filter(arr => arr.date === date && arr.income === 'out');
    const sumUseCash = listByDate.reduce(function(acc, current){
      return acc + current.price;
    },0);
    return accountCashAddComma(sumUseCash);
  }
  
  //지출 income 체크
  function checkIncome(cash, income){
    if(income === 'in'){
      return `<strong class="orange">+${accountCashAddComma(cash)}</strong>`;
    }else{
      return `<strong>${accountCashAddComma(cash)}</strong>`;
    }
  }
  
  //날짜 보여주는 형식 변환
  function convertDateFormat(date){
    function convertFormat(date, days) { 
      const clone = new Date(date); 
      clone.setDate(date.getDate() + days); 
      return clone; 
    }
    const today = new Date();
    const daysAgo0 = convertFormat(today, 0).toISOString().split("T")[0];
    const daysAgo1 = convertFormat(today, -1).toISOString().split("T")[0];
    const daysAgo2 = convertFormat(today, -2).toISOString().split("T")[0];
    const daysAgo3 = convertFormat(today, -3).toISOString().split("T")[0];
    const daysAgo4 = convertFormat(today, -4).toISOString().split("T")[0];
    const daysAgo5 = convertFormat(today, -5).toISOString().split("T")[0];
  
    if(daysAgo0 === date){
      return '오늘';
    }else if(daysAgo1 === date){
      return '어제';
    }else if(daysAgo2 === date){
      return '2일전';
    }else if(daysAgo3 === date){
      return '3일전';
    }else if(daysAgo4 === date){
      return '4일전';
    }else if(daysAgo5 === date){
      return '5일전';
    }else{
      return date;
    }  
  }
}


