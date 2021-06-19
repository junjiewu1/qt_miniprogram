import { setApp } from "./network/requests";
//app.js
import {UserRequest} from "./network/user";
import {UserInfoRequest} from './network/userInfo'

const TOKEN = 'token';
const USERID = "userid";

App({
  globalData: {
    userId: null,
    userInfo: null,
    token: '',
    isLogin: false,
    initSuccess: true
  },
  getUserId(){
    console.log("getting userid")
    var that = this;
    wx.login({
      success: res => {
        console.log("login res:", res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        UserInfoRequest.getLogin(res.code)
        .then((rr)=>{
          that.globalData.userId = rr.data.openid;
          wx.setStorageSync(USERID, that.globalData.userId);
          that.weChatLogin();
        })
      },
      fail (e){
        console.log("failed:", e)
      }
    });
  },
  onLaunch() {
    setApp(this);
    const token = wx.getStorageSync(TOKEN);
    const userid = wx.getStorageSync(USERID);
    console.log("userid token:", userid, token)
    if (!userid){
      this.getUserId();
      return;
    }else{
      this.globalData.userId = userid;
    }
    if (token) {
      this.checkToken(token);
      this.getUserInfo();
    } else {
      this.weChatLogin();
    }
  },

  checkToken(token) {
    UserRequest.checkToken(token)
      .then(res => {
        this.globalData.token = token;
        this.globalData.isLogin = true;
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(token);
        }
      })
      .catch(() => {
        // 重新登录
        this.weChatLogin();
      })
  },
  userLogin(userId, code){
    UserRequest.userLogin(userId, code)
    .then(res => {
      this.globalData.token = res.data.token;
      this.globalData.isLogin = true;
      wx.setStorageSync(TOKEN, this.globalData.token);
      if (this.userInfoReadyCallback) {
        this.userInfoReadyCallback(res.data.token);
      }
    }).catch(() => {
    this.globalData.initSuccess = false;
    });
  },
  weChatLogin() {
    var userId = this.globalData.userId;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log("login res:", res)
        this.userLogin(userId, res.code)
      }
    });
    
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.getUserInfo();
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              this.getUserInfo();
            }
          })
        }
      }
    })
  },

  getUserInfo() {
    UserInfoRequest.getUerInfo(this.globalData.userId, this.globalData.userInfo)
    .then((res)=>{
      if(res.data.nickName){
        this.globalData.userInfo = res.data
      }
    })
  }
});