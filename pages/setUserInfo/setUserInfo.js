// pages/setUserInfo/setUserInfo.js
import {UserInfoRequest}  from '../../network/userInfo'

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qid:null,
    userInfo: {},
    canIUseGetUserProfile: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      qid:options.qid
    })
    if(wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于使用云中问卷', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        app.globalData.userInfo = res.userInfo
        UserInfoRequest.setUerInfo(app.globalData.userId, res.userInfo)
        .then(res => {
          if(this.data.qid){
            wx.redirectTo({
              url: '/pages/complete/complete?qid='+this.data.qid
            })
          }else{
            wx.redirectTo({
              url: '/pages/manage/manage'
            })
          }
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
     app.globalData.userInfo = e.detail.userInfo;
     UserInfoRequest.setUerInfo(app.globalData.userId, e.detail.userInfo)
     .then(res => {
            if(this.data.qid){
              wx.redirectTo({
                url: '/pages/complete/complete?qid='+this.data.qid
              })
            }else{
              wx.redirectTo({
                url: '/pages/manage/manage'
              })
            }
          })

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

  }
})