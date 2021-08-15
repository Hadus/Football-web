(
  function (w, d, G, contentIDStr) {
    const s_content_box = d.querySelector('#' + contentIDStr);
    Object.assign(G, {
      tableNode_index: s_content_box.querySelector('#s_tab_index'), // 列表的 table
      response: {}, // API返回值
      listData_index: [], // 数据
      clock: null, // 自动刷新定时器
      refreshFreqTime: 80, // 秒
      isFirstTimeInitBet: true, // 第一次进来界面才会initBet
      getFlag_filters: null, // 过滤条件
      filter_ensureNode: s_content_box.querySelector('#s_filter').querySelector('button'),
      audio_alert: new Audio(w.ALERT_AUDIO_URL || ''), // 音频对象
      alertTimes: { // 需要报警的次数
        warning: 0,
        danger: 0
      }, 
      isPlayAudio: false, // 是否播放音频
      filterWithoutAudio: false, // bet 切换触发音频播放
      showTabName: 'index',// 是否为首页
      mesNode: d.querySelector('#s_mes'), // mes box
      mesContentNode: d.querySelector('#s_mesContent'), // mes content
      mesCallback: null, // mes 的回调函数
      isShowAllBet: true, // 是否显示所有已投注比赛
      hideBetList: [], // 已投注的比赛列表
      dialogNode: d.querySelector('#s_dialog'), // mes box
      dialogContentNode: d.querySelector('#s_dialogContent'), // mes box
      dialogData: null, // dialog 的数据
      dragBox: { // 拖拽元素的位置
        node: null,
        left: 0,
        top: 0
      },
    });
    getFootballBD();
    bindFilter(filterAction);
    bindSwitchAudio();
    // bindForceRefresh(); // 绑定强制刷新
    bindShowAllBet(); // 绑定显示所有已投注
    bindCancleMes(); // 弹窗-取消mes
    bindEnsureMes(); // 弹窗-确定mes
    bindCancleDialog(); // 弹窗-取消dialog
    bindEnsureDialog(); // 弹窗-确定dialog
    bindDragBox(); // 绑定拖拽

    // 提示用户选择是否开启预警
    // audioAlert();

    /* 方法：初始化 table */
    function initTable({ nodeStr_index = '' }) {
      G.tableNode_index.innerHTML = '';
      G.tableNode_index.innerHTML = nodeStr_index;
      bindIsBet(); // 绑定每个已投注
      bindCalculator(); // 绑定每个calculator
    }

    /* 方法：生成 list 字符串 */
    function generateListStr(listData_index = [], getFlag_filters) {
      let nodeStr_index = '';
      const no_data = `
        <p class="no-data">No Data.</p>
      `;
      const alert_times_index = {
        warning: 0,
        danger: 0
      };
      listData_index.forEach((ele, index) => {
        // 本剧游戏是否投注
        // -1: 未投注
        // 1: 已投注
        ele.isBet =  G.hideBetList.includes(ele.calcId)? 1 : -1;
        const filterCondition_hasFilter = !getFlag_filters || (getFlag_filters && getFlag_filters(ele));
        const filterCondition_isBet = !G.isShowAllBet && ele.isBet === 1;
        const filterCondition = filterCondition_hasFilter && !filterCondition_isBet;
        // 过滤
        if(filterCondition){
          const tdClass_jzPValue = ele.jzPValue == 0 ? '' : (ele.jzPValue < 0 ? 'green' : 'red');
          let tdClass_totalBenefitPoint = '';
    
          nodeStr_index += `
            <div class="block">
              <div class="top">
                <div class="competitionType">
                  <p>${ele.leagueName}</p>
                  <span></span>
                </div>
                <div class="level">
                  <span>${ele.matchTime}</span>
                </div>
                <div class="teams">
                  <span class="team1">${ele.teamNameH}</span>
                  <span class="icon-vs"></span>
                  <span class="team2">${ele.teamNameA}</span>
                </div>
                <div class="calculator">
                  <button class="primary s-calculator-index" data-index=${index}>告警设置</button>
                </div>
                <div class="is-bet">
                  不关注：
                  <div class="s-is-bet-index switch ${ele.isBet===1?'active': ''}" data-index=${index} data-calc-id=${ele.matchId}>
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
              <div class="bot">
                <table>
                  <tr class="head">
                    <th width="44%" colspan="3">
                      <span>初盘</span>
                    </th>
                    <th width="40%" colspan="3">
                      <span>既盘</span>
                    </th>
                    <th width="16%" colspan="1">报警</th>
                  </tr>
                  <tr>
                    <td class="" width="12%">${ele.crownBDRate&&ele.crownBDRate.initRateH}</td>
                    <td class="" width="15%">${ele.crownBDRate&&ele.crownBDRate.initPoint}</td>
                    <td class="" width="12%">${ele.crownBDRate&&ele.crownBDRate.initRateA}</td>
                    <td class="trend ${ele.changeRateH&&(ele.changeRateH>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate&&ele.crownBDRate.rateH}</td>
                    <td class="trend ${ele.changePoint&&(ele.changePoint>0?'trend-up':'trend-down')}" width="15%">${ele.crownBDRate&&ele.crownBDRate.point}</td>
                    <td class="trend ${ele.changeRateA&&(ele.changeRateA>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate&&ele.crownBDRate.rateA}</td>
                    <td><button class="small ${ele.crownBDRate&&ele.crownBDRate.alarmFlag?'danger':'success'}">趋势</button></td>
                  </tr>
                  <tr>
                    <td>${''}</td>
                    <td>${''}</td>
                    <td>${''}</td>
                    <td>${''}</td>
                    <td>${''}</td>
                    <td>${''}</td>
                    <td>${'2'}</td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }
      })

      G.alertTimes = {
        warning: alert_times_index.warning,
        danger: alert_times_index.danger,
      }

      if(!G.filterWithoutAudio && G.isPlayAudio && G.alertTimes.danger){
        audioPlay(); // 播放音频
      }
      G.filterWithoutAudio = false; // 判断音频是否播放完成，分离 isBet
      return {
        nodeStr_index: nodeStr_index.length?nodeStr_index:no_data,
      };
    }

    /* 方法：绑定筛选事件 */
    function bindFilter(callback) {
      const s_filter = s_content_box.querySelector('#s_filter');
      const s_type = s_filter.querySelector('#s_type')
      const s_team = s_filter.querySelector('#s_team')
      G.filter_ensureNode.addEventListener('click', (e) => {
        callback({
          type: s_type.value.trim(),
          team: s_team.value.trim(),
        });
      })
    }

    /* 方法：筛选处理---点击按钮触发 */
    function filterAction(filter_params = {}) {
      let { type, team } = filter_params;
      const nodeStrList = generateListStr(G.listData_index, (ele) => {
        const typeCondition = !(type && type.trim()) || (ele.leagueName.includes(type));
        const teamCondition = !(team && team.trim()) || (ele.teamNameH.includes(team) || ele.teamNameA.includes(team));
        const filterCondition = typeCondition && teamCondition;

        if (filterCondition) {
          return true;
        }
        return false;
      });

      initTable(nodeStrList);
    }

    /* 方法：refresh start */
    function refreshList_start() {
      G.clock = setInterval(() => {
        getFootballBD();
      }, G.refreshFreqTime * 1000);
    }

    /* 方法：refresh end */
    function refreshList_end() {
      clearInterval(G.clock);
      G.clock = null;
    }

    /* 方法：获取数据 */
    function getFootballBD() {
      changeBlockBetStatus({ // 修改比赛投注状态
        optType: 0,
        hiddenCalcIds: []
      }, () => {
        // api：get 列表数据--静态调用 _file，API 调用 _api
        if (!w.location.host) {
          getFootballBD_file();
        } else {
          getFootballBD_api();
        }
      });
    }

    /* 方法：api 获取数据 */
    function getFootballBD_api() {
      // api：get 列表数据
      let data = {
        needFresh: false,
      };

      // 请求之前先停止 audio
      audioClose();
      const api_url = w.API_URL && w.API_URL.footballBD;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        G.response = res;
        G.listData_index = res.data;
        G.filter_ensureNode.click();
        if (G.isFirstTimeInitBet) {
          refreshList_end();
          refreshList_start();
          // 每次请求重置
          G.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        G.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 获取数据 */
    function getFootballBD_file() {
      // api：get 列表数据
      let data = {
        needFresh: false,
      };

      // 请求之前先停止 audio
      audioClose();
      const api_url = w.API_URL && w.API_URL.footballBD;

      setTimeout(() => {
        G.response = w.mock.FootballBDData;
        G.listData_index = w.mock.FootballBDData.data;
        G.filter_ensureNode.click();
        if (G.isFirstTimeInitBet) {
          refreshList_end();
          refreshList_start();
          // 每次请求重置
          G.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        G.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }, .5 * 1000);
    }

    /* 方法：播放音频 */
    function audioPlay() {
      G.audio_alert.pause();
      G.audio_alert.play();
    }

    function audioClose() {
      G.audio_alert.pause();
    }

    /* 方法：预警弹窗 */
    function audioAlert() {
      G.mesNode.classList.add('show');
      G.mesContentNode.innerText = '是否开启预警提醒？';
      G.mesCallback = () => {
        s_content_box.querySelector('#s_audio_select').click();
      };
    }
    /* 方法：绑定预警提醒开关 */
    function bindSwitchAudio() {
      const s_audio_select = s_content_box.querySelector('#s_audio_select');
      s_audio_select.addEventListener('click', function (e) {
        G.isPlayAudio = !G.isPlayAudio;
        if (G.isPlayAudio) {
          this.classList.add('active');
          audioPlay();
        } else {
          this.classList.remove('active');
          audioClose();
        }
      })
    }

    /* 方法：获取当前网址信息 */
    function getCurrentUrl() {
      return w.location.origin + '/';
    }

    /* 方法：绑定显示所有已投注 */
    function bindShowAllBet() {
      const s_showAllBet = s_content_box.querySelector('#s_showAllBet');
      s_showAllBet.addEventListener('click', function (e) {
        G.isShowAllBet = !G.isShowAllBet;
        if(G.isShowAllBet){
          this.classList.add('active');
        } else{
          this.classList.remove('active');
        }
        G.filterWithoutAudio = true;
        G.filter_ensureNode.click();
      })  
    } 

    /* 方法：绑定单个已投注 */
    function bindIsBet() {
      const s_isBet_list_index = d.querySelectorAll('.s-is-bet-index');
      s_isBet_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          const index = this.dataset['index'];
          const calcId = this.dataset['calcId'];
          G.listData_index[index].isBet  = G.listData_index[index].isBet * -1;
          this.classList.toggle('active'); // 放在 callback 外面有动画过渡
          changeBlockBetStatus({ // 修改比赛投注状态
            optType: G.listData_index[index].isBet,
            hiddenCalcIds: [calcId]
          }, () => {
            G.filterWithoutAudio = true;
            G.filter_ensureNode.click();
          });
        })
      })
    } 

    /* 方法：获取数据 */
    function changeBlockBetStatus(params, callback) {
      // api：get 列表数据--静态调用 _file，API 调用 _api
      if (!w.location.host) {
        changeBlockBetStatus_file(params, callback);
      } else {
        changeBlockBetStatus_api(params, callback);
      }
    }
    
    /* 方法：api 计算 */
    function changeBlockBetStatus_api(params, callback) {
      // optType:
      // 0 查询 只需要userId 后台返回对应user的数据
      // 1 更新 把你传的内容更新进来
      let data = params && {
        userId: '',
        optType: params.optType,
        hiddenCalcIds: params.hiddenCalcIds
      } || {
        userId: '',
        optType: 0,
        hiddenCalcIds: []
      };

      const api_url = w.API_URL && w.API_URL.staticValues;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        G.hideBetList = res.hiddenCalcIds;
        callback();
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
    
    /* 方法：本地 计算 */
    function changeBlockBetStatus_file(params, callback) {
      // api：get 列表数据
      // optType:
      // 0 查询 只需要userId 后台返回对应user的数据
      // 1 更新 转为投注
      // -1 更新 转为不投注
      let data = params && {
        userId: '',
        optType: params.optType,
        hiddenCalcIds: params.hiddenCalcIds
      } || {
        userId: '',
        optType: 0,
        hiddenCalcIds: []
      };

      const api_url = w.API_URL && w.API_URL.staticValues;

      setTimeout(() => {
        G.hideBetList = w.mock.StatusData.hiddenCalcIds;
        callback();
      }, .5 * 1000);
    }

    /* 方法：绑定点击某场比赛的计算 */
    function bindCalculator() {
      const s_calculator_list_index = d.querySelectorAll('.s-calculator-index');
      let showObj = {};
      s_calculator_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = G.listData_index[index];
          G.dialogNode.classList.add('show');
          initDialogContent(showObj);
        })
      })
    } 

    /* 方法：获取数据 */
    function getCalculator(params, outputNodeList) {
      // api：get 列表数据--静态调用 _file，API 调用 _api
      if (!w.location.host) {
        getCalculator_file(params, outputNodeList);
      } else {
        getCalculator_api(params, outputNodeList);
      }
    }

    /* 方法：api 计算 */
    function getCalculator_api(params, outputNodeList) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.calculator;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        console.log("api 请求成功==>");
        console.log(res);
        callback_calculator(res, outputNodeList);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 计算 */
    function getCalculator_file(params, outputNodeList) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.calculator;

      setTimeout(() => {
        console.log("api 请求成功==>");
        callback_calculator(w.mock.calculatorData, outputNodeList);
      }, .5 * 1000);
    }

    /* 方法：获取 dialog 数据用于计算请求 */
    function getDialogDataForCalculator() {
      const inputNodeList = G.dialogContentNode.querySelectorAll('input[data-input-key]');      
      const outputNodeList = G.dialogContentNode.querySelectorAll('input[data-output-key]');
      const inputValueList = {};
      inputNodeList.forEach((ele) => {
        const key = ele.dataset['inputKey']; // 请求的input 框
        if(ele.dataset['inputRes']){ // 稍显复杂且不需用户输入
          inputValueList[key] = ele.dataset['inputRes'].trim(); // hgPValue
        } else{
          inputValueList[key] = ele.value.trim();
        }
      });

      let res_params = {
        jzPayAmount: inputValueList.jzPayAmount,
        isUserCalc: true,
        calcId: G.dialogData.calcId,
        userCalcReq: {}
      };

      if(G.showTabName === 'index'){
        // 欧赔 或者 亚赔
        if(G.dialogData.hgPDisplay == ''){ // 欧赔
          console.log('欧赔')
          res_params.userCalcReq = {
            crownERate: {
              rateD: inputValueList.hgPValue,
              rateL: inputValueList.hgLRate,
              rateW: inputValueList.hgWRate
            }
          };
        } else{ // 亚赔
          console.log('亚赔')
          res_params.userCalcReq = {
            crownARate: {
              point: inputValueList.hgPValue, // hgPValue
              rateA: inputValueList.hgLRate,
              rateH: inputValueList.hgWRate
            }
          };
        }
        // 让球 或者 胜平负
        if(inputValueList.jzPValue == '0' || inputValueList.jzPValue == 0){ // 胜平负
          console.log('胜平负');
          res_params.userCalcReq.jzRate = {
            hasJzDate: true,
            hasJzRDate: false,
            point: Number(inputValueList.jzPValue) + '', // 去掉 + 号
            rateD: inputValueList.jzDRate,
            rateL: inputValueList.jzLRate,
            rateW: inputValueList.jzWRate
          }
        } else{ // 让球
          console.log('让球')
          res_params.userCalcReq.jzRate = {
            hasJzDate: false,
            hasJzRDate: true,
            point: Number(inputValueList.jzPValue) + '', // 去掉 + 号
            rateRD: inputValueList.jzDRate,
            rateRL: inputValueList.jzLRate,
            rateRW: inputValueList.jzWRate,
          }
        }
      } else if(G.showTabName === 'ttg'){
        res_params.userCalcReq = {
          crownBSRate: {
            point: inputValueList.hgPValue, // hgPValue
            rateBig: inputValueList.hgWRate,
            rateSmall: inputValueList.hgLRate
          },
          jzBSRate: {
            s0: inputValueList.jzS0Rate,
            s1: inputValueList.jzS1Rate,
            s2: inputValueList.jzS2Rate,
            s3: inputValueList.jzS3Rate,
          }
        };
      }
      console.log(res_params);
      return {
        res_params,
        outputNodeList,
      }
    }

    /* 方法：赔率计算弹窗输入框校验 */  
    function validCalculatorInput() {
      const invaildInputObj = {
        length: 0
      };
      const inputNodeList = G.dialogContentNode.querySelectorAll('input[data-input-key]');      
      inputNodeList.forEach((ele) => {
        // ele.classList.remove('danger');
        if(ele.dataset['inputKey'] === 'jzPayAmount' && !ele.value.trim()){
          invaildInputObj['jzPayAmount'] = ele;
          invaildInputObj['length']++;
          // ele.classList.add('danger');
        }
      });
      return invaildInputObj;
    }

    /* 方法：calculator 接口数据请求完成后的 callback */
    function callback_calculator(res, outputNodeList) {
      const keyList = {};
      outputNodeList.forEach((ele) => {
        const key = ele.dataset['outputKey'];
        keyList[key] = ele;
      })
      if(G.showTabName === 'index'){
        const ele = res.data[0];
        keyList['totalBenefitPoint'].value = ele.totalBenefitPoint;
        keyList['jzWPayAmount'].value = ele.jzWPayAmount>0? ele.jzWPayAmount : '';
        keyList['jzDPayAmount'].value = ele.jzDPayAmount>0? ele.jzDPayAmount : '';
        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['hgDPayAmount'].value = ele.hgDPayAmount>0? ele.hgDPayAmount : '';
        keyList['hgLPayAmount'].value = ele.hgLPayAmount>0? ele.hgLPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
      }
    }
    /* 方法：强制刷新数据 */  
    function bindForceRefresh() {
      s_content_box.querySelector('#s_forceRefresh').addEventListener('click',function (e) {
        G.mesNode.classList.add('show');
        G.mesContentNode.innerText = '确定强制刷新后台数据吗？';
        G.mesCallback = forceRefreshAction;
      })
    }

    /* 方法：强制刷新处理---点击按钮触发 */
    function forceRefreshAction(params) {
      console.log('发请求');
      getFootballBD({
        needFresh: true
      });
    }

    /* 方法：message 取消 */  
    function bindCancleMes() {
      d.querySelector('#s_cancelMes').addEventListener('click',function (e) {
        G.mesNode.classList.remove('show');
      })
    }

    /* 方法：message 确定 */  
    function bindEnsureMes() {
      d.querySelector('#s_ensureMes').addEventListener('click',function (e) {
        G.mesNode.classList.remove('show');
        G.mesCallback();
        G.mesCallback = null; // 执行完置空
      })
    }

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        G.dialogNode.classList.remove('show');
        G.dialogContentNode.innerHTML = '';
        G.dialogData = null;
      })
    }

    /* 方法：dialog 确定 */  
    function bindEnsureDialog() {
      d.querySelector('#s_ensureDialog').addEventListener('click',function (e) {
        const invaildInputObj = validCalculatorInput();
        if(invaildInputObj.length){
          alert('请输入投注金额！');
          return;
        };
        const {res_params, outputNodeList} = getDialogDataForCalculator();
        getCalculator(res_params, outputNodeList);
      })
    }

    function initDialogContent(obj) {
      G.dialogContentNode.innerHTML = '';
      const ele = G.dialogData = Object.assign({}, obj);
      let nodeStr = '';
      if(G.showTabName === 'index'){
        nodeStr += `
          <div>
            <label>本场比赛的目标赔率：
              <input class="big" type="number" value="2.00">
            </label>
          </div>
        `;
      }

      G.dialogContentNode.innerHTML = nodeStr;
    }

    /* 方法：拖拽 */
    function bindDragBox() {
      const dragList = d.querySelectorAll('.s-drag'); 
      dragList.forEach((ele) => {
        const box = ele.querySelector('.s-box');
        const title = ele.querySelector('.header-box');
        const titleBg = title.style.backgroundColor;
        const dragW = d.body.clientWidth;
        const dragH = d.body.clientHeight;

        let boxStartX = 0;
        let boxStartY = 0;

        title.style.cursor = 'move';
        // 开始拖拽
        title.addEventListener('mousedown', function (e) {
          const boxW = box.offsetWidth;
          G.dragBox = {
            node: box,
            left: box.offsetLeft,
            top: box.offsetTop
          };
          const maxLeft = Number(dragW - boxW);
          const maxTop = Number(dragH);

          boxStartX = box.offsetLeft;
          boxStartY = box.offsetTop;

          const x = e.pageX - boxStartX;
          const y = e.pageY - boxStartY;
          d.addEventListener('mousemove', move)
          d.addEventListener('mouseup', function () {
            d.removeEventListener('mousemove',move);
            title.style.background = titleBg;
            d.body.classList.remove('no-select');
          })

          function move(e) {
            title.style.background = '#fafafa';
            d.body.classList.add('no-select');
            let nowX = e.pageX - x;
            let nowY = e.pageY - y;
            nowX = nowX <= 0 ? 0 : nowX;
            nowY = nowY <= 0 ? 0 : nowY;

            nowX = nowX > maxLeft ? maxLeft : nowX;
            nowY = nowY > maxTop ? maxTop : nowY;
            
            box.style.left = nowX + 'px';
            box.style.top = nowY + 'px';
          }
        })
      })
    }

    /* 方法：恢复拖拽 */
    function resetDrag() {
      G.dragBox.node && (G.dragBox.node.style.left = G.dragBox.left + 'px');
      G.dragBox.node && (G.dragBox.node.style.top = G.dragBox.top + 'px');
    }
  }
)(window, document, window.BD, 's_content_BD');



