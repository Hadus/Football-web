(
  function (w, d) {
    Object.assign(w, {...w.config}, {
      tableNode_index: d.querySelector('#s_table_index'), // 列表的 table
      tableNode_ttg: d.querySelector('#s_table_ttg'), // 列表的 table
      response: {}, // API返回值
      listData_index: [], // 数据
      listData_ttg: [], // 数据
      clock: null, // 自动刷新定时器
      isFirstTimeInitBet: true, // 第一次进来界面才会initBet
      getFlag_filters: null, // 过滤条件
      filter_ensureNode: d.querySelector('#s_filter').querySelector('button'),
      audio_alert: new Audio(w.ALERT_AUDIO_URL || ''), // 音频对象
      alertTimes: { // 需要报警的次数
        warning: 0,
        danger: 0
      }, 
      isPlayAudio: false, // 是否播放音频
      filterWithoutAudio: false, // bet 切换触发音频播放
      showTableName: 'index',// 是否为首页
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

    getData();
    bindFilter(filterAction);
    bindSwitchAudio();
    bindTabs();
    bindShowAllBet(); // 绑定显示所有已投注
    bindCancleMes(); // 弹窗-取消mes
    bindEnsureMes(); // 弹窗-确定mes
    bindCancleDialog(); // 弹窗-取消dialog
    bindEnsureDialog(); // 弹窗-确定dialog
    bindDragBox(); // 绑定拖拽

    // 提示用户选择是否开启预警
    // audioAlert();

    /* 方法：初始化 table */
    function initTable({ nodeStr_index = '', nodeStr_ttg = '' }) {
      tableNode_index.innerHTML = '';
      tableNode_ttg.innerHTML = '';
      tableNode_index.innerHTML = nodeStr_index;
      tableNode_ttg.innerHTML = nodeStr_ttg;
      bindIsBet(); // 绑定每个已投注
      bindCalculator(); // 绑定每个calculator
    }

    /* 方法：生成 list 字符串 */
    function generateListStr(listData_index = [], listData_ttg = [], getFlag_filters) {
      let nodeStr_index = '';
      let nodeStr_ttg = '';
      const no_data = `
        <p class="no-data">No Data.</p>
      `;
      const alert_times_index = {
        warning: 0,
        danger: 0
      };
      const alert_times_ttg = {
        warning: 0,
        danger: 0
      };
      listData_index.forEach((ele, index) => {
        // 本剧游戏是否投注
        // -1: 未投注
        // 1: 已投注
        ele.isBet =  w.hideBetList.includes(ele.calcId)? 1 : -1;
        const filterCondition_hasFilter = !getFlag_filters || (getFlag_filters && getFlag_filters(ele));
        const filterCondition_isBet = !w.isShowAllBet && ele.isBet === 1;
        const filterCondition = filterCondition_hasFilter && !filterCondition_isBet;
        // 过滤
        if(filterCondition){
          if(!ele.crownBDRate){
            return;
          }
          let tdCLass_alert_level01 = tdCLass_alert_level02 = '';
          switch(ele.crownBDRate.alarmFlag){
            case 0:
              tdCLass_alert_level01 = '';
              tdCLass_alert_level02 = '';
              break;
            case 1:
              tdCLass_alert_level01 = 'tips yellow flash';
              tdCLass_alert_level02 = '';
              break;
            case 2:
              tdCLass_alert_level01 = '';
              tdCLass_alert_level02 = 'tips red';
              break;
          }
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
                    <td class="" width="12%">${ele.crownBDRate.initRateH}</td>
                    <td class="" width="15%">${ele.crownBDRate.initPoint}</td>
                    <td class="" width="12%">${ele.crownBDRate.initRateA}</td>
                    <td class="trend ${ele.crownBDRate.changeRateH&&(ele.crownBDRate.changeRateH>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate.rateH}</td>
                    <td class="trend ${ele.crownBDRate.changePoint&&(ele.crownBDRate.changePoint>0?'trend-up':'trend-down')}" width="15%">${ele.crownBDRate.point}</td>
                    <td class="trend ${ele.crownBDRate.changeRateA&&(ele.crownBDRate.changeRateA>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate.rateA}</td>
                    <td class="${tdCLass_alert_level01}"> </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="tips ${ele.crownBDRate.alarmH?'red flash':''}">${ele.crownBDRate.hasUserSettingH?ele.crownBDRate.userRateH:''}</td>
                    <td class="tips ${ele.crownBDRate.alarmPoint?'red flash':''}">${ele.crownBDRate.hasUserSettingPoint?ele.crownBDRate.userPoint:''}</td>
                    <td class="tips ${ele.crownBDRate.alarmA?'red flash':''}">${ele.crownBDRate.hasUserSettingA?ele.crownBDRate.userRateA:''}</td>
                    <td class="${tdCLass_alert_level02}"> </td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }
      })
      listData_ttg.forEach((ele, index) => {
        // 本剧游戏是否投注
        // -1: 未投注
        // 1: 已投注
        ele.isBet =  w.hideBetList.includes(ele.calcId)? 1 : -1;
        const filterCondition_hasFilter = !getFlag_filters || (getFlag_filters && getFlag_filters(ele));
        const filterCondition_isBet = !w.isShowAllBet && ele.isBet === 1;
        const filterCondition = filterCondition_hasFilter && !filterCondition_isBet;
        // 过滤
        
        if(filterCondition){
          if(!ele.crownBDRate){
            return;
          }
          let tdCLass_alert_level01 = tdCLass_alert_level02 = '';
          switch(ele.crownBDRate.alarmFlag){
            case 0:
              tdCLass_alert_level01 = '';
              tdCLass_alert_level02 = '';
              break;
            case 1:
              tdCLass_alert_level01 = 'tips yellow flash';
              tdCLass_alert_level02 = '';
              break;
            case 2:
              tdCLass_alert_level01 = '';
              tdCLass_alert_level02 = 'tips yellow';
              break;
          }
          nodeStr_ttg += `
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
                    <td class="" width="12%">${ele.crownBDRate.initRateH}</td>
                    <td class="" width="15%">${ele.crownBDRate.initPoint}</td>
                    <td class="" width="12%">${ele.crownBDRate.initRateA}</td>
                    <td class="trend ${ele.crownBDRate.changeRateH&&(ele.crownBDRate.changeRateH>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate.rateH}</td>
                    <td class="trend ${ele.crownBDRate.changePoint&&(ele.crownBDRate.changePoint>0?'trend-up':'trend-down')}" width="15%">${ele.crownBDRate.point}</td>
                    <td class="trend ${ele.crownBDRate.changeRateA&&(ele.crownBDRate.changeRateA>0?'trend-up':'trend-down')}" width="12%">${ele.crownBDRate.rateA}</td>
                    <td class="${tdCLass_alert_level01}"> </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="tips ${ele.crownBDRate.alarmH?'red flash':''}">${ele.crownBDRate.hasUserSettingH?ele.crownBDRate.userRateH:''}</td>
                    <td class="tips ${ele.crownBDRate.alarmPoint?'red flash':''}">${ele.crownBDRate.hasUserSettingPoint?ele.crownBDRate.userPoint:''}</td>
                    <td class="tips ${ele.crownBDRate.alarmA?'red flash':''}">${ele.crownBDRate.hasUserSettingA?ele.crownBDRate.userRateA:''}</td>
                    <td class="${tdCLass_alert_level02}"> </td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }

      })

      w.alertTimes = {
        warning: alert_times_index.warning + alert_times_ttg.warning,
        danger: alert_times_index.danger + alert_times_ttg.danger,
      }

      const s_tabs = d.querySelector('#s_tabsBox');
      const s_lis = s_tabs.querySelectorAll('li');
      s_lis[0].classList.remove('tips','red','yellow');
      s_lis[1].classList.remove('tips','red','yellow');

      if(alert_times_index.danger > 0){
        s_lis[0].classList.add('tips','red');
      } else if(alert_times_index.warning > 0){
        s_lis[0].classList.add('tips','yellow');
      }
      if(alert_times_ttg.danger > 0){
        s_lis[1].classList.add('tips','red');
      } else if(alert_times_ttg.warning > 0){
        s_lis[1].classList.add('tips','yellow');
      }
      if(!w.filterWithoutAudio && w.isPlayAudio && w.alertTimes.danger){
        audioPlay(); // 播放音频
      }
      w.filterWithoutAudio = false; // 判断音频是否播放完成，分离 isBet
      return {
        nodeStr_index: nodeStr_index.length?nodeStr_index:no_data,
        nodeStr_ttg: nodeStr_ttg.length?nodeStr_ttg:no_data
      };
    }

    /* 方法：绑定筛选事件 */
    function bindFilter(callback) {
      const s_filter = d.querySelector('#s_filter');
      const s_type = s_filter.querySelector('#s_type')
      const s_team = s_filter.querySelector('#s_team')
      w.filter_ensureNode.addEventListener('click', (e) => {
        callback({
          type: s_type.value.trim(),
          team: s_team.value.trim(),
        });
      })
    }

    /* 方法：筛选处理---点击按钮触发 */
    function filterAction(filter_params = {}) {
      let { type, team } = filter_params;
      const nodeStrList = generateListStr(listData_index, listData_ttg, (ele) => {
        const typeCondition = !(type && type.trim()) || (ele.competitionType.includes(type));
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
    function refreshList_start(params) {
      clock = setInterval(() => {
        getData(params);
      }, refreshFreqTime * 1000);
    }

    /* 方法：refresh end */
    function refreshList_end() {
      clearInterval(clock);
      clock = null;
    }

    /* 方法：获取数据 */
    function getData(bet_params) {
      changeBlockBetStatus({ // 修改比赛投注状态
        optType: 0,
        hiddenCalcIds: []
      }, () => {
        // api：get 列表数据--静态调用 _file，API 调用 _api
        if (!w.location.host) {
          getData_file(bet_params);
        } else {
          getData_api(bet_params);
        }
      });
    }

    /* 方法：api 获取数据 */
    function getData_api(bet_params) {
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
        w.response = res;
        w.listData_index = res.data;
        w.listData_ttg = res.dataBS;
        w.filter_ensureNode.click();
        if (w.isFirstTimeInitBet) {
          const bet_params = {
            
          };
          refreshList_end();
          refreshList_start(bet_params);
          // 每次请求重置
          w.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        w.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 获取数据 */
    function getData_file(bet_params) {
      // api：get 列表数据
      let data = {
        needFresh: false,
      };

      // 请求之前先停止 audio
      audioClose();
      const api_url = w.API_URL && w.API_URL.footballBD;

      setTimeout(() => {
        w.response = w.mock.FootballBDData;
        w.listData_index = w.mock.FootballBDData.data;
        w.listData_ttg = w.mock.FootballBDData.dataBS;
        w.filter_ensureNode.click();
        if (w.isFirstTimeInitBet) {
          const bet_params = {
            
          };
          refreshList_end();
          refreshList_start(bet_params);
          // 每次请求重置
          w.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        w.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }, .5 * 1000);
    }

    /* 方法：播放音频 */
    function audioPlay() {
      w.audio_alert.pause();
      w.audio_alert.play();
    }

    function audioClose() {
      w.audio_alert.pause();
    }

    /* 方法：预警弹窗 */
    function audioAlert() {
      w.mesNode.classList.add('show');
      w.mesContentNode.innerText = '是否开启告警提醒？';
      w.mesCallback = () => {
        d.querySelector('#s_audio_select').click();
      };
      pageScroll(false);
    }
    /* 方法：绑定预警提醒开关 */
    function bindSwitchAudio() {
      const s_audio_select = d.querySelector('#s_audio_select');
      s_audio_select.addEventListener('click', function (e) {
        w.isPlayAudio = !w.isPlayAudio;
        if (isPlayAudio) {
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

    /* 方法：绑定 tabs */
    function bindTabs() {
      const s_tab_List = d.querySelectorAll('#s_tabsBox>li');
      const s_tabContent_list = d.querySelectorAll('div>.table');
      s_tab_List.forEach((ele, index) => {
        ele.addEventListener('click', function (e) {
          const tabName = ele.dataset['tab'];
          if(tabName === w.showTabName){
            return false;
          }
          s_tabContent_list.forEach((ele_inner, index_inner) => {
            ele_inner.classList.remove('show');
            s_tab_List[index_inner].classList.remove('active');
          })
          s_tabContent_list[index].classList.add('show');
          ele.classList.add('active');
          w.showTabName = tabName;
        })
      })
    }

    /* 方法：绑定显示所有已投注 */
    function bindShowAllBet() {
      const s_showAllBet = d.querySelector('#s_showAllBet');
      s_showAllBet.addEventListener('click', function (e) {
        w.isShowAllBet = !w.isShowAllBet;
        if(w.isShowAllBet){
          this.classList.add('active');
        } else{
          this.classList.remove('active');
        }
        w.filterWithoutAudio = true;
        w.filter_ensureNode.click();
      })  
    } 

    /* 方法：绑定单个已投注 */
    function bindIsBet() {
      const s_isBet_list_index = d.querySelectorAll('.s-is-bet-index');
      const s_isBet_list_ttg = d.querySelectorAll('.s-is-bet-ttg');
      s_isBet_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          const index = this.dataset['index'];
          const calcId = this.dataset['calcId'];
          listData_index[index].isBet  = listData_index[index].isBet * -1;
          this.classList.toggle('active'); // 放在 callback 外面有动画过渡
          changeBlockBetStatus({ // 修改比赛投注状态
            optType: listData_index[index].isBet,
            hiddenCalcIds: [calcId]
          }, () => {
            w.filterWithoutAudio = true;
            w.filter_ensureNode.click();
          });
        })
      })

      s_isBet_list_ttg.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          const index = this.dataset['index'];
          const calcId = this.dataset['calcId'];
          listData_ttg[index].isBet  = listData_ttg[index].isBet * -1;
          this.classList.toggle('active');  // 放在 callback 外面有动画过渡
          changeBlockBetStatus({ // 修改比赛投注状态
            optType: listData_ttg[index].isBet,
            hiddenCalcIds: [calcId]
          }, () => {
            w.filter_ensureNode.click();
            w.filterWithoutAudio = true;
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
        w.hideBetList = res.hiddenCalcIds;
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
        w.hideBetList = w.mock.StatusData.hiddenCalcIds;
        callback();
      }, .5 * 1000);
    }

    /* 方法：绑定点击某场比赛的计算 */
    function bindCalculator() {
      const s_calculator_list_index = d.querySelectorAll('.s-calculator-index');
      const s_calculator_list_ttg = d.querySelectorAll('.s-calculator-ttg');
      let showObj = {};
      s_calculator_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = listData_index[index];
          dialogNode.classList.add('show');
          initDialogContent(showObj);
          d.querySelector('html').classList.add('no-scroll');
          d.querySelector('body').classList.add('no-scroll');
        })
      })

      s_calculator_list_ttg.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = listData_ttg[index];
          dialogNode.classList.add('show');
          initDialogContent(showObj);
          d.querySelector('html').classList.add('no-scroll');
          d.querySelector('body').classList.add('no-scroll');
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
    function getCalculator_api(params) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.BDAddAlarm;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        console.log("api 请求成功==>");
        console.log(res);
        callback_calculator(res);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 计算 */
    function getCalculator_file(params) {
      let data = params || {};

      const api_url = w.API_URL && w.API_URL.BDAddAlarm;

      setTimeout(() => {
        console.log("api 请求成功==>");
        callback_calculator(w.mock.BDAddAlarmData);
      }, .5 * 1000);
    }

    /* 方法：获取 dialog 数据用于计算请求 */
    function getDialogDataForCalculator() {
      const inputNodeList = dialogContentNode.querySelectorAll('input[data-input-key]');      
      const outputNodeList = dialogContentNode.querySelectorAll('input[data-output-key]');
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
        calcId: w.dialogData.calcId,
        userCalcReq: {}
      };

      if(showTableName === 'index'){
        // 欧赔 或者 亚赔
        if(w.dialogData.hgPDisplay == ''){ // 欧赔
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
              rateD: inputValueList.hgDRate,
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
      } else if(showTableName === 'ttg'){
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
      const inputNodeList = dialogContentNode.querySelectorAll('input[data-input-key]');      
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
      if(w.showTableName === 'index'){
        const ele = res.data[0];
        keyList['totalBenefitPoint'].value = ele.totalBenefitPoint;
        keyList['jzWPayAmount'].value = ele.jzWPayAmount>0? ele.jzWPayAmount : '';
        keyList['jzDPayAmount'].value = ele.jzDPayAmount>0? ele.jzDPayAmount : '';
        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['hgDPayAmount'].value = ele.hgDPayAmount>0? ele.hgDPayAmount : '';
        keyList['hgLPayAmount'].value = ele.hgLPayAmount>0? ele.hgLPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
      } else if(w.showTableName === 'ttg'){
        const ele = res.ttgData[0];
        keyList['totalBenefitPoint'].value = ele.totalBenefitPoint;
        keyList['jzS0PayAmount'].value = ele.jzS0PayAmount>0? ele.jzS0PayAmount : '';
        keyList['jzS1PayAmount'].value = ele.jzS1PayAmount>0? ele.jzS1PayAmount : '';
        keyList['jzS2PayAmount'].value = ele.jzS2PayAmount>0? ele.jzS2PayAmount : '';
        keyList['jzS3PayAmount'].value = ele.jzS3PayAmount>0? ele.jzS3PayAmount : '';
        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
        keyList['jzS0BenefitAmount'].value = ele.jzS0BenefitAmount>0? ele.jzS0BenefitAmount : '';
        keyList['jzS1BenefitAmount'].value = ele.jzS1BenefitAmount>0? ele.jzS1BenefitAmount : '';
        keyList['jzS2BenefitAmount'].value = ele.jzS2BenefitAmount>0? ele.jzS2BenefitAmount : '';
        keyList['hgWBenefitAmount'].value = ele.hgWBenefitAmount>0? ele.hgWBenefitAmount : '';
      }
    }

    /* 方法：message 取消 */  
    function bindCancleMes() {
      d.querySelector('#s_cancelMes').addEventListener('click',function (e) {
        w.mesNode.classList.remove('show');
        pageScroll(true);
      })
    }

    /* 方法：message 确定 */  
    function bindEnsureMes() {
      d.querySelector('#s_ensureMes').addEventListener('click',function (e) {
        w.mesNode.classList.remove('show');
        w.mesCallback();
        w.mesCallback = null; // 执行完置空
        pageScroll(true);
      })
    }

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        w.dialogNode.classList.remove('show');
        dialogContentNode.innerHTML = '';
        w.dialogData = null;
        pageScroll(true);
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
      dialogContentNode.innerHTML = '';
      const ele = w.dialogData = Object.assign({}, obj);
      let nodeStr = '';
      const userRateH = ele.crownBDRate.hasUserSettingH ? ele.crownBDRate.userRateH : '';
      const userPoint = ele.crownBDRate.hasUserSettingPoint ? ele.crownBDRate.userPoint : '';
      const userRateA = ele.crownBDRate.hasUserSettingA ? ele.crownBDRate.userRateA : '';
      if(showTableName === 'index'){
        nodeStr += `
          <div>
            <p>当前赔率：</p>
            <p class="label-box">
              <label>主队（<b><i>${ele.teamNameH}</i></b>）：
                <input class="big" disabled type="number" value="${ele.crownBDRate.rateH}">
              </label>
              <label>point：
                <input class="big" disabled type="number" value="${ele.crownBDRate.point}">
              </label>
              <label>客队（<b><i>${ele.teamNameA}</i></b>）：
                <input class="big" disabled type="number" value="${ele.crownBDRate.rateA}">
              </label>
            <p>
          </div>
          <div>
            <p>当前赔率：</p>
            <p class="label-box">
              <label>主队（<b><i>${ele.teamNameH}</i></b>）：
                <input data-input-key="test1" data-input-valid="${ele.crownBDRate.rateH}" class="big" type="number" value="${userRateH}">
              </label>
              <label>point：
                <input class="big" type="number" value="${userPoint}">
              </label>
              <label>客队（<b><i>${ele.teamNameA}</i></b>）：
                <input data-input-key="test2" data-input-valid="${ele.crownBDRate.rateA}" class="big" type="number" alue="${userRateA}">
              </label>
            <p>
          </div>
        `;
      } else if(showTableName === 'ttg'){
        nodeStr += `
          <div>
            <p>当前赔率：</p>
            <p class="label-box">
              <label>主队（<b><i>${ele.teamNameH}</i></b>）：
                <input class="big" disabled type="number" value="${ele.crownBDRate.rateH}">
              </label>
              <label>point：
                <input class="big" disabled type="number" value="${ele.crownBDRate.point}">
              </label>
              <label>客队（<b><i>${ele.teamNameA}</i></b>）：
                <input class="big" disabled type="number" value="${ele.crownBDRate.rateA}">
              </label>
            <p>
          </div>
          <div>
            <p>当前赔率：</p>
            <p class="label-box">
              <label>主队（<b><i>${ele.teamNameH}</i></b>）：
                <input data-input-key="test1" data-input-valid="${ele.crownBDRate.rateH}" class="big" type="number" value="${userRateH}">
              </label>
              <label>point：
                <input class="big" type="number" value="${userPoint}">
              </label>
              <label>客队（<b><i>${ele.teamNameA}</i></b>）：
                <input data-input-key="test2" data-input-valid="${ele.crownBDRate.rateA}" class="big" type="number" alue="${userRateA}">
              </label>
            <p>
          </div>
        `;
      }

      dialogContentNode.innerHTML = nodeStr;
    }

    /* 方法：页面是否可以滚动 */
    function pageScroll(flag = true) {
      if(flag){
        d.querySelector('html').classList.remove('no-scroll');
        d.querySelector('body').classList.remove('no-scroll');
        resetDrag(); // 页面可以滚动时候reset
      } else{
        d.querySelector('html').classList.add('no-scroll');
        d.querySelector('body').classList.add('no-scroll');
      }
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
          w.dragBox = {
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
      w.dragBox.node && (w.dragBox.node.style.left = w.dragBox.left + 'px');
      w.dragBox.node && (w.dragBox.node.style.top = w.dragBox.top + 'px');
    }
  }
)(window, document);



