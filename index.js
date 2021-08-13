initCSS();

/* 方法：初始化 CSS */
function initCSS() {
  const cssFileList = [
    './Football/football.css',
    './BD/BD.css',
  ];
  
  cssFileList.forEach((ele) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = ele;
    document.querySelector('head').appendChild(link);
  })
}

/* 方法：初始化 JS */
function initJS() {
  const jsFileList = [
    './JS/utils.js',
    './JS/api.js',
    // './Football/football.js',
    './BD/BD.js'
  ];

  jsFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + new Date().getTime();
    document.querySelector('body').appendChild(script);
  })
}

/* 方法：初始化 JSON */
function initJSON() {
  const dataFileList = [
    "./lib/data/FootballData.js",
    "./lib/data/CalculatorData.js",
    "./lib/data/StatusData.js",
    "./lib/data/FootballBDData.js",
    "./lib/data/BDAddAlarmData.js",
  ]
  dataFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + new Date().getTime();
    document.querySelector('body').appendChild(script);
  })
}


window.onload = function () {
  if (!window.location.host) {
    Object.assign(window, {
      mock: {}
    });
    initJSON();
  }
  initJS();

  init(window, document); // 初始化
}

/* 方法：初始化 */
function init(w, d) {
  Object.assign(w, {
    FB: {}, // football
    BD: {}, // BD
    showNavName: 'FB', // 导航栏名称
  });
  bindNav(); // 绑定导航栏


  /* 方法：绑定导航栏点击事件 */
  function bindNav() {
    const s_nav_List = d.querySelectorAll('#s_navBox>li');
    const s_navContent_list = d.querySelectorAll('main>.content');
    s_nav_List.forEach((ele, index) => {
      ele.addEventListener('click', function (e) {
        const navName = ele.dataset['nav'];
        if(navName === w.showNavName){
          return false;
        }
        s_navContent_list.forEach((ele_inner, index_inner) => {
          ele_inner.classList.remove('show');
          s_nav_List[index_inner].classList.remove('active');
        })
        s_navContent_list[index].classList.add('show');
        ele.classList.add('active');
        w.showNavName = navName;
      })
    })
  }
  
  // init end
}

