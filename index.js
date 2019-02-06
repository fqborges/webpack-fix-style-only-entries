const NAME = "webpack-fix-style-only-entries";

const defaultOptions = {
  extensions: ["less", "scss", "css"],
  silent: false,
};

class WebpackFixStyleOnlyEntriesPlugin {
  constructor(options) {
    this.apply = this.apply.bind(this);

    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    const extensionsWithDots = this.options.extensions.map(e =>
      e[0] === "." ? e : "." + e
    );

    compiler.hooks.compilation.tap(NAME, compilation => {
      compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
        if (!file.endsWith(".js")) return;
        if (!chunk.hasEntryModule()) return;

        const resources = collectEntryResources(chunk.entryModule);
        const isStyleOnly =
          resources.length &&
          resources.every(resource =>
            extensionsWithDots.find(ext => resource.endsWith(ext))
          );
        if (isStyleOnly) {
          if (!this.options.silent) {
            console.error(
              "webpack-fix-style-only-entries: removing js from style only module: " +
                file
            );
          }
          chunk.files = chunk.files.filter(f => f != file);
          delete compilation.assets[file];
        }
      });
    });
  }
}

function collectEntryResources(module, level = 0) {
  if (typeof module.resource == "string") {
    return [module.resource];
  }

  const resources = [];
  if (module.dependencies) {
    module.dependencies.forEach(dep => {
      if (dep && dep.module) {
        const depResources = collectEntryResources(dep.module, level + 1);
        Array.prototype.push.apply(resources, depResources);
      }
    });
  }

  return resources;
}

module.exports = WebpackFixStyleOnlyEntriesPlugin;
