import {CompleteRequest} from "../../network/complete";
import {QuestionnaireRequest} from "../../network/questionnaire";
import {parseQueryString} from "../../network/base";
import {MessageBox} from "../../utils/messageBox";
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
        if (this.data.action == 'complete' && this.checkIsSubmit() && res.data.equipmentControl) {
          wx.redirectTo({
            url: '/pages/success/success?qid='+this.data.qid+'&resultControl='+res.data.resultControl + "&title=" + res.data.title
          })
        }
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
    if (app.globalData.isLogin){
      this.getCondition();
    }else{
      console.log("no token")
      app.userInfoReadyCallback = this.getCondition;
    }
  },

  checkTopInfo(condition, isSecret) {
    if (!condition) return "???????????????????????????~";
    if (isSecret) return "????????????????????????";
    return ""
  },

  checkSecretKey() {
    let key = this.data.currentSecretKey || "key";
    if (!key || key === "") {
      console.log("??????????????????");
    }
    CompleteRequest.checkSecretKey(this.data.qid, key)
      .then(res => {
        
        this.setData({
          topInfo: "???????????????",
          showCheckSecretInput: false,
          showCompleteForm: true,
          problems: res.data.problems,
          basicInfo: res.data.basicInfo
        });
        
        this.initResolution(res.data.problems);
      })
      .catch(() => {
        MessageBox.handleError({
          message: "????????????????????????",
          duration: 1
        })
      })
  },

  secretKeyInputChange(event) {
    let data = event.detail.detail.value;
    this.setData({
      currentSecretKey: data
    })
  },

  // ?????????????????????
  initResolution(problems) {
    let res = [];
    for (let i = 0; i < problems.length; i++) {
      res.push({
        targetProblemId: problems[i].problemId,
        resolution: [],
        type: problems[i].type
      });
    }
    this.setData({
      problemResults: res
    })
  },

  formDataChange(event) {
    // ??????????????????
    let problemIndex = event.currentTarget.dataset.problemindex;

    // ????????????????????????
    let problemType = event.currentTarget.dataset.problemtype;

    // ??????  ????????????????????? || ????????? || ?????????
    let newForm = event.detail.value || event.detail.index || event.detail.detail.value;

    // ??????????????????
    let targetProblem = this.data.problemResults[problemIndex];

    // ??????????????????
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
  saveCompleteForm() {
    
    if (!this.checkIsComplete()) {
      MessageBox.handleWarning({
        message: "????????????????????????"
      });
      return
    }

    if (this.checkIsSubmit() && this.data.basicInfo.equipmentControl) {
      MessageBox.handleWarning({
        message: "?????????????????????????????? ?????????????????????"
      });
      return
    }

    CompleteRequest.submitComplete(this.data.problemResults, this.data.qid, getApp().globalData.userId)
      .then((res) => {
        console.log("presubmit ret:", res)
        if (res.data.valid){
          this.setIsSubmit();
          wx.redirectTo({
            url: '/pages/success/success?qid='+this.data.qid+'&resultControl='+this.data.basicInfo.resultControl + "&title=" + res.data.title
          })
        }else{
          var title = ""
          res.data.res.forEach((item)=>{
            title += '??????:' + item.problem + ' ??????????????????:' +item.option
          })
          MessageBox.handleError({
            message: "?????????????????? " + title
          });
        }
      })
      .catch(() => {
        MessageBox.handleError({
          message: "?????? ????????????"
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
});