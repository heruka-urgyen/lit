const path = require("path")
const webpackNodeExternals = require("webpack-node-externals")

module.exports = {
  target: "node",
  mode: "development",
  entry: [
    "regenerator-runtime/runtime",
    "./src/index.js",
  ],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    library: "lit",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  externals: [webpackNodeExternals()],
}
