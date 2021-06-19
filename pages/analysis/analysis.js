import {AnalysisRequest} from "../../network/analysis";
import {MessageBox} from "../../utils/messageBox";
import {QuestionnaireRequest} from "../../network/questionnaire";
import * as echarts from '../../components/charts/ec-canvas/echarts';
const app = getApp();
var dataList = [];
var xAxisDataList = []
Page({
  data: {
    ec: {
      lazyLoad: true
    },
    qid: null,
    isAdmin: false,
    basicInfo: null,
    resolutions: [],
    Analysisuserinfo:[],
    tableColumn: [
      {
        name: "title",
        data: "选项",
        width: 400,
        default: "这个选项没有内容"
      },
      {
        name: "resolution",
        data: "选择此项的人数",
        width: 300,
        default: 0
      }
    ],
    tableColumnForScore: [
      {
        name: "title",
        data: "等级(1 - 5)",
        width: 400,
        default: "这个选项没有内容"
      },
      {
        name: "resolution",
        data: "倾向该等级的人数",
        width: 300,
        default: 0
      }
    ]
  },
  onShow(){
    
  },
  onLoad(options) {
    dataList = [];
    xAxisDataList = []
    //this.echartsComponnet = this.selectComponent('#mychart');
    let qid = options.qid;
    this.setData({qid: qid});
    AnalysisRequest.getAnalysisData(qid, app.globalData.token)
      .then(res => {
        this.setData({
          isAdmin: res.data.isAdmin,
          basicInfo: res.data.basicInfo,
          resolutions: res.data.data
        })
        this.data.resolutions.forEach((resolution,index)=>{
          if (resolution.type=='SINGLE_SELECT'){
            var pieData = []
            resolution.resolution.forEach((item)=>{
              var a = {value: item.resolution || 0, name: item.title}
              pieData.push(a)
            })
            dataList.push(pieData)
            var echartsComponnet = this.selectComponent('#mychart' + index);

            this.init_echarts(echartsComponnet, index);
            xAxisDataList.push(null)
          }else if (resolution.type=='MULTIPLY_SELECT'){
            var pieData = []
            var aAxisData = []
            resolution.resolution.forEach((item)=>{
              pieData.push(item.resolution || 0)
              aAxisData.push(item.title)
            })
            dataList.push(pieData)
            xAxisDataList.push(aAxisData)
            var echartsComponnet = this.selectComponent('#mychart' + index);
            this.init_echarts2(echartsComponnet, index);
          }else{
            dataList.push(null);
            xAxisDataList.push(null)
          }
        })
        console.log(dataList,xAxisDataList)
        })
      .catch((res) => {
        MessageBox.handleError({
          message: "抱歉 数据获取失败 三秒后返回首页"
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 3000)
      })

      AnalysisRequest.getAnalysisuserinfo(qid, app.globalData.token)
      .then(res => {
        this.setData({
          Analysisuserinfo:res.data.users
        })
      
      })

  },
  init_echarts(echartsComponnet, index) {
    echartsComponnet.init((canvas, width, height, dpr) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      Chart.setOption(this.getOption(index));
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  init_echarts2(echartsComponnet, index) {
    
    echartsComponnet.init((canvas, width, height,dpr) => {
      // 初始化图表
      const Chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      Chart.setOption(this.getOption2(index));
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return Chart;
    });
  },
  getOption(index) {
    // 指定图表的配置项和数据
    var option = {
      tooltip: {
            trigger: 'item'
          },
          label: {
            show: true,
            position: 'outer',
            formatter: '{b}：{c}人 {d}%'
        },
	    series: [{
	        data: dataList[index],
          type: 'pie',
          radius: '50%'
      }],
    }
    console.log('option',option)
    return option;
  },
  getOption2(index) {
    // 指定图表的配置项和数据
    var option = {
      yAxis: {
        type: 'category',
        data: xAxisDataList[index],
        axisLabel: {
          show: true,
          // 强制显示所有标签
          // interval: 0,
          textStyle: {
              fontSize: 10
          },
          formatter: function(value) {
              var res = value;
              // 长度超过4个的以省略号显示
              if(res.length > 5) {
                  res = res.substring(0, 6) + "..";
              }
              return res;
          }
      },
      axisLine: {
        show: true,
        lineStyle: {
            color: '#2F798e',
            width: 2, //这里是为了突出显示加上的
        }
    },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {  
      max: Math.max(...dataList[index])
    },
	    series: [{
	        data: dataList[index],
          type: 'bar' 
      }],
    }
    console.log('option',option)
    return option;
  },
  gotoDetailedAnalysis(event) {
    console.log(event);
    // 注意这里 problemid  的i小写
    let pid = event.currentTarget.dataset.problemid;
    wx.navigateTo({
      url: "/pages/detailedAnalysis/detailedAnalysis?pid=" + pid
    })
  },
  exportResults(){
    var qid = this.data.qid;
    
    AnalysisRequest.exportResults(qid, app.globalData.token)
    .then(res => {
      console.log(res)
      wx.downloadFile({
        url: res.data.url,
        success: res=>{
          var filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            success: function (res) {
              console.log('打开文档成功')
            }
          })
        }
      })
    })
  },
  exportStats(){
    var qid = this.data.qid;
    AnalysisRequest.exportStats(qid, app.globalData.token)
    .then(res => {
      console.log(res)
      wx.downloadFile({
        url: res.data.url,
        success: res=>{
          var filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            success: function (res) {
              console.log('打开文档成功')
            }
          })
        }
      })
    })
  },
  showDetail(){
    wx.chooseImage({
            count: 1,
            sourceType: ['album'],
            success:(res)=>{
              console.log(res)
              var file = res.tempFilePaths[0]
               wx.navigateTo({
                  url: `/pages/analysis/users?qid=${this.data.qid}&file=${file}`
                })
            }
          })
  }
});