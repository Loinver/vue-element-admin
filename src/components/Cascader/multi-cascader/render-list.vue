<template>
  <ul style="width:160px;max-height:100%;overflow-x: hidden;overflow-y: auto;">
    <li class="li-style">
      <p v-toolTip class="li-label-style">
        <span @click.stop>
          <el-checkbox v-model="allCheck" @change="handleCheckPeer($event, list)"></el-checkbox>
        </span>
        <span style="margin-left:5px">全部</span>
      </p>
    </li>
    <li
      v-for="(node, nodeIndex) in list"
      :key="guid(node)"
      class="li-style"
      :class="{'active-li': activeList[level - 1] === node.id}"
      @click="handleClick(node, nodeIndex, level)"
      @mousemove="handleMouseMove(node, nodeIndex, level)"
      @mouseout="handleMouseOut"
    >
      <p v-toolTip class="li-label-style">
        <span v-show="!onlyLast || (onlyLast && node.isLeaf)" @click.stop>
          <el-checkbox
            v-model="node.checked"
            :disabled="node.disabled"
            @change="handleCheck($event, node)"
          ></el-checkbox>
        </span>
        <span style="margin-left:5px">{{ node[labelKey] }}</span>
        <i
          v-if="node.childNodes && node.childNodes.length > 0"
          class="li-label-icon el-icon-arrow-right"
        ></i>
      </p>
    </li>
  </ul>
</template>

<script>
export default {
  directives: {
    toolTip: {
      inserted: function(el) {
        el.title = el.scrollWidth > el.offsetWidth ? el.innerText : "";
      }
    }
  },
  props: {
    activeList: {
      type: Array,
      default: () => []
    },
    list: {
      type: Array,
      default: () => []
    },
    level: {
      type: [Number, String],
      default: 0
    },
    labelKey: {
      type: String,
      default: "label"
    },
    expandTrigger: {
      type: String,
      default: "click"
    },
    onlyLast: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      allCheck: false,
      oldValue: {
        oldNode: null,
        oldLevelIndex: null,
        oldLevel: null
      }
    };
  },
  watch: {
    list: {
      deep: true,
      handler() {
        this.isCheckedFunc();
      }
    },
    activeList: {
      deep: true,
      handler() {
        this.isCheckedFunc();
      }
    }
  },
  mounted() {
    this.isCheckedFunc();
  },
  methods: {
    handleMouseOut() {
      this.oldValue = {
        oldNode: null,
        oldLevelIndex: null,
        oldLevel: null
      };
    },
    // mouseEnter会一直触发，然后阻止了click事件，改为mouseMove事件
    handleMouseMove(node, levelIndex, level) {
      if (this.expandTrigger !== "hover") {
        return false;
      }
      const { oldNode, oldLevelIndex, oldLevel } = this.oldValue;
      if (
        node === oldNode &&
        oldLevelIndex === levelIndex &&
        oldLevel === level
      ) {
        return false;
      } else {
        this.oldValue = {
          oldNode: node,
          oldLevelIndex: levelIndex,
          oldLevel: level
        };
      }
      this.$emit("handle-click", node, levelIndex, level);
    },
    handleClick(node, levelIndex, level) {
      if (this.expandTrigger === "click") {
        this.$emit("handle-click", node, levelIndex, level);
      }
    },
    // 点击全部 选中同级
    handleCheckPeer(v, nodeList) {
      nodeList.forEach(node => {
        node.check(v);
      });
      this.$emit("handle-check", nodeList[nodeList.length - 1]);
    },
    handleCheck(v, node) {
      node.checked = v;
      this.$emit("handle-check", node);
    },
    // 判断当前级是否全选
    isCheckedFunc() {
      const isCheckedList = this.list.map(function(item) {
        return item.checked;
      });
      if (isCheckedList.indexOf(false) === -1) {
        this.allCheck = true;
      } else {
        this.allCheck = false;
      }
    },
    guid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }
};
</script>

<style>
</style>
