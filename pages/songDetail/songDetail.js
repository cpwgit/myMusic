// pages/songDetail/songDetail.js
import request from "../../utils/request";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 标识音乐是否播放
    song: {}, // 歌曲详情对象
    musicId: '', //  音乐id
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
    this.getMusicInfo(musicId);

  },
  /**
   * 获取音乐详情
   */
  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids: musicId});
    this.setData({
      song: songData.songs[0]
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

    this.musicControl(isPlay, this.data.musicId);
  },

  /**
   * 控制音乐播放/暂停的功能
   */
  async musicControl(isPlay, musicId){
    let backgroundAudioManager = wx.getBackgroundAudioManager();
    if(isPlay){ // 音乐播放
      // 创建控制音乐播放实例
      let musicLinkData = await request('/song/url',{id: musicId});
      let musicLink = musicLinkData.data[0].url;
      //let backgroundAudioManager = wx.getBackgroundAudioManager();

      backgroundAudioManager.src = musicLink;
      backgroundAudioManager.title = this.data.song.name
    }else { // 音乐暂停
      backgroundAudioManager.pause();
    }
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