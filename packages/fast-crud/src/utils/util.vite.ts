import { defineAsyncComponent } from "vue";
import _ from "lodash-es";

function createAsyncComponent(es) {
  return defineAsyncComponent({
    loader: es,
    onError(error, retry, fail, attempts) {
      console.error("load error", error);
      if (error.message.match(/fetch/) && attempts <= 3) {
        // 请求发生错误时重试，最多可尝试 3 次
        retry();
      } else {
        // 注意，retry/fail 就像 promise 的 resolve/reject 一样：
        // 必须调用其中一个才能继续错误处理。
        fail();
      }
    }
  });
}
function installAsyncComponent(app, name, es, options) {
  const asyncComponent = createAsyncComponent(es);
  app.component(name, asyncComponent, options);
}

function installAsyncComponents(app, modules, excludes, pickNameExp, transform) {
  const imports = transformFromGlob(modules, pickNameExp, transform);
  _.forEach(imports, (item, key) => {
    if (excludes && excludes.indexOf(key) != -1) {
      return;
    }
    installAsyncComponent(app, key, item, null);
  });
}

function installSyncComponents(app, modules, excludes, pickNameExp, transform) {
  const imports = transformFromGlob(modules, pickNameExp, transform);
  _.forEach(imports, (item, key) => {
    if (excludes && excludes.indexOf(key)) {
      return;
    }
    app.component(key, item.default);
  });
}
function transformFromGlob(modules, pickNameExp, transform) {
  const components = {};
  if (pickNameExp == null) {
    pickNameExp = /.*\/(.+).(vue|jsx|tsx)/;
  }
  _.forEach(modules, (item, key) => {
    // 从路径提取组件名称
    const result = key.match(pickNameExp);
    if (result?.length <= 1) {
      console.error(`"${key}" can't pick a component name,this component can't register`);
      return;
    }
    let name = result[1];

    //将组件名称从 fs-uploader-form 转换为 FsUploaderForm
    name = _.camelCase(name);
    name = _.upperFirst(name);

    if (transform) {
      item = transform(item);
    }
    components[name] = item;
  });
  return components;
}

function loadAsyncComponentFromGlob(modules) {
  const imports = transformFromGlob(modules);
  const map = {};
  _.forEach(imports, (item, key) => {
    map[key] = createAsyncComponent(item);
  });
  return map;
}

function loadComponentFromGlob(modules) {
  const imports = transformFromGlob(modules);
  const map = {};
  _.forEach(imports, (item, key) => {
    map[key] = item.default;
  });
  return map;
}

export default {
  transformFromGlob,
  installAsyncComponents,
  installSyncComponents,
  createAsyncComponent,
  loadAsyncComponentFromGlob,
  loadComponentFromGlob
};
