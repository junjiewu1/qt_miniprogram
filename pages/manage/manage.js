import {QuestionnaireRequest} from "../../network/questionnaire";
import {MessageBox} from "../../utils/messageBox";
import {ResponseModel} from "../../models/ResponseModel";
import {UserInfoRequest}  from '../../network/userInfo'
const app = getApp();

Page({
  data: {
    questionnaires: [],
    activeQuestionnaire: {},
    actionSheetVisible: false,
    confirmSpreadVisiable: false,
    m_userInfo: Object,
    showShare: false,
    questionnaireOperation:[
        { name: '发布', icon:'/assets/image/iconmonstr-upload-18-240.png'},
        { name: '分享', icon:'/assets/image/iconmonstr-share-8-240.png'},
        { name: '复制问卷', icon:'/assets/image/iconmonstr-copy-14-240.png'},
        { name: '问卷设置', icon:'/assets/image/iconmonstr-tools-8-240.png'},
        { name: '编辑', icon:'/assets/image/iconmonstr-edit-5-240.png'},
        { name: '答卷情况', icon:'/assets/image/iconmonstr-chart-4-240.png'},
        { name: '二维码', icon:'/assets/image/iconmonstr-qr-code.png'},
        { name: '删除', icon:'/assets/image/iconmonstr-x-mark-2-240.png'}
    ],
  },
  refreshList(){
    if (!app.globalData.isLogin) {
      app.userInfoReadyCallback = token => {
        this.getUserQuestionnaireInfo(token);
        //app.globalData.isLogin = !app.globalData.isLogin;
      };
    } else {
      this.getUserQuestionnaireInfo(app.globalData.token);
    }
  },
  onLoad(){
    setTimeout(()=>{
    if(app.globalData.userInfo){
      this.setData({
        m_userInfo:app.globalData.userInfo
    })
    }
  },10)
  },
  onShow() {
    this.refreshList();
  },
  
  
  getUserQuestionnaireInfo(token) {
    QuestionnaireRequest.getUserQuestionnaireInfo(token)
      .then(res => {
        
        this.setData({
          questionnaires: res.data.questionnaires
        });
      })
      .catch(() => {
        MessageBox.handleError({
          message: "抱歉 登录失败"
        });
      })
  },
  getuserInfoClick(){
    wx.redirectTo({
            url: '/pages/setUserInfo/setUserInfo'
          })
  },
  reLaunchManagePage() {
    wx.reLaunch({
      url: '/pages/manage/manage'
    });
  },
  onClose() {
    this.setData({ showShare: false });
  },
  // 某个问卷标签被单击 弹出操作框
  itemClick(event) {
    let targetIndex = event.currentTarget.dataset.index;
    let operation = 'questionnaireOperation[0].name';
    let newq = this.data.questionnaires[targetIndex];
    this.setData({
      showShare:true,
      actionSheetVisible: true,
      activeQuestionnaire: newq,
      [operation]: newq.condition ? "取消发布" : "发布"
    });
    let openType = 'questionnaireOperation[1].openType';
    if (newq.condition){
      this.setData({
        [openType]: 'share'
      })
    }else{
      this.setData({
        [openType]: ''
      })
    }
  },
  handleClickItem(event) {
    console.log(event);
    let type = event.detail.index;
    switch (type) {
      // 发布
      case 0:
        this.gotoSpread();
        break;
      case 1:
        if (this.data.activeQuestionnaire.condition){
          
        }else{
        MessageBox.handleError({
          message: "请先发布再分享"
        });
        }
        break;
      case 2:
         this.gotoCopy();
        break;
      case 3:
        this.gotoEditBasicInfo();
        break;
      case 4:
        this.gotoEditProblems();
        break;
      case 5:
        this.gotoAnalysis();
        break;
      case 6:
        this.get_qrcode();
        break;
      case 7:
        this.gotoDelete();
        break;
    }
    this.setData({
      showShare: false,
    });
  },
  addClick(){
    wx.navigateTo({
      url: '/pages/templates/templates'
    })
  },

  actionSheetCancel() {
    this.setData({
      actionSheetVisible: false
    });
  },

  // 发布问卷
  gotoSpread() {
    wx.showLoading({
      title: '正在检查合规性...',
    })
    UserInfoRequest.checkugcMsg(this.data.activeQuestionnaire.title)
    .then(res=>{
      wx.hideLoading({
        success: (res) => {},
      })
      if (res.data.result){
        this.setData({
          confirmSpreadVisiable: true
        });
      }else{
        MessageBox.handleError({
          message: '问卷标题不合规'
        });
      }
    })
    .catch(res=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  //复制问卷
  gotoCopy(){
    let qid = this.data.activeQuestionnaire.questionnaireId;
    let token = app.globalData.token;
    QuestionnaireRequest.copyQuestionnaire(qid, token)
    .then(res => {
      this.reLaunchManagePage();
    })
  },
  // 编辑基本信息
  gotoEditBasicInfo() {
    wx.navigateTo({
      url: `/pages/basicEdition/basicEdition?qid=${this.data.activeQuestionnaire.questionnaireId}`
    })
  },

  // 问卷题目编辑
  gotoEditProblems() {
    wx.navigateTo({
      url: `/pages/questionnaire/questionnaire?qid=${this.data.activeQuestionnaire.questionnaireId}`
    })
  },

  // 数据分析
  gotoAnalysis() {
    wx.navigateTo({
      url: `/pages/analysis/analysis?qid=${this.data.activeQuestionnaire.questionnaireId}`
    })
  },
  //生成二维码
  get_qrcode(){
    let qid = this.data.activeQuestionnaire.questionnaireId;
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

  // 删除
  gotoDelete() {
    let qid = this.data.activeQuestionnaire.questionnaireId;
    let token = app.globalData.token;
    QuestionnaireRequest.deleteQuestionnaire(qid, token)
      .then(res => {
        let response = new ResponseModel(res.data);
        MessageBox.handleSuccess({
          message: response.information
        });
        this.reLaunchManagePage();
      })
      .catch(res => {
        let response = new ResponseModel(res.data);
        MessageBox.handleError({
          message: response.information
        });
      });
  },


  // 发布确认
  confirmSpread() {
    let data = {
      "questionnaireId": this.data.activeQuestionnaire.questionnaireId,
      "condition": !this.data.activeQuestionnaire.condition
    };
    QuestionnaireRequest.editQuesitonnaire(data, app.globalData.token)
      .then(() => {
        MessageBox.handleSuccess({
          message: "问卷发布成功~"
        });
        this.reLaunchManagePage();
      })
      .catch(res => {
        let response = new ResponseModel(res.data);
        MessageBox.handleSuccess({
          message: response.information
        });
      });
    this.setData({
      confirmSpreadVisiable: false
    });
  },

  cancalSpread() {
    this.setData({
      confirmSpreadVisiable: false
    });
  },
  menuButtonClick() {
    wx.navigateTo({
      url: "/pages/questionnaire/questionnaire?type=new"
    })
  },

  gotoShare() {
    
  },

  onShareAppMessage(e) {
     if(e.from=="button" ){
      return {
                title: `${this.data.activeQuestionnaire.title}`,
                path: `/pages/complete/complete?qid=${this.data.activeQuestionnaire.questionnaireId}`,
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