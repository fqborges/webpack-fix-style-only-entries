const NAME = "webpack-fix-style-only-entries";

class WebpackFixStyleOnlyEntriesPlugin {
  constructor(options) {
    this.apply = this.apply.bind(this);

    options = options || {};
    let extensions = options.extensions || ["less", "scss", "css"];
    this.extensions = extensions.map(e => (e[0] === "." ? e : "." + e));
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(NAME, compilation => {
      compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
        if (chunk.hasEntryModule()) {
          let resources;
          if (typeof chunk.entryModule.resource == "string") {
            resources = [chunk.entryModule.resource];
          } else {
            if (
              chunk.entryModule.dependencies &&
              chunk.entryModule.dependencies.length
            ) {
              const modules = chunk.entryModule.dependencies.map(
                dep => dep.module
              );
              resources = modules.map(m => m.resource);
            }
          }

          if (resources) {
            if (
              resources.every(resource =>
                this.extensions.find(ext => resource.endsWith(ext))
              )
            ) {
              if (file.endsWith(".js")) {
                console.log("removing js from style only module: " + file);
                chunk.files = chunk.files.filter(f => f != file);
                delete compilation.assets[file];
              }
            }
          }
        }
      });
    });
  }
}

module.exports = WebpackFixStyleOnlyEntriesPlugin;
