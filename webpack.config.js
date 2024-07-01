const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const env = require("dotenv").config().parsed;

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
    env !== undefined
      ? new webpack.DefinePlugin({
          "process.env": JSON.stringify(env),
        })
      : new webpack.DefinePlugin({
          "process.env.REACT_PUBLIC_SUPABASE_URL": JSON.stringify(
            process.env.REACT_PUBLIC_SUPABASE_URL
          ),
          "process.env.REACT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
            process.env.REACT_PUBLIC_SUPABASE_ANON_KEY
          ),
        }),
  ],
  devServer: {
    static: {
      directory: __dirname + "/dist",
    },
    port: 8080,
  },
};
