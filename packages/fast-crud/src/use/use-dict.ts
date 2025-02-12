import { getCurrentInstance, computed, reactive, watch, inject } from "vue";
import _ from "lodash-es";
import { uiContext } from "../ui";
export function useDict(props, ctx, vModel = "modelValue") {
  const ui = uiContext.get();
  let dict = props.dict;
  if (dict) {
    if (dict.prototype) {
      dict.clear();
      dict = reactive(_.cloneDeep(props.dict));
    }
  }

  const computedOptions = computed(() => {
    let options: any = [];
    if (props.options) {
      options = props.options;
    } else if (dict && dict.data != null) {
      options = dict.data;
    }

    if (ui.type === "naive") {
      const newOptions: any = [];
      for (const option of options) {
        newOptions.push({
          ...option,
          value: getValue(option),
          label: getLabel(option)
        });
      }
      return newOptions;
    }
    return options;
  });

  function getDict() {
    return dict;
  }

  const getScope: Function = inject("get:scope", function () {});

  function getCurrentScope() {
    const value = props[vModel];
    return {
      ...getScope(),
      componentRef: proxy,
      value
    };
  }
  // @ts-ignore
  const { proxy } = getCurrentInstance();
  const loadDict = async (reload = false) => {
    if (!dict) {
      return;
    }
    if (dict.loading) {
      return;
    }

    const scope = getCurrentScope();
    if (reload) {
      await dict.reloadDict(scope);
      return;
    }
    await dict.loadDict(scope);
  };
  loadDict();

  const reloadDict = async () => {
    await loadDict(true);
  };

  const watchValue = () => {
    if (dict == null) {
      return;
    }
    if (!dict.prototype && !dict.cloneable) {
      //如果是单例，则不watch
      return;
    }
    //for values-format
    watch(
      () => {
        return props[vModel];
      },
      () => {
        reloadDict();
      }
    );
  };

  const watchDictData = () => {
    watch(
      () => {
        return dict?.data;
      },
      () => {
        if (ctx.attrs.onDictChange) {
          const scope = getCurrentScope();
          ctx.attrs.onDictChange({ dict, ...scope });
        }
      },
      {
        immediate: true
      }
    );
  };
  watchDictData();

  const getDictData = () => {
    return getDict()?.data;
  };

  const getPropValue = (item, prop) => {
    let attr = prop;
    if (getDict()) {
      attr = getDict()[prop];
    }
    return item[attr];
  };
  const removePropValue = (item, prop) => {
    let attr = prop;
    if (getDict()) {
      attr = getDict()[prop];
    }
    delete item[attr];
  };
  const getValue = (item) => {
    return getPropValue(item, "value");
  };

  const getChildren = (item) => {
    return getPropValue(item, "children");
  };
  const getLabel = (item) => {
    return getPropValue(item, "label");
  };
  const getColor = (item) => {
    return getPropValue(item, "color");
  };

  return {
    computedOptions,
    loadDict,
    reloadDict,
    getDictData,
    getDict,
    watchValue,
    getValue,
    getLabel,
    getChildren,
    getColor,
    removePropValue
  };
}
