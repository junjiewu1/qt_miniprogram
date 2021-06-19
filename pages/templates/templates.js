// pages/manage/templates.js
import {QuestionnaireRequest} from "../../network/questionnaire";
import {MessageBox} from "../../utils/messageBox";
import {ResponseModel} from "../../models/ResponseModel";
import {UserInfoRequest}  from '../../network/userInfo';

var app = getApp();
Page({
  page: 0,
  hasmoredata: true,
  keyword: '',
  /**
   * 页面的初始数据
   */
  data: {
    questionnaires: [],
    dialogShow:false,
    refId: null,
  },
  addClick(){
    var url = '/pages/questionnaire/questionnaire?qid=new';
    if (this.data.refId)
      url += "&refId=" + this.data.refId;
    wx.navigateTo({
      url: url
    });
  },
  importClick(){
    wx.chooseMessageFile({
      count: 1,
      success: res=>{
        console.log(res)
        var obj = res.tempFiles[0]
        QuestionnaireRequest.importTemplate(this.data.refId, 'file', obj.path, app.globalData.token)
        .then((res)=>{
          this.setData({
            dialogShow:false
          })
          console.log("up res:", res)
          var q = JSON.parse(res.data)
          var url = '/pages/questionnaire/questionnaire?qid=' + q.questionnaireId;
          wx.navigateTo({
            url: url
          });
        })
        .catch((res)=>{
          console.log("error res:", res)
          var obj = JSON.parse(res.data)
          MessageBox.handleError({
            message: "导入失败:" + obj.information
          });
        })
      }
    })
  },
  downClick(){
    wx.navigateTo({
      url: '/pages/downloadfile/downloadfile'
    })
    this.setData({
      dialogShow:false
    })
       
  },
  itemClick(event) {
    let targetIndex = event.currentTarget.dataset.index;
    let newq = this.data.questionnaires[targetIndex];
    var url = '/pages/complete/complete?qid=' + newq.id + "&action=copyQ";
    wx.navigateTo({
      url: url,
    })
  },
  getQuestionnaireTemplates(page, token) {
    QuestionnaireRequest.getQuestionnaireTemplates(page, token)
      .then(res => {
        if (res.data.questionnaires.length < 10)
          this.hasmoredata = false;
        var questionnaires = this.data.questionnaires;
        res.data.questionnaires.forEach((item)=>{
          questionnaires.push(item)
        })
        this.setData({
          questionnaires: questionnaires
        });
      })
      .catch(() => {
        MessageBox.handleError({
          message: "抱歉 登录失败"
        });
      })
  },
  openDialog(){
    this.setData({
      dialogShow: true
    })
  },
  

  refreshList(){
    if (this.keyword != '')
      return this.searchList();
    if (!this.hasmoredata)
      return;
    this.page += 1
    console.log("refresh list:", this.page)
    if (!app.globalData.isLogin) {
      app.userInfoReadyCallback = token => {
        this.getQuestionnaireTemplates(this.page, token);
        //app.globalData.isLogin = !app.globalData.isLogin;
      };
    } else {
      this.getQuestionnaireTemplates(this.page, app.globalData.token);
    }
  },
  searchQuestionnaireTemplates(page, keyword, token) {
    QuestionnaireRequest.searchQuestionnaireTemplates(page, keyword, token)
      .then(res => {
        if (res.data.questionnaires.length < 10)
          this.hasmoredata = false;
        var questionnaires = this.data.questionnaires;
        res.data.questionnaires.forEach((item)=>{
          questionnaires.push(item)
        })
        this.setData({
          questionnaires: questionnaires
        });
      })
      .catch(() => {
        MessageBox.handleError({
          message: "抱歉 登录失败"
        });
      })
  },
  searchList(){
    if (!this.hasmoredata)
      return;
    this.page += 1
    console.log("searchList list:", this.page, this.keyword)
    if (!app.globalData.isLogin) {
      app.userInfoReadyCallback = token => {
        this.searchQuestionnaireTemplates(this.page, this.keyword, token);
        //app.globalData.isLogin = !app.globalData.isLogin;
      };
    } else {
      this.searchQuestionnaireTemplates(this.page, this.keyword, app.globalData.token);
    }
  },
  keywordChange: function(e){
    //this.keyword = e.detail;
  },
  resetD: function(){
    this.page = 0;
    this.hasmoredata = true;
    this.keyword = '';
    this.setData({questionnaires: []});
  },
  keywordClear: function(e){
    this.resetD();
    this.refreshList();
  },
  keywordSearch: function(e){
    this.resetD();
    this.keyword = e.detail;
    this.refreshList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if ('refId' in options)
      this.setData({refId: options.refId});
    this.resetD();
    this.refreshList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.refreshList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})