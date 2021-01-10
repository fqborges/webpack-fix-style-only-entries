const NAME = "webpack-fix-style-only-entries";

const defaultOptions = {
  extensions: ["less", "scss", "css", "sass", "styl"],
  silent: false,
  ignore: undefined,
};

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

    compiler.hooks.compilation.tap(NAME, compilation => {
      const resourcesCache = [];
      compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
        if (!file.endsWith(".js") && !file.endsWith(".mjs")) return;
        if (!chunk.hasEntryModule()) return;

        const rawResources = collectEntryResources(compilation, chunk.entryModule, resourcesCache);
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
          const filtered = [...chunk.files].filter(f => f != file);
          chunk.files = (chunk.files instanceof Set) ? new Set(filtered) : filtered;
          delete compilation.assets[file];
        }
      });
    });
  }
}

function collectEntryResources(compilation, module, cache) {
  // module.index is unique per compilation
  // module.id can be null, not used here
  if (cache[module.index] !== undefined) {
    return cache[module.index];
  }

  if (typeof module.resource == "string") {
    const resources = [module.resource];
    cache[module.index] = resources;
    return resources;
  }

  const resources = [];
  if (module.dependencies) {
    const hasModuleGraphSupport = compilation.hasOwnProperty('moduleGraph');
    module.dependencies.forEach(dep => {
      if(dep) {
        const module = hasModuleGraphSupport ? compilation.moduleGraph.getModule(dep) : dep.module;
        const originModule = hasModuleGraphSupport ? compilation.moduleGraph.getParentModule(dep) : dep.originModule;
        const nextModule = module || originModule;
        if (nextModule) {
          const depResources = collectEntryResources(compilation, nextModule, cache);
          for (let index = 0, length = depResources.length; index !== length; index++) {
            resources.push(depResources[index]);
          }
        }
      }
    });
  }

  cache[module.index] = resources;
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
