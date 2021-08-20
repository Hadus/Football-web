(
  function (w, d) {
    w.onload = function () {
      if (!w.location.host) {
        initJSON();
      }
      initJS();
      init();
    }

    /* 方法：初始化 JSON */
    function initJSON() {
      const dataFileList = [
        "../lib/data/LoginData.js",
      ]
      dataFileList.forEach((ele) => {
        const script = d.createElement('script');
        script.src = ele + '?' + new Date().getTime();
        d.querySelector('body').appendChild(script);
      })
    }

    /* 方法：初始化 JS */
    function initJS() {
      const jsFileList = [
        '../JS/api.js',
        '../JS/utils.js',
      ];
    
      jsFileList.forEach((ele) => {
        const script = d.createElement('script');
        script.src = ele + '?' + new Date().getTime();
        d.querySelector('body').appendChild(script);
      })
    }
    
    /* 方法：初始化 login */
    function init() {
      bindBackGround(); // 绑定背景
      initLogin();
    }

    /* 方法：初始化 login */
    function initLogin() {
      const s_username = d.querySelector('#s_username');
      const s_password = d.querySelector('#s_password');
      const s_login = d.querySelector('#s_login');
      // username
      s_username.addEventListener('focus', function (e) {
        this.offsetParent.classList.add('active');
      })
      s_username.addEventListener('blur', function (e) {
        this.offsetParent.classList.remove('active');
      })
      // password
      s_password.addEventListener('focus', function (e) {
        this.offsetParent.classList.add('active');
      })
      s_password.addEventListener('blur', function (e) {
        this.offsetParent.classList.remove('active');
      })
      // login
      s_login.addEventListener('click', function (e) {
        const username = s_username.value;
        const password = s_password.value;
        validLogin(username, password);
      })
    }
    
    /* 方法：登录校验 */
    function validLogin(username, password) {
      if(!username || username.trim() == ''){
        alert('请输入用户名！');
        return;
      }

      if(!password || password.trim() == ''){
        alert('请输入密码！');
        return;
      }

      login();
    }
  
    /* 方法：登录 */
    function login(params) {
      console.log('login...');
      if (!w.location.host) {
        login_file(params);
      } else {
        login_api(params);
      }
    }

    /* 方法：api 登录 */
    function login_api(params) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.login;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        console.log("api 请求成功==>");
        console.log(res);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 登录 */
    function login_file(params) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.login;

      setTimeout(() => {
        console.log("api 请求成功==>");
        console.log(w.loginResponse);
        w.setSession('token', 'pass');
        w.location.href = '../index.html';
      }, .5 * 1000);
    }

    /* 方法：切换背景图 */
    function bindBackGround() {
      const backgroundRefreshTime = 5;
      const maxIndex = 5;
      const backgroundImageUrlStart = '../lib/images/background_';

      const sliderLeft = document.body.clientWidth;

      const s_slider_box = d.querySelector('#s_slider_box');
      const lisNode = [];
      const stepTime = 30;

      lisInit();
      autoPlay();
      
      /* 方法：初始化 */
      function lisInit() {
        for(let i = 0; i < maxIndex; i++) {
          lisNode[i] = d.createElement('li');
          i && (lisNode[i].style.left = sliderLeft + 'px');
          const img = d.createElement('img');
          img.src = backgroundImageUrlStart + ((i + 1).toString().padStart(2, '0')) + '.jpeg';
          lisNode[i].appendChild(img);
          s_slider_box.appendChild(lisNode[i]);
        }
      }

      /* 方法：初始化 */
      function autoPlay() {
        w.index_li = 0;
        setInterval(playOnce, backgroundRefreshTime * 1000);
      }

      /* 方法：初始化 */
      function playOnce() {
        animate(lisNode[w.index_li], {
          left: -sliderLeft
        });
        w.index_li++;
        w.index_li = w.index_li >= lisNode.length ? 0 : w.index_li;
        lisNode[w.index_li].style.left = sliderLeft + "px"; //立马让下一张跑到右边去
        animate(lisNode[w.index_li], {
          left: 0
        });
      }

      /* 方法：动画 */
      function animate(node, targetAttrJson) {
        clearInterval(node.timer);
        node.timer = setInterval(function() {
          var flag = true;
          for (let attr in targetAttrJson) {
            const currentAttr = parseInt(getCurrent(node, attr));
            const targetAttr = parseInt(targetAttrJson[attr]);
            let step = (targetAttr - currentAttr) / 15;
            step = step > 0 ? Math.ceil(step) : Math.floor(step);
            node.style[attr] = currentAttr + step + "px";
            //判断current和target是否相等
            if (currentAttr != targetAttr) {
                flag = false;
            }
          }
          if (flag) {
            clearInterval(node.timer);
          }
        }, stepTime);
      }

      /* 方法：获取当前元素属性 */
      function getCurrent(node, attr) {
        if (window.getComputedStyle) {
          return window.getComputedStyle(node, null)[attr];
        } else {
          return node.currentStyle[attr];
        }
      }
    }

  }
)(window, document);