const NAME = "webpack-fix-style-only-entries";

const defaultOptions = {
  extensions: ["less", "scss", "css", "sass", "styl"],
  silent: false,
  ignore: undefined,
};

let _entryResourcesCache = [];

class WebpackFixStyleOnlyEntriesPlugin {
  constructor(options) {
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

    compiler.hooks.watchRun.tap(NAME, () => {
      _entryResourcesCache.length = 0;
    });

    compiler.hooks.compilation.tap(NAME, compilation => {
      _entryResourcesCache.length = 0;
      compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
        if (!file.endsWith(".js") && !file.endsWith(".mjs")) return;
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
  // module.index is unique per compilation
  // module.id can be null, not used here
  if (_entryResourcesCache[module.index] !== undefined) {
    return _entryResourcesCache[module.index];
  }

  if (typeof module.resource == "string") {
    const resources = [module.resource];
    _entryResourcesCache[module.index] = resources;
    return resources;
  }

  const resources = [];
  if (module.dependencies) {
    module.dependencies.forEach(dep => {
      if (dep && (dep.module || dep.originModule)) {
        const nextModule = dep.module || dep.originModule;
        const depResources = collectEntryResources(nextModule, level + 1);
        for (let index = 0, length = depResources.length; index !== length; index++) {
          resources.push(depResources[index]);
        }
      }
    });
  }

  _entryResourcesCache[module.index] = resources;
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
