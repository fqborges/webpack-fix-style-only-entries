const NAME = "webpack-fix-style-only-entries";

const defaultOptions = {
  extensions: ["css", "scss", "sass", "less", "styl"],
  scriptExtensions: ["js", "mjs"],
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
        let isNotScript = defaultOptions.scriptExtensions.every((ext) => file.lastIndexOf('.' + ext) < 0);
        if (isNotScript) return;

        // has entry modules
        if (compilation.chunkGraph.getNumberOfEntryModules(chunk) < 1) return;
        const entryModules = Array.from(compilation.chunkGraph.getChunkEntryModulesIterable(chunk));
        if (entryModules.length < 1) return;

        const entryModule = entryModules[0];
        const rawResources = collectEntryResources(compilation, entryModule, resourcesCache);
        const resources = this.options.ignore
            ? rawResources.filter(r => !r.match(this.options.ignore))
            : rawResources;

        const isStyleOnly =
            resources.length &&
            resources.every(resource => reStylesResource.test(resource));

        if (isStyleOnly) {
          if (!this.options.silent) {
            console.log(
                "[webpack-fix-style-only-entries] removing js from style only module: " +
                file
            );
          }
          chunk.files.delete(file);
          delete compilation.assets[file];
        }
      });
    });
  }
}

function collectEntryResources(compilation, module, cache) {
  const index = compilation.moduleGraph.getPreOrderIndex(module);

  // index of module is unique per compilation
  // module.id can be null, not used here
  if (cache[index] !== undefined) {
    return cache[index];
  }

  if (typeof module.resource == "string") {
    const resources = [module.resource];
    cache[index] = resources;
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

  cache[index] = resources;
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