<template>
  <div class="app-container">
    <el-form
      ref="passwordForm"
      :model="passwordForm"
      :rules="rules"
      label-width="100px"
      class="passwordForm"
    >
      <el-form-item label="原密码" prop="oldPass">
        <el-input v-model="passwordForm.oldPass" type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="pass">
        <el-input v-model="passwordForm.pass" type="password" maxlength="30" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input
          v-model="passwordForm.checkPass"
          type="password"
          maxlength="30"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('passwordForm')">提交</el-button>
        <el-button @click="resetForm('passwordForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { changePwd } from "@/api/user";

export default {
  name: "ChangePwd",
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else if (value.length < 6) {
        callback(new Error("请输入6位或以上多种字符组合密码"));
      } else {
        if (this.passwordForm.checkPass !== "") {
          this.$refs.passwordForm.validateField("checkPass");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.passwordForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      passwordForm: {
        oldPass: "",
        pass: "",
        checkPass: ""
      },
      rules: {
        oldPass: [{ required: true, message: "请输入原密码", trigger: "blur" }],
        pass: [{ required: true, validator: validatePass, trigger: "blur" }],
        checkPass: [
          { required: true, validator: validatePass2, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          changePwd(this.passwordForm)
            .then(res => {
              this.$message({
                type: "success",
                message: "修改成功"
              });
              setTimeout(() => {
                this.logout();
              }, 500);
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          console.log("错误提交!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 退出登陆
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    }
  }
};
</script>
<style lang="scss" scoped>
.app-container {
  .passwordForm {
    width: 600px;
  }
}
</style>
