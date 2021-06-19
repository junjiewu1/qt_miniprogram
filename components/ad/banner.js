// components/ad/banner.js
const DEBUG_BASE_URL = "https://live.chinaedgecomputing.com:6020/common-ts";
const BASE_URL = "https://live.chinaedgecomputing.com:6020/common";
function getAdUrl(){
  let version = __wxConfig.envVersion;
  switch (version)
  {
    case 'develop':
      return DEBUG_BASE_URL;
      break;
    case 'trial':
      return DEBUG_BASE_URL;
      break;
    case 'release':
      return BASE_URL;
      break;
    default:
      return BASE_URL;
  }
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    intervals: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    image: "",
    obj: null,
  },

  attached: function(){
    console.log("banner attached")
    wx.request({
      url: getAdUrl() + "/ad/fetch" + "?unitid=" + this.data.unitid + "&type=" + "miniprogram",
      success: res=>{
        console.log(res)
        this.setData({image: res.data.url, obj: res.data});
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickAd(){
      console.log("clickAd")
      if (this.data.obj){
        wx.navigateToMiniProgram({
          appId: this.data.obj.appid,
          path: this.data.obj.path,
          success (res){
            console.log("nv mini program:", res)
          },
          fail(res){
            console.log("nv failed:", res)
          }
        })
      }
    }
  }
})
