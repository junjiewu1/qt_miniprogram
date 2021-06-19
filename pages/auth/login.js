// pages/auth/login.js
import {COMMON_URL} from "../../network/config";
import {APPID} from "../../network/config";

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getPhoneNumber: function (e) {
    var encryptedData = e.detail.encryptedData;
    var iv = e.detail.iv;
    var thatss = this;
    if (e.detail.errMsg.startsWith('getPhoneNumber:fail')) { //用户点击拒绝
   wx.showModal({
     title: '手机号未授权',
     content: '如需正常使用小程序功能，请按确定后并重新点击【手机号授权】按钮，然后选择【允许】',
     showCancel: false,
     success: function (res) {
       if (res.confirm) {
       }
     }
   })
   return false;
   } else {
     console.log("getPhone:", e)
   wx.showLoading({
     title: 'Loading...',
   })
   wx.login({
     success: function (e) {
       wx.request({
         url: COMMON_URL + '/wechat/register',
         data:{
          encryptedData: encryptedData, iv: iv, code: e.code, appid: APPID
         },
         method: 'POST',
         header: { "Content-Type": "application/x-www-form-urlencoded" },
         success(res){
           if ('phoneNumber' in res.data){
            getApp().globalData.userId = res.data.phoneNumber
           }
         }
       })
       /*
       wx.getUserInfo({
         success: function (res) {
           let promise = new Promise(function (resolve, reject) {
             getApp().globalData.userInfo = res.userInfo;
             wx.request({
               url: COMMON_URL + '/wechat/login',
               data: { code: res.code, avatar: res_user.userInfo.avatarUrl, nickName: res_user.userInfo.nickName },
               method: 'POST',
               header: { "Content-Type": "application/x-www-form-urlencoded" },
               success: function (res) {
                 console.log(JSON.stringify(res.data));
                 that.globalData.openId = res.data.openId;
                 that.globalData.sessionKey = res.data.sessionKey;
                 that.globalData.userInfo = res.data.user;
                 wx.hideLoading();
               }, fail: function (e) {
                 wx.hideLoading();
               }
             })
           })
         },
         fail: function (e) {
           wx.hideLoading();
         }
       })
         */
     }, fail: function () {
       wx.hideLoading();
     }
   })
   }
   }
})