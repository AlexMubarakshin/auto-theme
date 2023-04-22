/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const HtmlWebpackInlineSourcePlugin = require("@effortlessmotion/html-webpack-inline-source-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === "production" ? false : "inline-source-map",

  entry: {
    ui: "./src/app/index.tsx", // The entry point for your UI code
    code: "./src/plugin/controller.ts" // The entry point for your plugin code
  },

  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },

      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },

      { test: /\.(png|jpg|gif|webp|svg)$/, use: "url-loader" }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"]
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist") // Compile into a folder called "dist"
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      template: "./src/app/index.html",
      filename: "ui.html",
      inlineSource: ".(js)$",
      chunks: ["ui"]
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
});
