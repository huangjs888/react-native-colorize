/*
 * @Author: Huangjs
 * @Date: 2021-10-21 16:11:29
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-22 13:51:39
 * @Description: ******
 */

const resolve = require('path').resolve;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlInlineAssetsJsonPlugin = require('../html-inline-assets-json-plugin');

module.exports = (_, argv) => {
  const prod = argv.mode === 'production';
  return {
    entry: {
      index: resolve(__dirname, './index.js'),
    },
    output: {
      path: resolve(__dirname, '../dist/'),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'less-loader',
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js'],
    },
    devtool: prod ? undefined : 'source-map',
    performance: {
      hints: 'warning', // 关闭 false，警告 'warning'，错误 'error'
      maxAssetSize: 512 * 1024, // 生成的资源最大尺寸，整数类型（以字节为单位）
      maxEntrypointSize: 256 * 1024, // 入口文件最大尺寸，整数类型（以字节为单位）
      assetFilter: (assetFilename) => assetFilename.endsWith('.js'), // 检查哪些文件
    },
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        inject: 'body',
        filename: 'index.html',
        template: resolve(__dirname, prod ? './index.html' : './test.html'),
      }),
      new HtmlInlineAssetsJsonPlugin({ enable: prod }),
    ],
    devServer: {
      static: false,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        }, // 将错误信息在浏览器中全屏覆盖
        progress: true, // 在浏览器中以百分比显示编译进度。
      },
      compress: true, // 启用 gzip compression
      port: 9090, // 端口
      // hot: true, // 热更新，配合HotModuleReplacementPlugin
      open: true, // 打开浏览器
      // proxy: {}, // 接口代理
      // host:'',// 地址
    },
  };
};
