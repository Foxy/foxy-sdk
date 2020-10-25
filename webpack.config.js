const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    user: "./src/user.ts",
    element: "./src/element/index.ts",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist/cdn",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
};
