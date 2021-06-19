import {TimeHelper} from "../utils/timeHelper";

class Questionnaire {
  constructor(json) {
    this.basicInfo = new QuestionnaireCondition(json['basicInfo']);
    this.problems = json['problems'];
  }
}


class QuestionnaireCondition {
  constructor(json) {
    this.condition = json['condition'];
    this.deadlineControl = json['deadlineControl'];
    this.equipmentControl = json['equipmentControl'];
    this.ipControl = json['ipControl'];
    this.resultControl = json['resultControl'];
    this.loginControl = json['loginControl'];
    this.isSecret = json['isSecret'];
    this.questionnaireId = json['questionnaireId'];
    this.renewTime = json['renewTime'];
    this.secretKey = json['secretKey'];
    this.subTitle = json['subTitle'];
    this.title = json['title'];
    this.wechatControl = json['wechatControl'];
    this.deadline = json['deadline'];
    this.deadlineDate = TimeHelper.getDate(json['deadline']);//TimeHelper.GMTtoDate(json['deadline']);
    this.deadlineTime = TimeHelper.getTime(json['deadline']);//TimeHelper.GMTtoTime(json['deadline']);
  }


  deadlineArrayToGMTString() {
    this.deadline = `${this.deadlineDate} ${this.deadlineTime}`;
  }

  deleteUselessData() {
    delete this.deadlineDate;
    delete this.deadlineTime;
  }
}

export {
  QuestionnaireCondition,
  Questionnaire
}