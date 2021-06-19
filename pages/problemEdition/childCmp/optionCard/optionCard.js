Component({
  properties: {
    title: String,
    onlyShowTitle: Boolean,
    optionId:Number,
    availableNum: Number,
    index:Number,
    type:String
  },
  data: {
    ischecked: false,
    switchInput: 0,
    dialogShow: false
  },
  methods: {
    optionsChange(event) {
      this.setData({
        title: event.detail.detail.value
      });
      this.triggerEvent('updatatitle', this.properties, null)
    },
    availableNumChange(event) {
      if(this.data.ischecked){
            this.triggerEvent('updateavailableNum', this.properties, null)
      }else{
        this.setData({
          availableNum: -1,
          dialogShow:false
        });
        this.triggerEvent('updateavailableNum', this.properties, null)
      }
    },
    iconClick(e){
      this.triggerEvent('delOneOption', e.currentTarget.dataset.index)
    },
    rightTap(){
      var a = this.data.availableNum;
      this.setData({
        dialogShow:true,
        ischecked: a != -1,
      })
    },
    switchChange(e){
      this.setData({
        ischecked:e.detail.value
      })
      if(e.detail.value && this.data.availableNum == -1){
        this.setData({
          availableNum: 0
        })
      }
    },
    switchInputChange(e){
      this.setData({
        availableNum:e.detail.value
      })
    }
  }
});
