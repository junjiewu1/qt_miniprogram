class TimeHelper {
  static GMTtoDate(time) {
    let date = new Date(time);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  static GMTtoTime(time) {
    let date = new Date(time);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  }

  static getDate(timestr){
    //let date = new Date(time);
    //return '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    return '' + timestr.substring(0,10);
  }

  static getTime(timestr){
    //let date = new Date(time);
    //return '' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    return '' + timestr.substring(11, timestr.length);
  }
}

export {
  TimeHelper
}