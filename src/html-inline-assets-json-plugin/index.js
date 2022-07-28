/* eslint-disable no-sequences */
/*
 * @Author: Huangjs
 * @Date: 2022-07-18 15:47:39
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-22 13:55:15
 * @Description: ******
 */
const parse5 = require('parse5');
const webpack = require('webpack');

const getAsset = (compilation, name) =>
  compilation.getAsset
    ? compilation.getAsset(name)
    : !Object.prototype.hasOwnProperty.call(compilation.assets, name)
    ? undefined
    : {
        name,
        source: compilation.assets[name],
        info: compilation.assetsInfo.get(name) || {},
      };
const getAssets = (compilation) =>
  compilation.getAssets
    ? compilation.getAssets()
    : Object.keys(compilation.assets).map((name) =>
        !Object.prototype.hasOwnProperty.call(compilation.assets, name)
          ? undefined
          : {
              name,
              source: compilation.assets[name],
              info: compilation.assetsInfo.get(name) || {},
            },
      );
const deleteAsset = (compilation, name) =>
  compilation.deleteAsset
    ? compilation.deleteAsset(name)
    : delete compilation.assets[name];
const emitAsset = (compilation, name, value) =>
  compilation.emitAsset
    ? compilation.emitAsset(
        name,
        webpack.sources && webpack.sources.RawSource
          ? new webpack.sources.RawSource(value, false)
          : {
              source: () => value,
              size: () => value.length,
            },
      )
    : (compilation.assets[name] = {
        source: () => value,
        size: () => value.length,
      });
const transform = (nodes, compilation) =>
  nodes.map((node) => {
    if (node.nodeName === 'script') {
      const src = node.attrs.find((attr) => attr.name === 'src') || {};
      const asset = getAsset(compilation, src.value);
      if (asset) {
        return parse5.parseFragment(`<script>${asset.source.source()}</script>`)
          .childNodes[0];
      }
    } else if (node.nodeName === 'link') {
      const href = node.attrs.find((attr) => attr.name === 'href') || {};
      const asset = getAsset(compilation, href.value);
      if (asset) {
        return parse5.parseFragment(`<style>${asset.source.source()}</style>`)
          .childNodes[0];
      }
    }
    const { childNodes, ...restAttr } = node;
    return {
      ...restAttr,
      childNodes: childNodes && transform(childNodes, compilation),
    };
  });
const processAssets = (compilation, assetKeys, options) => {
  if (typeof options.enable === 'undefined' || options.enable) {
    getAssets(compilation)
      .filter(({ name }) => name.match(options.htmlReg || /.x?html$/))
      .map(({ name, source }) => {
        const html = source.source();
        const document = parse5.parse(html);
        document.childNodes = transform(document.childNodes, compilation);
        emitAsset(
          compilation,
          `${name}.json`,
          JSON.stringify({
            name,
            content: parse5.serialize(document),
          }),
        );
      });
    assetKeys.forEach((name) => {
      deleteAsset(compilation, name);
    });
  }
};

function HtmlInlineAssetsJsonPlugin(options) {
  this.options = options || {};
  this.PLUGIN_NAME = 'HtmlInlineAssetsJsonPlugin';
}

HtmlInlineAssetsJsonPlugin.prototype.apply = function (compiler) {
  const PLUGIN_NAME = this.PLUGIN_NAME;
  const options = this.options;
  // Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE 只存在于webpack@5.0.0+
  webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
    ? compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.afterProcessAssets.tap(
          PLUGIN_NAME,
          (compilationAssets) =>
            processAssets(compilation, Object.keys(compilationAssets), options),
        );
      })
    : (compiler.hooks
        ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, PLUGIN_NAME)
        : compiler.plugin.bind(compiler, 'emit'))(
        (compilation, callback) => (
          processAssets(
            compilation,
            getAssets(compilation).map(({ name }) => name),
            options,
          ),
          callback()
        ),
      );
};

module.exports = HtmlInlineAssetsJsonPlugin;
