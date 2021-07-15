import PubSub from "pubsub-js"
import moment from "moment";
import request from "../../utils/request"
var appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 标识音乐是否播放
    song: {}, // 歌曲详情对象
    musicId: '', //  音乐id
    musicLink: '', //音乐链接
    currentTime: '00:00', // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 传入的options过长会被截取

    let musicId = options.musicId;
    this.setData({
      musicId: musicId
    })
    //console.log(musicId);
    // 获取音乐详情
    this.getMusicInfo(musicId);

    // 判断是否有音乐播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay: true
      })
    }
    /**
     * 处理系统播放和页面播放状态不一致
     * 1.通过控制音频实例 backgroundAudioManager
     */
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });

    /**
     * 监听音乐自然播放结束
     */
    this.backgroundAudioManager.onEnded(()=> {
      // 自动切换下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next');
      // 将实施进度条长度还原成0, 实时时间还原成0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00',
      })
    })
    /**
     * 监听音乐实时播放进度
     */
    this.backgroundAudioManager.onTimeUpdate(()=> {
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime * 450 / this.backgroundAudioManager.duration;
      this.setData({
        currentTime,
        currentWidth
      })
    })


  },
  /**
   * 修改播放状态
   */
  changePlayState(isPlay){
    this.setData({
      isPlay
    })
    appInstance.globalData.isMusicPlay = isPlay;
  },

  /**
   * 获取音乐详情
   */
  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids: musicId});
    // songData.songs[0].dt   单位:ms
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      durationTime

    })
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  /**
   * 处理音乐播放 播放/暂停的回调
   */
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    this.setData({
      isPlay: isPlay
    })
    let {musicId, musicLink} = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },

  /**
   * 控制音乐播放/暂停的功能
   */
  async musicControl(isPlay, musicId, musicLink){
    if(isPlay){ // 音乐播放
      if (!musicLink){
        let musicLinkData = await request('/song/url',{id: musicId});
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink,
        })
      }
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    }else { // 音乐暂停
      this.backgroundAudioManager.pause();
    }
  },

  /**
   * 点击切歌回调
   */
  handleSwitch(event) {
    let type = event.currentTarget.id;
    //console.log(type)
    // 订阅来自recommendDetail的musicId
    this.backgroundAudioManager.stop();
    PubSub.subscribe('musicId', (msg, musicId) =>{
      //console.log(musicId);
      // 获取音乐详情
      this.getMusicInfo(musicId);
      // 自动播放当前音乐
      this.musicControl(true, musicId);
      //取消订阅
      PubSub.unsubscribe('musicId');
    })

    // 发布消息数据给recommendSong
    PubSub.publish('switchType', type)
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