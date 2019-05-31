const NAME = "webpack-fix-style-only-entries";

const defaultOptions = {
  extensions: ["less", "scss", "css"],
  silent: false,
  ignore: undefined,
};
const _collectedModules = [];

class WebpackFixStyleOnlyEntriesPlugin {
  constructor(options) {
    _collectedModules.length = 0;
    this.apply = this.apply.bind(this);

    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    const extensionsWithoutDots = this.options.extensions.map(e =>
      e[0] === "." ? e.substring(1) : e
    );

    const patternOneOfExtensions = extensionsWithoutDots
      .map(ext => escapeRegExp(ext))
      .join("|");

    const reStylesResource = new RegExp(
      `[.](${patternOneOfExtensions})([?].*)?$`
    );

    compiler.hooks.compilation.tap(NAME, compilation => {
      compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
        if (!file.endsWith(".js")) return;
        if (!chunk.hasEntryModule()) return;

        const rawResources = collectEntryResources(chunk.entryModule);
        const resources = this.options.ignore
          ? rawResources.filter(r => !r.match(this.options.ignore))
          : rawResources;

        const isStyleOnly =
          resources.length &&
          resources.every(resource => reStylesResource.test(resource));
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
      if (dep && (dep.module || dep.originModule)) {
        const nextModule = dep.module || dep.originModule;
        if (_collectedModules.indexOf(nextModule.id) === -1) {
          _collectedModules.push(nextModule.id);
          const depResources = collectEntryResources(nextModule, level + 1);
          Array.prototype.push.apply(resources, depResources);
        }
      }
    });
  }

  return resources;
}

// https://github.com/lodash/lodash/blob/4.17.11/lodash.js#L14274
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(string) {
  string = String(string);
  return string && reHasRegExpChar.test(string)
    ? string.replace(reRegExpChar, "\\$&")
    : string;
}

module.exports = WebpackFixStyleOnlyEntriesPlugin;
