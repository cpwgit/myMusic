// pages/video/video.js
import request from "../../utils/request";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: '', // 导标识
    videoList: [], //视频列表
    videoId: '',
    videoUpdateTime: [],
    isTriggered: false,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航数据
    this.getVideoGroupListData();
  },

  /**
   * 获取导航数据
   */
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,14),
      navId: videoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getVideoList(this.data.navId);
  },

  /**
   * 获取视频列表数据
   */
  async getVideoList(navId){
    let videoListData = await request('/video/group', {id: navId});
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      videoList,
      isTriggered: false //关闭下拉刷新
    })
    // 关闭显示正在加载
    wx.hideLoading();
  },

  /**
   * 点击切换导航的回调
   */
  changeNav(event){
    // this.videoContext && this.videoContext.stop();
    let navId = event.currentTarget.id;
    //let navId = event.currentTarget.dataset.id;
    this.setData({
      navId: navId >>> 0,
      videoList: []
    })

    // 显示正在加载
    wx.showLoading({
      title: '正在加载'
    })
    //动态获当前导航对应的视频数据
    this.getVideoList(this.data.navId);

  },

  /**
   * 点击播放/继续播放的回调
   */
  handlePlay(event){
    /**
     * 需求：
     * 1.在点击播放的事件需要找到上一个播放的视频
     * 2.在播放新的视频之前关闭上一个正在播放的视频
     * 关键：
     * 1.如何找到上一个视频的实例对象
     * 2.如何保证上次播放视频和本次视播放频不是同一个
     * js设计模式---单例模式：
     * 1.需要创建多个对象的场景下，通过一个变量接受，始终保持只有一个对象
     * 2.节省内存空间
     */
    let vid = event.currentTarget.id;

    // 未用image优化: 关闭上一个播放的视频（单例模式）
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid;

    //更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);

    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    }
    this.videoContext.play()
  },

  /**
   * 监听视频播放进度的回调
   */
  handleTimeUpdate(event){
    console.log(event);
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    /**
     * 思路：判断播放时长的videoUpdataTime数组中是否由当期视频的播放记录
     * 1.如果有，在原基础上更新
     * 2.如果没有，直接添加
     */
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if(videoItem){ //之前有
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime状态
    this.setData({
      videoUpdateTime
    })
  },

  /**
   * 视频播放结束调用
   */
  handleEnded(event){
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
    // let videoItem = videoUpdateTime.find(item => item.vid === event.currentTarget.id);
    // videoItem.currentTime = 0;
    this.setData({
      videoUpdateTime
    })
  },

  /**
   * 自定义下拉刷新的回调：scroll-view
   */
  handleRefresher(){
    this.getVideoList(this.data.navId);
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