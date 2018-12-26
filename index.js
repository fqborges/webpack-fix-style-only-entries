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

        let resources;
        if (typeof chunk.entryModule.resource == "string") {
          resources = [chunk.entryModule.resource];
        } else {
          if (
            chunk.entryModule.dependencies &&
            chunk.entryModule.dependencies.length
          ) {
            const modulesWithResources = chunk.entryModule.dependencies
              .map(dep => dep.module)
              .filter(m => m && m.resource);
            resources = modulesWithResources.map(m => m.resource);
          }
        }

        if (resources && resources.length) {
          if (
            resources.every(resource =>
              extensionsWithDots.find(ext => resource.endsWith(ext))
            )
          ) {
            if (!this.options.silent) {
              console.log(
                "webpack-fix-style-only-entries: removing js from style only module: " +
                  file
              );
            }
            chunk.files = chunk.files.filter(f => f != file);
            delete compilation.assets[file];
          }
        }
      });
    });
  }
}

module.exports = WebpackFixStyleOnlyEntriesPlugin;
