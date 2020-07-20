<template>
  <div v-show="value" class="vue-image-crop-upload">
    <div class="vicp-wrap">
      <div class="vicp-close" @click="off">
        <i class="vicp-icon4"></i>
      </div>

      <div v-show="step == 1" class="vicp-step1">
        <div
          class="vicp-drop-area"
          @dragleave="preventDefault"
          @dragover="preventDefault"
          @dragenter="preventDefault"
          @click="handleClick"
          @drop="handleChange"
        >
          <i v-show="loading !== 1" class="vicp-icon1">
            <i class="vicp-icon1-arrow"></i>
            <i class="vicp-icon1-body"></i>
            <i class="vicp-icon1-bottom"></i>
          </i>
          <span v-show="loading !== 1" class="vicp-hint">{{ lang.hint }}</span>
          <span v-show="!isSupported" class="vicp-no-supported-hint">{{ lang.noSupported }}</span>
          <input
            v-show="false"
            v-if="step === 1"
            ref="fileinput"
            type="file"
            @change="handleChange"
          />
        </div>
        <div v-show="hasError" class="vicp-error">
          <i class="vicp-icon2"></i>
          {{ errorMsg }}
        </div>
        <div class="vicp-operate">
          <el-button @click="off" @mousedown="ripple">{{ lang.btn.off }}</el-button>
        </div>
      </div>

      <div v-if="step === 2" class="vicp-step2">
        <div class="vicp-crop">
          <div v-show="true" class="vicp-crop-left">
            <div class="vicp-img-container">
              <img
                ref="img"
                :src="sourceImgUrl"
                :style="sourceImgStyle"
                class="vicp-img"
                draggable="false"
                @drag="preventDefault"
                @dragstart="preventDefault"
                @dragend="preventDefault"
                @dragleave="preventDefault"
                @dragover="preventDefault"
                @dragenter="preventDefault"
                @drop="preventDefault"
                @touchstart="imgStartMove"
                @touchmove="imgMove"
                @touchend="createImg"
                @touchcancel="createImg"
                @mousedown="imgStartMove"
                @mousemove="imgMove"
                @mouseup="createImg"
                @mouseout="createImg"
              />
              <div class="vicp-img-shade vicp-img-shade-1" :style="sourceImgShadeStyle"></div>
              <div class="vicp-img-shade vicp-img-shade-2" :style="sourceImgShadeStyle"></div>
            </div>

            <div class="vicp-range">
              <input
                type="range"
                :value="scale.range"
                step="1"
                min="0"
                max="100"
                @mousemove="zoomChange"
              />
              <i
                class="vicp-icon5"
                @mousedown="startZoomSub"
                @mouseout="endZoomSub"
                @mouseup="endZoomSub"
              ></i>
              <i
                class="vicp-icon6"
                @mousedown="startZoomAdd"
                @mouseout="endZoomAdd"
                @mouseup="endZoomAdd"
              ></i>
            </div>

            <div v-if="!noRotate" class="vicp-rotate">
              <i @click="rotateImg">↻</i>
            </div>
          </div>
          <div v-show="true" class="vicp-crop-right">
            <div class="vicp-preview">
              <div v-if="!noSquare" class="vicp-preview-item">
                <img :src="createImgUrl" :style="previewStyle" />
                <span>{{ lang.preview }}</span>
              </div>
              <div v-if="!noCircle" class="vicp-preview-item vicp-preview-item-circle">
                <img :src="createImgUrl" :style="previewStyle" />
                <span>{{ lang.preview }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="vicp-operate">
          <el-button @click="setStep(1)" @mousedown="ripple">{{ lang.btn.back }}</el-button>
          <el-button
            type="primary"
            class="vicp-operate-btn"
            @click="prepareUpload"
            @mousedown="ripple"
          >{{ lang.btn.save }}</el-button>
        </div>
      </div>

      <div v-if="step == 3" class="vicp-step3">
        <div class="vicp-upload">
          <span v-show="loading === 1" class="vicp-loading">{{ lang.loading }}</span>
          <div class="vicp-progress-wrap">
            <span v-show="loading === 1" class="vicp-progress" :style="progressStyle"></span>
          </div>
          <div v-show="hasError" class="vicp-error">
            <i class="vicp-icon2"></i>
            {{ errorMsg }}
          </div>
          <div v-show="loading === 2" class="vicp-success">
            <i class="vicp-icon3"></i>
            {{ lang.success }}
          </div>
        </div>
        <div class="vicp-operate">
          <el-button @click="setStep(2)" @mousedown="ripple">{{ lang.btn.back }}</el-button>
          <el-button @click="off" @mousedown="ripple">{{ lang.btn.close }}</el-button>
        </div>
      </div>
      <canvas v-show="false" ref="canvas" :width="width" :height="height"></canvas>
    </div>
  </div>
</template>

<script>
"use strict";
import language from "./language.js";
import mimes from "./mimes.js";
import data2blob from "./data2blob.js";
import effectRipple from "./effectRipple.js";

export default {
  props: {
    // 域，上传文件name，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
    field: {
      type: String,
      default: "avatar"
    },
    // 原名key，类似于id，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
    ki: {
      type: Number,
      default: 0
    },
    // 显示该控件与否
    value: {
      type: Boolean,
      default: true
    },
    // 上传地址
    url: {
      type: String,
      default: ""
    },
    // 其他要上传文件附带的数据，对象格式
    params: {
      type: Object,
      default: null
    },
    // Add custom headers
    headers: {
      type: Object,
      default: null
    },
    // 剪裁图片的宽
    width: {
      type: Number,
      default: 200
    },
    // 剪裁图片的高
    height: {
      type: Number,
      default: 200
    },
    // 不显示旋转功能
    noRotate: {
      type: Boolean,
      default: true
    },
    // 不预览圆形图片
    noCircle: {
      type: Boolean,
      default: false
    },
    // 不预览方形图片
    noSquare: {
      type: Boolean,
      default: false
    },
    // 单文件大小限制   单位m
    maxSize: {
      type: Number,
      default: 1
    },
    // 语言类型
    langType: {
      type: String,
      default: "zh"
    },
    // 语言包
    langExt: {
      type: Object,
      default: null
    },
    // 图片上传格式
    imgFormat: {
      type: String,
      default: "png"
    },
    // 图片背景 jpg情况下生效
    imgBgc: {
      type: String,
      default: "#fff"
    },
    // 是否支持跨域
    withCredentials: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      default: "POST"
    },
    beforeUpload: {
      type: Function,
      default: function() {}
    }
  },
  data() {
    const that = this;
    const { imgFormat, langType, langExt, width, height } = that;
    let isSupported = true;
    const allowImgFormat = ["jpg", "png"];
    const tempImgFormat =
      allowImgFormat.indexOf(imgFormat) === -1 ? "jpg" : imgFormat;
    const lang = language[langType] ? language[langType] : language["en"];
    const mime = mimes[tempImgFormat];
    // 规范图片格式
    that.imgFormat = tempImgFormat;

    if (langExt) {
      Object.assign(lang, langExt);
    }
    if (typeof FormData !== "function") {
      isSupported = false;
    }
    return {
      // 图片的mime
      mime,
      // 语言包
      lang,
      // 浏览器是否支持该控件
      isSupported,
      // 浏览器是否支持触屏事件
      isSupportTouch: Object.prototype.hasOwnProperty.call(
        document,
        "ontouchstart"
      ),
      // 步骤
      step: 1, // 1选择文件 2剪裁 3上传
      // 上传状态及进度
      loading: 0, // 0未开始 1正在 2成功 3错误
      progress: 0,
      // 是否有错误及错误信息
      hasError: false,
      errorMsg: "",
      // 需求图宽高比
      ratio: width / height,
      // 原图地址、生成图片地址
      sourceImg: null,
      sourceImgUrl: "",
      createImgUrl: "",
      // 原图片拖动事件初始值
      sourceImgMouseDown: {
        on: false,
        mX: 0, // 鼠标按下的坐标
        mY: 0,
        x: 0, // scale原图坐标
        y: 0
      },
      // 生成图片预览的容器大小
      previewContainer: {
        width: 100,
        height: 100
      },
      // 原图容器宽高
      sourceImgContainer: {
        // sic
        width: 240,
        height: 184 // 如果生成图比例与此一致会出现bug，先改成特殊的格式吧，哈哈哈
      },
      // 原图展示属性
      scale: {
        zoomAddOn: false, // 按钮缩放事件开启
        zoomSubOn: false, // 按钮缩放事件开启
        range: 1, // 最大100
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        maxWidth: 0,
        maxHeight: 0,
        minWidth: 0, // 最宽
        minHeight: 0,
        naturalWidth: 0, // 原宽
        naturalHeight: 0
      }
    };
  },
  computed: {
    // 进度条样式
    progressStyle() {
      const { progress } = this;
      return {
        width: progress + "%"
      };
    },
    // 原图样式
    sourceImgStyle() {
      const { scale, sourceImgMasking } = this;
      const top = scale.y + sourceImgMasking.y + "px";
      const left = scale.x + sourceImgMasking.x + "px";
      return {
        top,
        left,
        width: scale.width + "px",
        height: scale.height + "px" // 兼容 Opera
      };
    },
    // 原图蒙版属性
    sourceImgMasking() {
      const { width, height, ratio, sourceImgContainer } = this;
      const sic = sourceImgContainer;
      const sicRatio = sic.width / sic.height; // 原图容器宽高比
      let x = 0;
      let y = 0;
      let w = sic.width;
      let h = sic.height;
      let scale = 1;
      if (ratio < sicRatio) {
        scale = sic.height / height;
        w = sic.height * ratio;
        x = (sic.width - w) / 2;
      }
      if (ratio > sicRatio) {
        scale = sic.width / width;
        h = sic.width / ratio;
        y = (sic.height - h) / 2;
      }
      return {
        scale, // 蒙版相对需求宽高的缩放
        x,
        y,
        width: w,
        height: h
      };
    },
    // 原图遮罩样式
    sourceImgShadeStyle() {
      const { sourceImgMasking, sourceImgContainer } = this;
      const sic = sourceImgContainer;
      const sim = sourceImgMasking;
      const w =
        sim.width === sic.width ? sim.width : (sic.width - sim.width) / 2;
      const h =
        sim.height === sic.height ? sim.height : (sic.height - sim.height) / 2;
      return {
        width: w + "px",
        height: h + "px"
      };
    },
    previewStyle() {
      // const { width, height, ratio, previewContainer } = this;
      const { ratio, previewContainer } = this;
      const pc = previewContainer;
      let w = pc.width;
      let h = pc.height;
      const pcRatio = w / h;
      if (ratio < pcRatio) {
        w = pc.height * ratio;
      }
      if (ratio > pcRatio) {
        h = pc.width / ratio;
      }
      return {
        width: w + "px",
        height: h + "px"
      };
    }
  },
  watch: {
    value(newValue) {
      if (newValue && this.loading !== 1) {
        this.reset();
      }
    }
  },
  created() {
    // 绑定按键esc隐藏此插件事件
    document.addEventListener("keyup", e => {
      if (this.value && (e.key === "Escape" || e.keyCode === 27)) {
        this.off();
      }
    });
  },
  methods: {
    // 点击波纹效果
    ripple(e) {
      effectRipple(e);
    },
    // 关闭控件
    off() {
      setTimeout(() => {
        this.$emit("input", false);
        if (this.step === 3 && this.loading === 2) {
          this.setStep(1);
        }
      }, 200);
    },
    // 设置步骤
    setStep(no) {
      // 延时是为了显示动画效果呢，哈哈哈
      setTimeout(() => {
        this.step = no;
      }, 200);
    },

    /* 图片选择区域函数绑定
		 ---------------------------------------------------------------*/
    preventDefault(e) {
      e.preventDefault();
      return false;
    },
    handleClick(e) {
      if (this.loading !== 1) {
        if (e.target !== this.$refs.fileinput) {
          e.preventDefault();
          if (document.activeElement !== this.$refs) {
            this.$refs.fileinput.click();
          }
        }
      }
    },
    handleChange(e) {
      e.preventDefault();
      if (this.loading !== 1) {
        const files = e.target.files || e.dataTransfer.files;
        this.reset();
        if (this.checkFile(files[0])) {
          this.setSourceImg(files[0]);
        }
      }
    },
    /* ---------------------------------------------------------------*/
    // 检测选择的文件是否合适
    checkFile(file) {
      const that = this;
      const { lang, maxSize } = that;
      // 仅限图片
      if (file.type.indexOf("image") === -1) {
        that.hasError = true;
        that.errorMsg = lang.error.onlyImg;
        return false;
      }
      // 超出大小
      if (file.size / 1024 / 1024 > maxSize) {
        that.hasError = true;
        that.errorMsg = lang.error.outOfSize + maxSize + "mb";
        return false;
      }
      return true;
    },
    // 重置控件
    reset() {
      const that = this;
      that.loading = 0;
      that.hasError = false;
      that.errorMsg = "";
      that.progress = 0;
    },
    // 设置图片源
    setSourceImg(file) {
      this.$emit("src-file-set", file.name, file.type, file.size);
      const that = this;
      const fr = new FileReader();
      fr.onload = function(e) {
        that.sourceImgUrl = fr.result;
        that.startCrop();
      };
      fr.readAsDataURL(file);
    },
    // 剪裁前准备工作
    startCrop() {
      const that = this;
      const {
        width,
        height,
        ratio,
        scale,
        sourceImgUrl,
        sourceImgMasking,
        lang
      } = that;
      const sim = sourceImgMasking;
      const img = new Image();
      img.src = sourceImgUrl;
      img.onload = function() {
        const nWidth = img.naturalWidth;
        const nHeight = img.naturalHeight;
        const nRatio = nWidth / nHeight;
        let w = sim.width;
        let h = sim.height;
        let x = 0;
        let y = 0;
        // 图片像素不达标
        if (nWidth < width || nHeight < height) {
          that.hasError = true;
          that.errorMsg = lang.error.lowestPx + width + "*" + height;
          return false;
        }
        if (ratio > nRatio) {
          h = w / nRatio;
          y = (sim.height - h) / 2;
        }
        if (ratio < nRatio) {
          w = h * nRatio;
          x = (sim.width - w) / 2;
        }
        scale.range = 0;
        scale.x = x;
        scale.y = y;
        scale.width = w;
        scale.height = h;
        scale.minWidth = w;
        scale.minHeight = h;
        scale.maxWidth = nWidth * sim.scale;
        scale.maxHeight = nHeight * sim.scale;
        scale.naturalWidth = nWidth;
        scale.naturalHeight = nHeight;
        that.sourceImg = img;
        that.createImg();
        that.setStep(2);
      };
    },
    // 鼠标按下图片准备移动
    imgStartMove(e) {
      e.preventDefault();
      // 支持触摸事件，则鼠标事件无效
      if (this.isSupportTouch && !e.targetTouches) {
        return false;
      }
      const et = e.targetTouches ? e.targetTouches[0] : e;
      const { sourceImgMouseDown, scale } = this;
      const simd = sourceImgMouseDown;
      simd.mX = et.screenX;
      simd.mY = et.screenY;
      simd.x = scale.x;
      simd.y = scale.y;
      simd.on = true;
    },
    // 鼠标按下状态下移动，图片移动
    imgMove(e) {
      e.preventDefault();
      // 支持触摸事件，则鼠标事件无效
      if (this.isSupportTouch && !e.targetTouches) {
        return false;
      }
      const et = e.targetTouches ? e.targetTouches[0] : e;
      const {
        sourceImgMouseDown: { on, mX, mY, x, y },
        scale,
        sourceImgMasking
      } = this;
      const sim = sourceImgMasking;
      const nX = et.screenX;
      const nY = et.screenY;
      const dX = nX - mX;
      const dY = nY - mY;
      let rX = x + dX;
      let rY = y + dY;
      if (!on) return;
      if (rX > 0) {
        rX = 0;
      }
      if (rY > 0) {
        rY = 0;
      }
      if (rX < sim.width - scale.width) {
        rX = sim.width - scale.width;
      }
      if (rY < sim.height - scale.height) {
        rY = sim.height - scale.height;
      }
      scale.x = rX;
      scale.y = rY;
    },
    // 顺时针旋转图片
    rotateImg(e) {
      const {
        sourceImg,
        scale: { naturalWidth, naturalHeight }
      } = this;
      const width = naturalHeight;
      const height = naturalWidth;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, width, height);

      ctx.translate(width, 0);
      ctx.rotate((Math.PI * 90) / 180);

      ctx.drawImage(sourceImg, 0, 0, naturalWidth, naturalHeight);
      const imgUrl = canvas.toDataURL(mimes["png"]);

      this.sourceImgUrl = imgUrl;
      this.startCrop();
    },

    // 按钮按下开始放大
    startZoomAdd(e) {
      const that = this;
      const { scale } = that;
      scale.zoomAddOn = true;

      function zoom() {
        if (scale.zoomAddOn) {
          const range = scale.range >= 100 ? 100 : ++scale.range;
          that.zoomImg(range);
          setTimeout(function() {
            zoom();
          }, 60);
        }
      }
      zoom();
    },
    // 按钮松开或移开取消放大
    endZoomAdd(e) {
      this.scale.zoomAddOn = false;
    },
    // 按钮按下开始缩小
    startZoomSub(e) {
      const that = this;
      const { scale } = that;
      scale.zoomSubOn = true;

      function zoom() {
        if (scale.zoomSubOn) {
          const range = scale.range <= 0 ? 0 : --scale.range;
          that.zoomImg(range);
          setTimeout(function() {
            zoom();
          }, 60);
        }
      }
      zoom();
    },
    // 按钮松开或移开取消缩小
    endZoomSub(e) {
      const { scale } = this;
      scale.zoomSubOn = false;
    },
    zoomChange(e) {
      this.zoomImg(e.target.value);
    },
    // 缩放原图
    zoomImg(newRange) {
      const that = this;
      // const { sourceImgMasking, sourceImgMouseDown, scale } = this;
      const { sourceImgMasking, scale } = this;
      // const {
      //   maxWidth,
      //   maxHeight,
      //   minWidth,
      //   minHeight,
      //   width,
      //   height,
      //   x,
      //   y,
      //   range
      // } = scale;
      const {
        maxWidth,
        maxHeight,
        minWidth,
        minHeight,
        width,
        height,
        x,
        y
      } = scale;
      const sim = sourceImgMasking;
      // 蒙版宽高
      const sWidth = sim.width;
      const sHeight = sim.height;
      // 新宽高
      const nWidth = minWidth + ((maxWidth - minWidth) * newRange) / 100;
      const nHeight = minHeight + ((maxHeight - minHeight) * newRange) / 100;
      // 新坐标（根据蒙版中心点缩放）
      let nX = sWidth / 2 - (nWidth / width) * (sWidth / 2 - x);
      let nY = sHeight / 2 - (nHeight / height) * (sHeight / 2 - y);

      // 判断新坐标是否超过蒙版限制
      if (nX > 0) {
        nX = 0;
      }
      if (nY > 0) {
        nY = 0;
      }
      if (nX < sWidth - nWidth) {
        nX = sWidth - nWidth;
      }
      if (nY < sHeight - nHeight) {
        nY = sHeight - nHeight;
      }

      // 赋值处理
      scale.x = nX;
      scale.y = nY;
      scale.width = nWidth;
      scale.height = nHeight;
      scale.range = newRange;
      setTimeout(function() {
        if (scale.range === newRange) {
          that.createImg();
        }
      }, 300);
    },
    // 生成需求图片
    createImg(e) {
      const that = this;
      const {
        imgFormat,
        imgBgc,
        mime,
        sourceImg,
        scale: { x, y, width, height },
        sourceImgMasking: { scale }
      } = that;
      const canvas = that.$refs.canvas;
      const ctx = canvas.getContext("2d");
      if (e) {
        // 取消鼠标按下移动状态
        that.sourceImgMouseDown.on = false;
      }
      canvas.width = that.width;
      canvas.height = that.height;
      ctx.clearRect(0, 0, that.width, that.height);

      if (imgFormat === "png") {
        ctx.fillStyle = "rgba(0,0,0,0)";
      } else {
        // 如果jpg 为透明区域设置背景，默认白色
        ctx.fillStyle = imgBgc;
      }
      ctx.fillRect(0, 0, that.width, that.height);

      ctx.drawImage(
        sourceImg,
        x / scale,
        y / scale,
        width / scale,
        height / scale
      );
      that.createImgUrl = canvas.toDataURL(mime);
    },
    prepareUpload() {
      const { url, createImgUrl, field, ki } = this;
      this.$emit("crop-success", createImgUrl, field, ki);
      if (typeof url === "string" && url) {
        this.upload();
      } else {
        this.off();
      }
    },
    // 上传图片
    upload() {
      const that = this;
      const {
        lang,
        imgFormat,
        mime,
        url,
        params,
        headers,
        field,
        ki,
        createImgUrl,
        withCredentials,
        method
      } = this;
      const fmData = new FormData();
      fmData.append(
        field,
        data2blob(createImgUrl, mime),
        field + "." + imgFormat
      );

      // 添加其他参数
      if (typeof params === "object" && params) {
        Object.keys(params).forEach(k => {
          fmData.append(k, params[k]);
        });
      }

      // 监听进度回调
      const uploadProgress = function(event) {
        if (event.lengthComputable) {
          that.progress = (100 * Math.round(event.loaded)) / event.total;
        }
      };

      // 上传文件
      that.reset();
      that.loading = 1;
      that.setStep(3);
      new Promise(function(resolve, reject) {
        const client = new XMLHttpRequest();
        client.open(method, url, true);
        client.withCredentials = withCredentials;
        client.onreadystatechange = function() {
          if (this.readyState !== 4) {
            return;
          }
          if (this.status === 200 || this.status === 201) {
            resolve(JSON.parse(this.responseText));
          } else {
            reject(this.status);
          }
        };
        client.upload.addEventListener("progress", uploadProgress, false); // 监听进度
        // 设置header
        if (typeof headers === "object" && headers) {
          Object.keys(headers).forEach(k => {
            client.setRequestHeader(k, headers[k]);
          });
        }
        client.send(fmData);
      }).then(
        // 上传成功
        function(resData) {
          if (that.value) {
            that.loading = 2;
            that.$emit("crop-upload-success", resData, field, ki);
            that.setStep(1)
          }
        },
        // 上传失败
        function(sts) {
          if (that.value) {
            that.loading = 3;
            that.hasError = true;
            that.errorMsg = lang.fail;
            that.$emit("crop-upload-fail", sts, field, ki);
          }
        }
      );
    }
  }
};
</script>

<style lang='scss' src="./upload.scss">
</style>
