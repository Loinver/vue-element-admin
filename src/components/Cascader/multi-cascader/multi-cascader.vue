<template>
  <div>
    <el-select
      v-model="selectedLabels"
      style="width:100%;height:100%;"
      multiple
      :popper-class="innerPopperClass"
      :filterable="filterable"
      :filter-method="innerFilterMethod"
      :reserve-keyword="reserveKeyword"
      v-bind="$attrs"
      :allow-create="false"
      @remove-tag="removeOne"
      @change="changeLabel"
      @blur="handleBlur"
      @visible-change="visibleChange"
      @focus="handleFocus"
      @clear="handleClear"
    >
      <span v-if="$slots.prefix" slot="prefix">
        <slot name="prefix"></slot>
      </span>
      <template v-if="!isSearching">
        <el-option value="__root">
          <div class="ground" @click.stop>
            <render-list
              :only-last="onlyLast"
              :list="root.childNodes"
              :level="1"
              :active-list="activeList"
              :label-key="labelKey"
              :expand-trigger="expandTrigger"
              @handle-click="handleClick"
              @handle-check="handleCheck"
            ></render-list>
            <template v-for="item in maxLevellist">
              <div
                v-if="item.rendered"
                v-show="activeList.length >= item.id"
                :key="item.id"
                :class="`floor-item floor-position-left-${item.id + 1}`"
              >
                <render-list
                  :only-last="onlyLast"
                  :list="showData[item.id]"
                  :level="item.id + 1"
                  :active-list="activeList"
                  :label-key="labelKey"
                  :expand-trigger="expandTrigger"
                  @handle-click="handleClick"
                  @handle-check="handleCheck"
                ></render-list>
              </div>
            </template>
          </div>
        </el-option>
      </template>
      <template v-if="isSearching">
        <el-option v-for="item in searchResult" :key="getKey(item)" :value="item.showLabel">
          <div style="width:100%;height:100%" @click.stop="selectOne(item)">{{ item.totalLabel }}</div>
        </el-option>
      </template>
    </el-select>
  </div>
</template>

<script>
import TreeStore from "./lib/Tree.js";
import renderList from "./render-list.vue";
import { _findByObj } from "./tool/unit";
export default {
  name: "ElCascaderMulti",
  components: {
    renderList
  },
  props: {
    data: {
      type: Array,
      default: () => [],
      required: true
    },
    value: {
      type: Array,
      default: () => [],
      required: true
    },
    separator: {
      type: String,
      default: "-"
    },
    filterable: {
      type: Boolean,
      default: false
    },
    filterMethod: {
      type: Function,
      default: () => {}
    },
    popperClass: {
      type: String,
      default: ""
    },
    reserveKeyword: {
      type: Boolean,
      default: true
    },
    showLastLabel: {
      type: Boolean,
      default: false
    },
    valueKey: {
      type: String,
      default: "_id"
    },
    labelKey: {
      type: String,
      default: "name"
    },
    childrenKey: {
      type: String,
      default: "children"
    },
    expandTrigger: {
      type: String,
      default: "click"
    },
    onlyLast: {
      type: Boolean,
      default: false
    },
    isTwoDimensionValue: {
      type: Boolean,
      default: true
    },
    showLeafLabel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedLabels: [],
      selectedIds: [],
      selectedNodes: [],
      activeClass: "floor-width-1",
      store: {},
      root: [],
      maxLevellist: [],
      showData: {},
      activeList: [],
      searchText: "",
      searchResult: []
    };
  },
  computed: {
    isSearching() {
      return !(this.searchText.trim() === "");
    },
    innerPopperClass() {
      return `${this.popperClass} multi-cascader ${
        this.isSearching ? "" : "multi-cascader-style"
      } ${this.activeClass}`;
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.init();
      }
    },
    value: {
      deep: true,
      handler() {
        // this.init()
        this.updateSelect(this.value, true, true);
      }
    },
    selectedNodes() {
      this.$emit(
        "change",
        this.selectedNodes.map(
          o => o[this.isTwoDimensionValue ? "_idArr" : this.valueKey]
        )
      );
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    visibleChange(v) {
      this.activeList = [];
      this.activeClass = "floor-width-1";
      if (!v) {
        this.searchText = "";
      }
      this.$emit("visible-change", v);
    },
    handleBlur(e) {
      this.searchText = "";
      this.$emit("blur", e);
    },
    handleFocus(e) {
      this.$emit("focus", e);
    },
    handleClear() {
      this.selectedNodes.forEach(node => {
        node.check(false);
      });
      this.$emit("input", []);
      this.$emit("clear");
    },
    selectOne(item) {
      item.checked = !item.checked;
      this.handleCheck(item);
    },
    changeLabel(v) {
      this.store.nodeList.forEach(node => {
        node.check(v.includes(node.showLabel));
      });
    },
    innerFilterMethod(v) {
      this.searchText = v;
      let tempResult = this.store.nodeList;
      if (v.trim() !== "") {
        this.activeClass = "";
        if (typeof this.filterMethod === "function") {
          this.searchResult = this.filterMethod(tempResult, v);
        } else {
          tempResult = tempResult.filter(o => o.isLeaf);
          tempResult = tempResult.filter(o => o.showLabel.includes(v));
          this.searchResult = tempResult;
        }
      } else {
        this.activeClass = "floor-width-1";
      }
    },
    getKey() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    handleClick(node, levelIndex, level) {
      if (this.maxLevellist[level - 1]) {
        this.maxLevellist[level - 1].rendered = true;
      }
      this.activeClass = `floor-width-${node.isLeaf ? level : level + 1}`;
      const tempList = [...this.activeList];
      if (level < tempList.length) {
        tempList.splice(level);
      }
      tempList[level - 1] = node.id;
      this.showData[level] = node.childNodes;
      this.activeList = tempList;
    },
    handleCheck(node) {
      node.check(node.checked);
      this.selectedIds = this.store.selectedIds;
      this.updateSelect(this.store.selectedIds);
      // this.$emit('input', this.selectedNodes.map(o => o[this.isTwoDimensionValue ? '_idArr' : this.valueKey]))
    },
    removeOne(v) {
      const targetNode = this.selectedNodes.find(o => o.showLabel === v) || {};
      targetNode.checked = false;
      this.handleCheck(targetNode);
      this.$emit("remove-tag", v);
    },
    updateSelect(data = [], needCheckNode = false, setValue = false) {
      const tempSelectedNodes = [];
      const tempSelectedLabels = [];
      const tempSelectedIds = [];
      this.store.nodeList.forEach(node => {
        node.check(node.checked);
      });
      data.forEach(o => {
        let targetNode;

        if (setValue) {
          targetNode =
            _findByObj(this.store.nodeList, {
              [this.isTwoDimensionValue ? "_idArr" : this.valueKey]: o
            }) || {};
          // targetNode = _.find(this.store.nodeList, { [this.isTwoDimensionValue ? '_idArr' : this.valueKey]: o }) || {}
          tempSelectedIds.push(targetNode.id);
        } else {
          targetNode = this.store.nodesMap[o];
          tempSelectedIds.push(o);
        }
        if (targetNode && targetNode.check) {
          needCheckNode && targetNode.check(true);
          tempSelectedNodes.push(targetNode);
          if (this.showLastLabel) {
            tempSelectedLabels.push(targetNode.name);
          } else {
            tempSelectedLabels.push(targetNode.showLabel);
          }
        }
      });
      this.selectedNodes = tempSelectedNodes;
      this.selectedLabels = tempSelectedLabels;
      this.selectedIds = tempSelectedIds;
    },
    init() {
      this.store = new TreeStore({
        data: this.data,
        separator: this.separator,
        valueKey: this.valueKey,
        labelKey: this.labelKey,
        childrenKey: this.childrenKey,
        showLeafLabel: this.showLeafLabel
      });
      this.root = this.store.root;
      this.maxLevellist = Array.from(
        { length: this.store.maxLevel - 1 },
        (v, i) => {
          this.showData[i + 1] = [];
          return {
            id: i + 1,
            rendered: false
          };
        }
      );
      this.updateSelect(this.value, true, true);
    }
  }
};
</script>

<style lang="scss">
@import "@/styles/variables.scss";
.el-select-dropdown.el-popper.is-multiple.multi-cascader {
  .el-select-dropdown__item.selected::after {
    top: 0;
  }
}
.el-select-dropdown.el-popper.is-multiple.multi-cascader-style {
  min-width: 160px !important;
  .el-select-dropdown__list {
    padding: 0;
    position: relative;
  }
  .el-select-dropdown__item {
    padding: 0;
    height: 216px;
    &.hover {
      background-color: #fff;
    }
  }
  .li-style {
    height: 34px;
    padding: 0px 20px;
    box-sizing: border-box;
    list-style: none;
    width: 160px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 34px;
    &:hover {
      background-color: rgba($menuActiveText, 0.1);
    }
    &.selected {
      color: $menuActiveText;
    }
    &.active-li {
      background-color: rgba($menuActiveText, 0.1);
      color: $menuActiveText;
    }
    .li-label-style {
      text-align: left;
      width: 100%;
      box-sizing: border-box;
      padding-right: 15px;
      position: relative;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      .li-label-icon {
        position: absolute;
        right: 0px;
        top: 50%;
        transform: translate(0, -50%);
      }
      .el-checkbox {
        margin-right: 10px;
      }
    }
  }
  .ground {
    width: 100%;
    height: 204px;
    padding: 6px 0;
  }
  .floor-item {
    width: 160px;
    padding: 6px 0;
    border-left: 1px solid #eee;
    position: absolute;
    top: 0;
    height: 204px;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
.multi-cascader-style {
  p {
    margin: 0;
    padding: 0;
  }
  ol,
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}

$width: 160px;
@each $i in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] {
  .multi-cascader-style.floor-width-#{$i} {
    width: $i * $width;
  }
  .multi-cascader-style .floor-position-left-#{$i} {
    left: ($i - 1) * $width;
  }
}
</style>
