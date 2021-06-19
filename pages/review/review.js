import {CompleteRequest} from "../../network/complete";
import {QuestionnaireRequest} from "../../network/questionnaire";
import {parseQueryString} from "../../network/base";
import {MessageBox} from "../../utils/messageBox";
import {AnswerRequest} from "../../network/answer";
const app = getApp();

Page({
  data: {
    showCheckSecretInput: true,
    showCompleteForm: false,
    topInfo: "loading~",
    qid: null,
    currentSecretKey: "",
    questionnaireData: {},
    problems: [],
    basicInfo: {},
    problemResults: [],
    action: 'complete',
    
    tableConfig: {
      columnWidths: [],
      border: true
    },
    rows:[],
    keys:[]
  },
  getCondition(){
    console.log("get condition")
    var qid = this.data.qid;
    CompleteRequest.getCondition(qid)
      .then(res => {
        if(res.data.loginControl && !app.globalData.userInfo){
          wx.redirectTo({
            url: '/pages/setUserInfo/setUserInfo?qid='+qid
          })
        }
        let isSecret = res.data.isSecret;
        let condition = true;
        if (this.data.action == 'complete'){
          condition = res.data.condition;
        }
        this.setData({
          showCheckSecretInput: isSecret,
          showCompleteForm: !isSecret,
          topInfo: this.checkTopInfo(condition, isSecret),
        });
        if (condition && !isSecret) {
          this.checkSecretKey();
        }
      })
  },
  onLoad(options) {
    if ('q' in options){
      var q = decodeURIComponent(options.q)
      console.log(q)
      var params = parseQueryString(q);
      if ('qid' in params){
        this.setData({qid: params.qid})
      }
    }else{
      this.setData({qid: options.qid})
    }
    if ('action' in options){
      this.setData({action: options.action})
    }else{
      this.setData({action: 'complete'})
    }
    if ('secretKey' in options){
      this.setData({currentSecretKey: options.secretKey});
    }
    if (app.globalData.isLogin){
      this.getCondition();
    }else{
      console.log("no token")
      app.userInfoReadyCallback = this.getCondition;
    }
  },

  checkTopInfo(condition, isSecret) {
    if (!condition) return "这个问卷已经过期啦~";
    if (isSecret) return "这个问卷被加密了";
    return ""
  },

  checkSecretKey() {
    let key = this.data.currentSecretKey || "key";
    if (!key || key === "") {
      console.log("输入不得为空");
    }
    AnswerRequest.getMyResult(this.data.qid, key, app.globalData.token)
      .then(res => {
        console.log('getMyResult', res)
        this.setData({
          topInfo: "评分：" + res.data.score,
          showCheckSecretInput: false,
          showCompleteForm: true,
          problems: res.data.problems,
          basicInfo: res.data.basicInfo
        });
        
        if(res.data.groups.length){
          this.initTable(res.data.groups, res.data.scores)
        }
        this.initResolution(res.data.problems, res.data.completeData);
        this.initAnswer(res.data.problems, res.data.answers);
      })
      .catch((res) => {
        console.log("get result:", res)
      })
  },

  secretKeyInputChange(event) {
    let data = event.detail.detail.value;
    this.setData({
      currentSecretKey: data
    })
  },
  initTable(groups, scores){
        var rows = []
        var columnWidths = []
        groups.forEach((item1,index1)=>{
          var tabItem = {title:item1.title}
          item1.options.forEach((item2,index2)=>{
            tabItem['option'+index2] = item2
          })
          var quantal = 0
          scores[index1].forEach((scoresItem,scoresIndex)=>{
            quantal += scoresItem
            tabItem['option'+scoresIndex] += ':' + scoresItem
          })
          tabItem.title += ':' + quantal
          rows.push(tabItem)
        })
        var keys = Object.keys(rows[0])
        keys.forEach((item3,index3)=>{
          columnWidths[index3] = 620/keys.length+'rpx'
        })
        this.setData({
          rows:rows,
          keys:keys,
          ['tableConfig.columnWidths']:columnWidths
        })
        console.log(this.data.tableConfig)
        console.log('this.data.rows',this.data.rows)
  },
  initResolution(problems, solutions) {
    let res = [];
    for (let i = 0; i < problems.length; i++) {
      var prob = problems[i];
      var reso = solutions[i];
      if(reso.type == 'MULTIPLY_SELECT' || reso.type == 'SINGLE_SELECT'){
        for (var j=0; j < reso.resolution.length; j++){
          var k = parseInt(reso.resolution[j]);
            prob.options[k].checked = true;
        }
      }else{
        for (var j=0; j < reso.resolution.length; j++){
          prob.options[j] = reso.resolution[j]
        }
      }
    }
    this.setData({problems: problems})
  },

  initAnswer(problems, solutions) {
    var res = [];
    console.log(problems, solutions)
    for (let i = 0; i < problems.length; i++) {
      var prob = problems[i];
      if (solutions.length < i){
        break;
      }
      var reso = solutions[i];
      if (reso.ranks){
        for (let j=0; j < reso.ranks.length; j++){
          var rank = reso.ranks[j];
          if (prob.options.length > rank[0]){
            prob.options[rank[0]].score = rank[1];
          }
        }
      }
      res.push(prob)
    }
    console.log(res,'resresres')
    this.setData({problems: res})
  },

  formDataChange(event) {
    // 目标问题下标
    let problemIndex = event.currentTarget.dataset.problemindex;

    // 目标问题类型下标
    let problemType = event.currentTarget.dataset.problemtype;

    // 表单  单选题或多选题 || 评价题 || 填空题
    let newForm = event.detail.value || event.detail.index || event.detail.detail.value;

    // 取出目标问题
    let targetProblem = this.data.problemResults[problemIndex];

    // 开始更新表单
    if (problemType === "SINGLE_SELECT") {
      targetProblem.resolution[0] = newForm
    }
    if (problemType === "MULTIPLY_SELECT") {
      targetProblem.resolution = newForm
    }
    if (problemType === "SCORE") {
      targetProblem.resolution[0] = newForm
    }
    if (problemType === "BLANK_FILL") {
      targetProblem.resolution[0] = newForm
    }

    let p = 'problemResults[' + problemIndex + ']';
    this.setData({
      [p]: targetProblem
    })
  },
  confirm: function(e){
    wx.navigateBack()
  },
  copyQ: function(e){
    QuestionnaireRequest.copyQuestionnaireTemplates(this.data.qid, app.globalData.token)
    .then(res=>{
      var qid = res.data.questionnairedId
      wx.redirectTo({
        url: '/pages/questionnaire/questionnaire?qid=' + qid,
      });
    })
  },

  checkIsComplete() {
    let ret = true;
    this.data.problems.forEach((item, index)=>{
      if(item.isRequire){
        if(this.data.problemResults[index].resolution.length < 1){
          ret = false;
        }
      }
    })
    return ret
  },

  checkIsSubmit() {
    let data = wx.getStorageSync(this.data.qid);
    return !!(data && data.length);
  },

  setIsSubmit() {
    wx.setStorageSync(this.data.qid, this.data.qid);
  },
  onShareAppMessage(e) {
     if(e.from=="button" ){
      return {
                title: `${this.data.basicInfo.title}`,
                path: `/pages/complete/complete?qid=${this.data.qid}`,
                imageUrl: '../../assets/image/shareImg.jpg'
              }
    }else{
      return {
                title: `一次问卷懂你懂我知更多`,
                path: `/pages/manage/manage`,
                imageUrl: '../../assets/image/shareImg.jpg'
              }
    }
  }
});