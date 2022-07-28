/*
 * @Author: Huangjs
 * @Date: 2022-05-19 16:27:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-21 15:08:28
 * @Description: ******
 */
// @ts-nocheck

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import html from './dist/index.html.js';

export const ColorizeDataType = PropTypes.shape({
  x: PropTypes.arrayOf(PropTypes.number),
  y: PropTypes.arrayOf(PropTypes.number),
  z: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
});
export const ColorizeDataRequestType = PropTypes.shape({
  url: PropTypes.string,
  method: PropTypes.oneOf(['POST', 'GET']),
  data: PropTypes.object,
  headers: PropTypes.object,
  type: PropTypes.oneOf(['form', 'json']),
  timeout: PropTypes.number,
  dataParse: PropTypes.shape({
    dataKey: PropTypes.string,
    centerMode: PropTypes.oneOf(['single', 'multiple']), // 解析数据时，有多个或单个中心点
    pointMode: PropTypes.oneOf(['spherical', 'cartesian']), // 球坐标系，笛卡尔坐标系（空间直角坐标系）
    valueMode: PropTypes.oneOf(['color', 'value']), // color：代表返回的是已经算好的rgba值，value代表返回值，然后计算出rgba，设置value需要定义valueDomain
    coordType: PropTypes.number, // 获取的数据坐标是哪一种，会转换成高德坐标，如果本身就是高德坐标则不传
  }),
});
export const ColorizeDataColorType = PropTypes.shape({
  range: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.arrayOf(PropTypes.string),
  opacity: PropTypes.number,
});

const ColorizePropTypes = {
  ...ViewPropTypes,

  /**
   * 设置webview的样式
   */
  style: PropTypes.object,

  /**
   * 设置webview的宽度
   */
  width: PropTypes.string,

  /**
   * 设置webview的高度
   */
  height: PropTypes.string,

  /**
   * 渲染数据
   */
  dataSource: ColorizeDataType,

  /**
   * 请求数据
   */
  request: PropTypes.arrayOf(ColorizeDataRequestType),

  /**
   * 数据请求后对值进行转换成颜色，该项设置颜色的值域，色域和透明度，仅当设置了request，该项有效
   */
  valueDomain: ColorizeDataColorType,

  /**
   * 请求完成事件，仅当设置了request，该项有效
   */
  onRequested: PropTypes.func,

  /**
   * 所有请求完成事件，仅当设置了request，该项有效
   */
  onAllRequested: PropTypes.func,

  /**
   * webview加载页面完成事件
   */
  onLoaded: PropTypes.func,
};

const fixStyle = StyleSheet.create({
  container: { overflow: 'hidden', flex: 0 },
  webview: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
  },
  webviewAndroid9: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
    opacity: 0.99,
  },
});

const Colorize = (props) => {
  const myRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const {
    width,
    height,
    style,
    onLoaded,
    onRequested,
    onAllRequested,
    dataSource,
    request,
    valueDomain,
  } = props;
  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoaded();
  }, [onLoaded]);
  const handleMessage = useCallback(
    (e) => {
      const { type, ...restData } = JSON.parse(e.nativeEvent.data);
      switch (type) {
        case 'onRequested': {
          onRequested(restData);
          break;
        }
        case 'onAllRequested': {
          onAllRequested(restData);
          break;
        }
      }
    },
    [onRequested, onAllRequested],
  );
  useEffect(() => {
    if (loaded && myRef.current) {
      myRef.current.postMessage(
        JSON.stringify({ dataSource, request, valueDomain }),
      );
    }
  }, [loaded, dataSource, request, valueDomain]);

  if (Platform.OS === 'android') {
    return (
      <View style={[fixStyle.container, { width, height }, style]}>
        <WebView
          style={[
            Platform.Version >= 28
              ? fixStyle.webviewAndroid9
              : fixStyle.webview,
            { height, width },
          ]}
          ref={myRef}
          source={{ html }}
          originWhitelist={['*']}
          mixedContentMode="always"
          scalesPageToFit={false}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          allowUniversalAccessFromFileURLs
          onMessage={handleMessage}
          onLoad={handleLoad}
        />
      </View>
    );
  }
  const opacity = loaded ? 1 : 0;
  return (
    <View style={[fixStyle.container, { width, height, opacity }, style]}>
      <WebView
        style={[fixStyle.webview, { height, width }]}
        ref={myRef}
        source={{ html }}
        originWhitelist={['*']}
        scrollEnabled={false}
        onMessage={handleMessage}
        onLoad={handleLoad}
      />
    </View>
  );
};
Colorize.propTypes = ColorizePropTypes;

export default Colorize;
