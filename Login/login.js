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

      bindBackGround(); // 绑定背景
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

    function bindBackGround() {
      let backgroundImageUrl = '../lib/images/background_';
      const index = '02';
      backgroundImageUrl = backgroundImageUrl + index + '.jpeg';
      d.body.style.backgroundImage = backgroundImageUrl;
    }
  }
)(window, document);