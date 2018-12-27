const WebpackFixStyleOnlyEntries = require("../../../index.js");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: ["./index.js", "./index.css"],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new WebpackFixStyleOnlyEntries(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
