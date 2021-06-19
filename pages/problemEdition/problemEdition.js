import {QuestionnaireRequest} from "../../network/questionnaire";
import {ProblemModel} from "../../models/problemModel";
import {MessageBox} from "../../utils/messageBox";

const app = getApp();


Page({
  data: {
    validated: true,
    problem: {},
    confirmDeleteVisiable: false,
    confirmDeleteAction: [
      {
        name: '取消'
      },
      {
        name: '删除',
        color: '#ed3f14',
        loading: false
      }
    ]
  },
  onLoad(options) {
    this.setData({
      validated: true
    })
    QuestionnaireRequest.getOneProblem(options.pid, app.globalData.token)
      .then(res => {
        let p = new ProblemModel(res.data);
        this.setData({
          problem: p
        })
        if (this.data.problem.type == 'SINGLE_SELECT' || this.data.problem.type == 'MULTIPLY_SELECT'){
          if (this.data.problem.options.length == 0){
            this.setData({validated:false});
          }
        }
      })
      .catch(() => {
        
        MessageBox.handleError({
          message: "抱歉 问题数据获取失败 三秒后将返回"
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 3000)
      })
  },
  titleChange(event) {
    this.setData({
      ['problem.title']: event.detail.detail.value
    });
  },
  addOneOption() {
    if(!this.data.problem.title){
      MessageBox.handleError({
        message: "请输入标题"
      });
      return 
    }
    let p = this.data.problem;
    p.options.push({
      title: "",
      availableNum: -1,
      optionId: new Date().getTime()
    });
    this.setData({
      problem: p,
      validated: true
    }) 
  },
  
  isRequireChange() {
    this.setData({
      ['problem.isRequire']: !this.data.problem.isRequire
    })
  },
  
  deleteProblem() {
    this.setData({
      confirmDeleteVisiable: true
    });
  },
  
  handleClick(event) {
    this.setData({
      confirmDeleteVisiable: false, validated: true
    });
    let res = event.detail.index;
    if (res) {
      this.gotoDeleteProblem();
      wx.navigateBack();
    }
  },

  gotoDeleteProblem() {
    let pid = this.data.problem.problemId;
    console.log(pid)
    QuestionnaireRequest.deleteOneProblem(pid, app.globalData.token)
      .then(() => {
      })
      .catch(err => {
        console.log(err);
      })
  },

  onUnload(){
    if (!this.data.validated){
      console.log("delete prob")
      this.gotoDeleteProblem();
    }
  },

  saveProblemEdition() {
    if(!this.data.validated){
      MessageBox.handleError({
        message: "请完善信息"
      });
        return 
    }
    QuestionnaireRequest.editOneProblem(this.data.problem, app.globalData.token)
      .then(() => {
        wx.navigateBack();
      })
      .catch(err => {
        console.log(err);
      })
  },
  updatatitle(e){
    var updatatitlevalue = e.detail
      this.data.problem.options.forEach((e, i)=>{
        if(e.optionId == updatatitlevalue.optionId){
          e.title = updatatitlevalue.title
        }
      })
  },
  updateavailableNum(e){
    var updatatitlevalue = e.detail
      this.data.problem.options.forEach((item, i)=>{
        if(item.optionId == updatatitlevalue.optionId){
          item.availableNum = updatatitlevalue.availableNum
        }
      })
  },
  delOneOption(e){
    var i = this.data.problem.options
    i.splice(e.detail, 1)
    this.setData({
      ['problem.options']: i
    })
    if (this.data.problem.options.length == 0){
      this.setData({
        validated: false,
      })
    }
  }
});