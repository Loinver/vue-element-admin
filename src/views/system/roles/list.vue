<template>
  <div class="app-container">
    <p class="tr">
      <el-button type="primary" @click="handleRoles('add')">添加角色</el-button>
    </p>
    <el-table
      v-loading="listLoading"
      class="mgt-15"
      :data="rolesList"
      width="100%"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="name" label="角色名称" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.id!==0"
            type="text"
            @click="handleRoles('edit',scope.row._id)"
          >编辑</el-button>
          <span v-else class="table-span">不允许操作</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :page-sizes="[10, 20, 50]"
      :page-size="pageSize"
      :hide-on-single-page="true"
      background
      class="mgt-10 tr"
      layout="total,sizes, prev, pager, next"
      :total="total"
      @size-change="handleChangeSize"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { getRolesList } from "@/api/system/roles";
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      total: 0,
      page: 1,
      pageSize: 10,
      listLoading: true
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取角色列表
    async getList() {
      const params = {
        page: this.page,
        pageSize: this.pageSize
      };
      await getRolesList(params)
        .then(res => {
          this.rolesList = res.data.list;
          this.listLoading = false;
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 改变每页条数
    handleChangeSize(val) {
      this.pageSize = val;
      this.getList();
    },
    // 当前页数
    handleCurrentChange(val) {
      this.page = val;
      this.getList();
    },
    // 跳转操作
    handleRoles(type, id) {
      console.log(id);
      switch (type) {
        case "add":
          this.$router.replace({
            path: `/roles/add`
          });
          break;
        case "edit":
          this.$router.replace({
            path: `/roles/edit/${id}`,
            params: {
              roleId: id
            }
          });
          break;
        default:
      }
    }
  }
};
</script>
