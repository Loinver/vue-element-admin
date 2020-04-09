<template>
  <div class="app-container">
    <el-form
      ref="roleDetail"
      label-position="left"
      label-width="100px"
      :model="roleDetail"
      :rules="roleDetailRules"
    >
      <el-form-item prop="roleName" label="角色名称">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input v-model="roleDetail.roleName" placeholder="请输入角色名" />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item prop="ids" label="操作权限">
        <el-tree
          ref="tree"
          :data="roleList"
          show-checkbox
          default-expand-all
          check-on-click-node
          check-strictly
          node-key="_id"
          highlight-current
          :props="defaultProps"
          @check-change="checkChange"
        />
      </el-form-item>
      <el-form-item label=" " class="mgt-50">
        <el-button type="primary" @click="handleSubmit">保 存</el-button>
        <el-button @click="handleBack">返 回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getRolesTree, getRolesById, saveRole } from "@/api/system/roles";

export default {
  name: "EditPermission",
  data() {
    return {
      pageType: null,
      roleList: [],
      roleDetail: {
        _id: this.$route.params.roleId,
        roleName: "",
        ids: []
      },
      roleDetailRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        ids: [
          {
            type: "array",
            required: true,
            message: "请选择操作权限",
            trigger: "change"
          }
        ]
      },
      defaultProps: {
        children: "children",
        label: "title"
      }
    };
  },
  created() {
    if (this.roleDetail._id) {
      this.pageType = "edit";
      this.getRolesList().then(res => {
        this.getRolesById();
      });
    } else {
      this.getRolesList();
      this.pageType = "add";
    }
  },
  methods: {
    // 获取所有权限列表
    async getRolesList() {
      await getRolesTree()
        .then(res => {
          this.roleList = res.list;
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 根据角色id获取权限列表
    async getRolesById() {
      await getRolesById({ _id: this.roleDetail._id })
        .then(res => {
          this.roleDetail.roleName = res.name;
          res.menuList.map(item => {
            this.roleDetail.ids.push(item._id);
          });
          this.$refs.tree.setCheckedKeys(this.roleDetail.ids);
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 递归获取当前角色的拥有权限
    recursiveGetrole(array) {
      for (let i = 0; i < array.length; i++) {
        const role = array[i];
        if (role.isAuth === 1) {
          this.roleDetail.ids.push(role.menuId);
        }
        if (role.cMenuList) {
          this.recursiveGetrole(role.cMenuList);
        }
      }
      this.$refs.tree.setCheckedKeys(this.roleDetail.ids);
    },
    // 获取选中的权限
    checkChange(data, ifCheck) {
      // 父节点操作
      if (data.pid !== "-1") {
        if (ifCheck === true) {
          // 如果选中，设置父节点为选中
          this.$refs.tree.setChecked(data.pid, true);
        } else {
          // 如果取消选中，检查父节点是否该取消选中（可能仍有子节点为选中状态）
          const parentNode = this.$refs.tree.getNode(data.pid);
          let parentHasCheckedChild = false;
          for (
            let i = 0, parentChildLen = parentNode.childNodes.length;
            i < parentChildLen;
            i++
          ) {
            if (parentNode.childNodes[i].checked === true) {
              parentHasCheckedChild = true;
              break;
            }
          }
          if (!parentHasCheckedChild) {
            this.$refs.tree.setChecked(data.pid, false);
          }
        }
      }

      // 子节点操作
      // 如果取消选中，取消子节点选中
      if (data.children != null && ifCheck === false) {
        for (let j = 0, len = data.children.length; j < len; j++) {
          const childNode = this.$refs.tree.getNode(data.children[j]._id);
          if (childNode.checked === true) {
            this.$refs.tree.setChecked(childNode.data._id, false);
          }
        }
      }
      this.roleDetail.ids = this.$refs.tree.getCheckedKeys();
    },
    // 保存权限
    handleSubmit() {
      this.$refs.roleDetail.validate(valid => {
        if (valid) {
          saveRole(this.roleDetail)
            .then(res => {
              this.$message({
                type: "success",
                message: "保存成功"
              });
              this.handleBack();
              console.log(res);
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          console.log("错误");
        }
      });
    },
    // 返回上一页
    handleBack() {
      const close = document.querySelector(
        ".tags-view-container .tags-view-wrapper .tags-view-item.active .el-icon-close"
      );
      close.click();
      this.$router.replace({
        path: "/roles/list"
      });
    }
  }
};
</script>
