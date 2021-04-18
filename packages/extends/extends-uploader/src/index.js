import FsUploaderType from "./type";
export { FsUploaderType };
import components from "./index.components";
export default {
  install(app, options) {
    app.use(FsUploaderType, options);
    app.use(components);
  }
};
