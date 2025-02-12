<template>
  <div class="fs-toolbar">
    <template v-for="(item, key) of computedButtons" :key="key">
      <fs-button v-if="item.show !== false" v-bind="item" @click="item.click()" />
    </template>
    <fs-table-columns-filter
      v-if="columns"
      ref="columnsFilterRef"
      :columns="columns"
      :storage="storage"
      @update:columns="$emit('update:columns', $event)"
    />
  </div>
</template>

<script>
import FsTableColumnsFilter from "./fs-table-columns-filter/component.vue";
import FsButton from "../basic/fs-button";
import _ from "lodash-es";
import { ref, computed, getCurrentInstance } from "vue";
import traceUtil from "../../utils/util.trace";
import { useI18n } from "../../locale";
import FsSlotRender from "../render/fs-slot-render";
import { Constants } from "../../utils/util.constants";

/**
 * 工具条
 */
export default {
  name: "FsToolbar",
  // eslint-disable-next-line vue/no-unused-components
  components: { FsTableColumnsFilter, FsButton, FsSlotRender },
  props: {
    /**
     * 按钮配置
     *{
     *   search:{}, 查询
     *   refresh:{}, 刷新
     *   compact:{}, 紧凑模式
     *   export:{}, 导出
     *   columns:{} 列设置
     *}
     **/
    buttons: {
      type: Object
    },
    /**
     * 当前是否显示查询。
     * 注意：如果要隐藏search，请配置crudOptions.search.show=false
     */
    search: {
      type: Boolean
    },
    /**
     * 当前是否紧凑模式
     */
    compact: {
      type: Boolean,
      default: true
    },
    /**
     * 列配置
     */
    columns: {
      type: Array,
      default: undefined
    },
    /**
     * 是否保存用户列设置
     * 传string则表示传入缓存的主key
     */
    storage: {
      type: [String, Boolean],
      default: true
    },
    /**
     * 插槽
     */
    slots: {}
  },
  emits: ["refresh", "update:search", "update:compact", "update:columns", "export"],
  setup(props, ctx) {
    const { t } = useI18n();
    const columnsFilterRef = ref();
    traceUtil.trace("fs-toolbar");
    const { proxy } = getCurrentInstance();
    const computedButtons = computed(() => {
      const defaultButtons = {
        refresh: {
          type: "primary",
          icon: proxy.$fsui.icons.refresh,
          title: t("fs.toolbar.refresh.title"), // '刷新',
          circle: true,
          click: () => {
            ctx.emit("refresh");
          }
        },
        search: {
          type: "primary",
          icon: proxy.$fsui.icons.search,
          title: t("fs.toolbar.search.title"), // '查询显示',
          circle: true,
          click: () => {
            ctx.emit("update:search", !props.search);
          }
        },
        compact: {
          type: "primary",
          icon: proxy.$fsui.icons.compact,
          title: t("fs.toolbar.compact.title"), // '紧凑模式',
          circle: true,
          click: () => {
            ctx.emit("update:compact", !props.compact);
          }
        },
        export: {
          show: false,
          type: "primary",
          icon: proxy.$fsui.icons.export,
          title: t("fs.toolbar.export.title"), // '导出',
          circle: true,
          click: () => {
            ctx.emit("export");
          }
        },
        columns: {
          type: "primary",
          icon: proxy.$fsui.icons.columnsFilter,
          title: t("fs.toolbar.columns.title"), // '列设置',
          circle: true,
          click: () => {
            columnsFilterRef.value.start();
          }
        }
      };

      _.merge(defaultButtons, props.buttons);
      if (defaultButtons.search) {
        defaultButtons.search.type = props.search ? "primary" : "default";
      }
      if (defaultButtons.compact) {
        defaultButtons.compact.type = props.compact ? "primary" : "default";
      }

      let sortArr = [];
      for (let defaultButtonsKey in defaultButtons) {
        sortArr.push({
          ...defaultButtons[defaultButtonsKey],
          _key: defaultButtonsKey
        });
      }
      sortArr = _.sortBy(sortArr, (item) => {
        return item.order ?? Constants.orderDefault;
      });

      const sortedButtons = {};

      sortArr.forEach((item) => {
        let _key = item._key;
        delete item._key;
        sortedButtons[_key] = item;
      });
      return sortedButtons;
    });
    return {
      columnsFilterRef,
      computedButtons
    };
  }
};
</script>
<style lang="less">
.fs-toolbar {
  display: flex;
  .fs-button {
    margin-left: 5px;
  }
}
</style>
