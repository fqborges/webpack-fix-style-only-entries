const WebpackFixStyleOnlyEntries = require("../../../index.js");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const baseConfig = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new WebpackFixStyleOnlyEntries({ silent: true }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};

module.exports = [
  {
    entry: { scriptA: "./script.js", styleA: "./style.css" },
    ...baseConfig,
  },
  {
    entry: { styleB: "./style.css", scriptB: "./script.js" },
    ...baseConfig,
  },
];
