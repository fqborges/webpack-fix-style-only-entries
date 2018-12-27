const WebpackFixStyleOnlyEntries = require("../../../index.js");

module.exports = {
  entry: "./index",
  plugins: [new WebpackFixStyleOnlyEntries()],
};
