const WebpackFixStyleOnlyEntries = require("../../../index.js");

module.exports = {
  entry: "./index.mjs",
  output: {
    filename: "[name].mjs",
  },
  plugins: [
    new WebpackFixStyleOnlyEntries()
  ],
};
