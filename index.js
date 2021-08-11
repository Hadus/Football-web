initCSS();
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
window.onload = function () {
  if (!window.location.host) {
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

  const jsFileList = [
    './JS/utils.js',
    './JS/api.js',
    './Football/football.js'
  ];

  jsFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + new Date().getTime();
    document.querySelector('body').appendChild(script);
  })
}