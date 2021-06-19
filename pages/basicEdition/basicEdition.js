import {QuestionnaireRequest} from "../../network/questionnaire";
import {QuestionnaireCondition} from "../../models/questionnaireModel";
import {ResponseModel} from "../../models/ResponseModel";
import {MessageBox} from "../../utils/messageBox";

const app = getApp();
Page({
  data: {
    questionnaireId: null,
    questionnaireCondition: {},
  },

  onLoad(options) {
    this.data.questionnaireId = options.qid;
    let token = app.globalData.token;
    let qid = this.data.questionnaireId;
    QuestionnaireRequest.getQuesionnaireCondition(qid, token)
      .then(res => {
        let q = new QuestionnaireCondition(res.data);
        console.log(q)
        this.setData({
          questionnaireCondition: q
        });
        MessageBox.handleSuccess({
          message: `当前编辑: ${q.title}`
        });
      })
      .catch(err => {
        let response = new ResponseModel(err.data);
        MessageBox.handleError({
          message: response.information || "抱歉 获取失败"
        })
      });
  },

  switchChange(event) {
    let conditionType = event.target.dataset.type;
    let helper = `questionnaireCondition.${conditionType}`;
    this.setData({
      [helper]: !this.data.questionnaireCondition[conditionType]
    })
  },

  // 注意 在微信开发工具的模拟器下input无法修改值 需要真机调试
  secretInputChange(event) {
    let newValue = event.detail.detail.value;
    this.setData({
      'questionnaireCondition.secretKey': newValue
    })
  },
  bindTimeChange(event) {
    console.log(event);
    let target = 'questionnaireCondition.deadlineTime';
    this.setData({
      [target]: event.detail.value + ':00'
    });
  },

  bindDateChange(event) {
    console.log(event);
    let target = 'questionnaireCondition.deadlineDate';
    this.setData({
      [target]: event.detail.value
    });
    console.log(this.data.questionnaireCondition);
  },

  subMitData() {
    this.data.questionnaireCondition.deadlineArrayToGMTString();
    let c = new QuestionnaireCondition(this.data.questionnaireCondition);
    //c.deadlineArrayToGMTString();
    c.deleteUselessData();
    console.log(c)
    QuestionnaireRequest.editQuesitonnaire(c, app.globalData.token)
      .then(() => {
        console.log(c);
        MessageBox.handleSuccess({
          message: "问卷编辑成功~"
        });
        wx.navigateTo({
          url: '/pages/manage/manage',
        })
      })
      .catch(err => {
        let response = new ResponseModel(err.data);
        MessageBox.handleError({
          message: response.information || "抱歉 编辑失败"
        })
      })
  }
});