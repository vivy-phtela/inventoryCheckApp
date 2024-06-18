const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: __dirname + "/src/main.jsx",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    modules: [__dirname + "/node_modules"],
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html",
    }),
  ],
  devServer: {
    static: {
      directory: __dirname + "/dist",
    },
    port: 3000,
  },
};
