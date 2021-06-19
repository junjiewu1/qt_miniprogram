import {QuestionnaireRequest} from "../../network/questionnaire";
import {Questionnaire} from "../../models/questionnaireModel";
import {MessageBox} from "../../utils/messageBox";
import {AnswerRequest} from "../../network/answer";

const app = getApp();

Page({
  data: {
    basicInfo: {
      title: '',
      subTitle: '',
      questionnaireId: null,
    },
    problems: [],
    actionSheetVisible: false,
    appProblemOperation: [
      {
        name: '单选题',
        icon: 'success',
      },
      {
        name: '多选题',
        icon: 'createtask'
      },
      {
        name: '填空题',
        icon: 'barrage'
      },
      // {
      //   name: '下拉题',
      //   icon: 'unfold'
      // },
      {
        name: '评价题',
        icon: 'collection'
      },
    ],
    qid: null,
    pageerror:false,
    refId: null,
  },

  onLoad(query) {
    // 隐藏小房子
    wx.hideHomeButton();
    if ('refId' in query)
      this.setData({refId: query.refId});
    // 如果是编辑模式
    if (query.qid !== 'new') {
      this.setData({
        qid: query.qid
      });
    } else {
      this.createQuestionnaire();
    }
  },

  createQuestionnaire() {
    QuestionnaireRequest.createQuestionnaire(this.data.refId, app.globalData.token)
      .then(res => {
        this.data.pageerror = false
        this.setData({
          'basicInfo.questionnaireId': res.data.questionnaireId,
          qid: res.data.questionnaireId
        })
      })
      .catch(() => {
        this.data.pageerror = true
        MessageBox.handleError({
          message: "抱歉 问卷创建失败 3秒后自动返回"
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 3000)
      })
  },
  onShow() {
    if (this.data.qid) this.getBasicInfo(this.data.qid);
  },
  onUnload(){
    if(this.data.basicInfo.title.length<1 && this.data.problems.length<1 && !this.data.pageerror){
        QuestionnaireRequest.deleteQuestionnaire(this.data.qid, app.globalData.token)
          .then(res => {
            
          })
          .catch(err => {
           
          });
    }
  },
  settingClick(){
    wx.navigateTo({
      url: '/pages/basicEdition/basicEdition?qid='+this.data.qid,
    })
  },
  getBasicInfo(qid) {
    QuestionnaireRequest.getQuesionnaire(qid, app.globalData.token)
      .then(res => {
        let q = new Questionnaire(res.data);
        this.setData({
          basicInfo: q.basicInfo,
          problems: q.problems
        });
      })
      .catch(() => {
        MessageBox.handleError({
          message: "抱歉 问卷数据获取失败 3秒后自动返回"
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 3000)
      })
  },

  // 添加一个问题

  readyAppendProblem() {
    if(this.data.basicInfo.title){
      this.setData({
        actionSheetVisible: true
      });
    }else{
      MessageBox.handleError({
        message: "请创建一个标题"
      });
    }
  },

  handleClickItem(event) {
    let problemTypeArr = ["SINGLE_SELECT", "MULTIPLY_SELECT", "BLANK_FILL", "SCORE"];
    let type = problemTypeArr[event.detail.index];
    this.appendOneProblem(type).then(() => {
      MessageBox.handleSuccess({
        message: "添加问题成功~"
      });
      let _problemId = this.data.problems[this.data.problems.length-1].problemId
      wx.navigateTo({
        url: '/pages/problemEdition/problemEdition?pid='+_problemId
      })
    })
  },

  async appendOneProblem(problemType) {
    let problemTypeChineseNameMap = {
      "SINGLE_SELECT": "单选题",
      "MULTIPLY_SELECT": "多选题",
      "BLANK_FILL": "填空题",
      // "DROP_DOWN": "下拉题",
      "SCORE": "评价题"
    };

    let dataToPush = {
      //制造唯一id
      type: problemType,
      title: ``,
      options: [],
      targetQuestionnaireId: this.data.qid,
      isRequire: false,
      problemId: null
    };

    let qid;
    try {
      qid = await QuestionnaireRequest.appendOneProblem(dataToPush, app.globalData.token);
      
    } catch (e) {
      MessageBox.handleError({
        message: "抱歉 添加题目失败"
      });
      return
    }
    // dataToPush.problemId = qid['problemId'];
    dataToPush.problemId = qid.data.problemId;
    // console.log(dataToPush.problemId);

    let t = this.data.problems;
    
    t.push(dataToPush);
    this.setData({
      problems: t,
      actionSheetVisible: false
    });
    
  },

  actionSheetCancel() {
    this.setData({
      actionSheetVisible: false
    });
  },
  //二维码
  get_qrcode(){
    let qid = this.data.qid;
    QuestionnaireRequest.get_qrcode(qid)
    .then((res)=>{
     var filePath = res.tempFilePath;
       wx.saveImageToPhotosAlbum({
         filePath: filePath, // 此为图片路径
         success: (res) => {
           wx.showToast('保存成功')                   
         },
         fail: (err) => {
             console.log(err)
             wx.showToast('保存失败，请稍后重试')
         }
     })
    })
  },
  preview(){
    var url = '/pages/complete/complete?qid=' + this.data.qid + "&action=preview";
    wx.navigateTo({
      url: url,
    })
  },
  importAnswer(){
    wx.chooseMessageFile({
      count: 1,
      success: res=>{
        console.log(res)
        var filePath = res.tempFiles[0].path
        AnswerRequest.importTemplate(this.data.qid, "file", filePath, app.globalData.token)
        .then(res=>{
          wx.showToast({
            title: '上传答案成功',
          })
        }).catch(res=>{
          wx.showToast({
            title: '上传答案失败',
            icon: 'none'
          })
        })
      }
    })
  }
});