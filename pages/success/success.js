Page({
  data: {
    suc_options:{}
  },
  onLoad(options){
    console.log('options',options)
    this.setData({
      suc_options:options
    })
  },
  gotoHome() {
    wx.redirectTo({
      url: "/pages/manage/manage"
    })
  },
  gotoCheckUp(){
    wx.redirectTo({
      url: "/pages/analysis/analysis?qid="+this.data.suc_options.qid
    })
  },
  gotoReview(){
    wx.redirectTo({
      url: '/pages/review/review?qid=' + this.data.suc_options.qid + "&secretKey=" + this.data.suc_options.secretKey,
    })
  },
  onShareAppMessage(e) {
     if(e.from=="button" ){
      return {
                title: `${this.data.suc_options.title}`,
                path: `/pages/complete/complete?qid=${this.data.suc_options.qid}`,
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