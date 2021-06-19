// pages/downloadfile/downloadfile.js
import {QuestionnaireRequest} from "../../network/questionnaire";

Page({

  /**
   * 页面的初始数据
   */
  data: {
     a:['xlsx','docx','pdf']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  copylink(e){
    var type = e.currentTarget.dataset.type
    var url = QuestionnaireRequest.getTemplateUrl(type);
    wx.setClipboardData({
      data: url,
      success: res=>{
        console.log("复制文件地址成功！")
      }
    })
  },
  downExcelTemplate(e){
    var type = e.currentTarget.dataset.type
    QuestionnaireRequest.downExcelTemplate(type)
      .then((res)=>{
        console.log("download success:", res)
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: res=>{
              console.log("open failed:", res)
            }
          })
      })
      .catch((res)=>{
        console.log("download failed:", res)
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