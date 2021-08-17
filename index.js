initCSS();

/* 方法：初始化 CSS */
function initCSS() {
  const cssFileList = [
    './Football/football.css'
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
    './Config/config.js',
    './Football/football.js'
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
    "./lib/data/StatusData.js"
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
}