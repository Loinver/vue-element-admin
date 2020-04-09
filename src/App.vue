<template>
  <div id="app">
    <div v-if="isIe" id="Tips" class="ie-tips">
      <h1>
        <img
          style="vertical-align: -3px;margin-right: 5px;width: 16px;"
          src="./assets/ic_quanjutishi@2x.png"
          alt
        />您的浏览器不能完全兼容本网站，推荐使用Google Chrome访问。
        <a
          href="https://www.google.cn/intl/zh-CN_ALL/chrome/"
          target="_blank"
        >下载Google Chrome</a>
      </h1>
      <i class="el-icon-close icon-close fs-18"></i>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isIe: !!window.ActiveXObject || "ActiveXObject" in window
    };
  }
};
</script>
<style lang="scss">
.ie-tips {
  width: 100%;
  background-color: rgb(232, 244, 253);
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px;
  z-index: 9999;
  overflow: hidden;
  h1 {
    width: 600px;
    line-height: 35px;
    color: #333;
    margin: auto;
    font-size: 14px;
    font-weight: normal;
  }
  a {
    color: #2196f3;
  }
  .icon-close {
    position: absolute;
    top: 18px;
    right: 40px;
    cursor: pointer;
    transition: all 0.5s;
    &:hover {
      transform: rotate(90deg);
      transform-origin: center center;
    }
  }
}
</style>
