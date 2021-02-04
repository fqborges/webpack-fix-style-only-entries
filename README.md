[![npm version](https://badge.fury.io/js/webpack-fix-style-only-entries.svg)](https://www.npmjs.com/package/webpack-fix-style-only-entries)

# [webpack-fix-style-only-entries](https://www.npmjs.com/package/webpack-fix-style-only-entries)

This is a small plugin developed to solve the problem of having a style only entry (css/sass/less/stylus) generating an extra js file.

> :warning: **the current version is not compatible with webpack 5!!** For webpack 5 try this fork: https://github.com/webdiscus/webpack-remove-empty-scripts

You can find more info by reading the following issues:

 - https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/518
 - https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151

View on: [Github](https://github.com/fqborges/webpack-fix-style-only-entries) - [npm](https://www.npmjs.com/package/webpack-fix-style-only-entries)

## How it works
It just find js files from chunks of css only entries and remove the js file from the compilation.

## How to use
install using your package manager of choice:
 - npm: `npm install -D webpack-fix-style-only-entries`
 - yarn: `yarn add -D webpack-fix-style-only-entries`

Require and add to webpack.config plugins.

Warning: this plugin does not load styles or split your bundles, it just fix chunks of css only entries by removing the (almost) empty js file.

```javascript
// ... other plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

module.exports = {
    entry: {
        "main" : "./app/main.js"
        "styles": ["./common/styles.css", "./app/styles.css"]
    },
    module: {
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
        ]
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash:8].css",
        }),
    ],
};
```

## Options
 
| Name       | Type             | Default                                | Description |
|------------|---------------   |----------------------------------------|-------------|
| extensions | Array[string]    | ["less", "scss", "css", "styl","sass"] | file extensions for styles      |
| silent     | boolean          | false                                  | supress logs to console         |
| ignore     | string or RegExp | undefined                              | match resource to be ignored    |

### Example config:
    // to identify only 'foo' and 'bar' extensions as styles
    new FixStyleOnlyEntriesPlugin({ extensions:['foo', 'bar'] }),

## Recipes

### I use a javascript entry to styles:
Give an especial extension to your file (`.css.js` for example) and configure `new FixStyleOnlyEntriesPlugin({ extensions:['css.js'] })`. See: https://github.com/fqborges/webpack-fix-style-only-entries/issues/8.

### I use webpack-hot-middleware:
Configure this plugin as `new FixStyleOnlyEntriesPlugin({ ignore: 'webpack-hot-middleware' })`. See: https://github.com/fqborges/webpack-fix-style-only-entries/issues/12 and https://github.com/fqborges/webpack-fix-style-only-entries/blob/master/test/cases/css-entry-with-ignored-hmr/webpack.config.js.
