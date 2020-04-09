<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="container">
        <div class="title-container">
          <ul class="right">
            <li class="title">标题</li>
            <li class="page">登录</li>
          </ul>
        </div>
        <div class="login-content">
          <h5 class="tips" :class="{'v-show':error.show}">
            <i class="icon-tishi" />
            {{ error.text }}
          </h5>
          <el-form-item prop="account">
            <span class="svg-container icon-username" />
            <el-input
              ref="account"
              v-model="loginForm.account"
              placeholder="请输入用户名"
              name="account"
              type="text"
              tabindex="1"
              auto-complete="on"
            />
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container icon-password" />
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="请输入密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item class="verify-code" prop="code">
            <span class="svg-container icon-code" />
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              type="text"
              tabindex="3"
              maxlength="4"
              auto-complete="on"
            />
            <el-button
              type="primary"
              class="get-code"
              :disabled="isDisabled"
              @click="getVerifyCode"
            >{{ isCodeText }}</el-button>
          </el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="btn-submit"
            style="width:280px;"
            @click.native.prevent="handleLogin"
          >登录</el-button>
          <div class="tc">
            <router-link tag="a" class="back-pwd" :to="{path:'/retrievePassword'}">找回密码</router-link>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getcode } from "@/api/user";

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        account: "",
        password: "",
        code: ""
      },
      loginRules: {
        account: [
          {
            required: true,
            trigger: "blur",
            message: "请输入正确的用户名"
          }
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "请输入密码"
          },
          {
            min: 2,
            max: 50,
            message: "密码长度至少6位",
            trigger: "blur"
          }
        ],
        code: [
          {
            required: true,
            trigger: "blur",
            message: "请输入验证码"
          }
        ]
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
      error: {
        show: false,
        text: "验证码错误" // 错误提示文字
      },
      isDisabled: false, // 获取验证码按钮状态
      isCodeText: "获取验证码", // 获取验证码按钮文字
      time: 60 // 短信倒计时
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  mounted() {
    const _self = this;
    document.onkeydown = function(event) {
      const e = event || window.event;
      if (e.keyCode === 13) {
        _self.handleLogin();
      }
    };
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    // 获取短信验证码
    async getVerifyCode() {
      const _this = this;
      if (_this.loginForm.account === "") {
        _this.$refs["loginForm"].validateField("account");
      } else {
        _this.isDisabled = true;
        await getcode({
          loginName: this.loginForm.account
        })
          .then(res => {
            _this.interval = setInterval(function() {
              _this.isCodeText = "（" + _this.time + "秒）后重新发送";
              --_this.time;
              if (_this.time < 0) {
                _this.isCodeText = "重新发送";
                _this.time = 60;
                _this.isDisabled = false;
                clearInterval(_this.interval);
              }
            }, 1000);
          })
          .catch(err => {
            console.log(err);
            this.isDisabled = false;
          });
      }
    },
    // 控制显示密码
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    // 登录
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
              this.error.show = true;
              this.error.text = err.msg;
              setTimeout(() => {
                this.error.show = false;
              }, 3000);
            });
        } else {
          console.log("错误提交!!");
        }
      });
    }
  }
};
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #333333;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
input:-internal-autofill-selected {
  background-color: transparent !important;
}
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    width: 85%;
    height: 48px;
    font-size: 16px;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      color: $light_gray;
      height: 48px;
      vertical-align: middle; // 兼容ie9

      &:-webkit-autofill {
        background-color: transparent;
      }
    }
  }

  .el-form-item__content {
    width: 100%;
    display: flex;
    .el-input {
      width: 100%;
    }
  }
  .el-form-item {
    height: 48px;
    border: 1px solid #dedede;
    border-radius: 5px;
    color: #333333;
    background-color: #fff;
    &.is-error {
      border: 1px solid #ff4444;
      .svg-container {
        background-color: rgba(255, 68, 68, 0.2);
        border-right: 1px solid rgba(255, 68, 68, 0.2);
        &.icon-username {
          background-image: url("../assets/ic_user_red.png");
        }
        &.icon-password {
          background-image: url("../assets/ic_password_red.png");
        }
        &.icon-code {
          background-image: url("../assets/ic_code_red.png");
        }
        background-position: center;
        background-repeat: no-repeat;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #333333;

.login-container {
  min-height: 100%;
  width: 100%;
  background-image: url("../assets/bg.jpg");
  background-position: center center;
  background-size: cover;
  overflow: hidden;
  position: relative;
  background-color: #ee4753;
  .login-form {
    width: 730px;
    height: 720px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -365px;
    margin-top: -360px;
    border-radius: 0 15px 15px 0;
    .container {
      height: calc(100% - 90px);
      background-color: #f4f6ff;
      border-radius: 18px;
      position: relative;
      color: #333333;

      .title-container {
        width: 100%;
        height: 180px;
        background: url("../assets/logo_bg@2x.png") center no-repeat;
        background-size: cover;
        padding: 50px 0 0 152px;
        color: #fff;
        .logo {
          width: 74px;
          height: 80px;
          background-size: cover;
          display: inline-block;
        }
        .right {
          display: inline-block;
          vertical-align: top;
          margin-left: 17px;
          .title {
            font-size: 36px;
            width: 120px;
          }
          .page {
            font-size: 21px;
            margin-top: 15px;
          }
        }
      }
      .login-content {
        padding: 50px 157px;
        .tips {
          width: 100%;
          height: 32px;
          visibility: hidden;
          margin-bottom: 10px;
          background: rgba(255, 68, 68, 0.2);
          font-size: 14px;
          font-weight: normal;
          color: #ff4444;
          line-height: 30px;
          i.icon-tishi {
            width: 15px;
            height: 15px;
            display: inline-block;
            background-image: url("../assets/ic_tishi.png");
            margin-left: 10px;
            margin-right: 5px;
            position: relative;
            top: 3px;
          }
        }
      }
      .verify-code {
        vertical-align: top;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      .get-code {
        width: 250px;
        height: 48px;
        padding: 12px 0px;
        text-align: center;
        background-color: #ee4753;
        border-color: #ee4753;
        border-radius: 0 4px 4px 0;
      }
      .img-verify {
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        width: 128px;
        height: 48px;
      }
      .back-pwd {
        display: inline-block;
        color: #989898;
        font-size: 16px;
        text-decoration: underline;
      }
    }
  }

  .svg-container {
    vertical-align: top;
    width: 48px;
    height: 48px;
    border-right: 1px solid #dedede;
    display: inline-block;
    flex-shrink: 0;
    &.icon-username {
      background-image: url("../assets/ic_user.png");
    }
    &.icon-password {
      background-image: url("../assets/ic_password.png");
    }
    &.icon-code {
      background-image: url("../assets/ic_code.png");
    }
    background-position: center;
    background-repeat: no-repeat;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .btn-submit {
    display: block;
    height: 48px;
    font-size: 16px;
    font-weight: normal;
    margin: 40px auto 30px;
    background-color: #ee4753;
    border-color: #ee4753;
    border-radius: 24px;
  }
}
</style>
