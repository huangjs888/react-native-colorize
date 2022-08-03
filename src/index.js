// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2022-05-19 16:27:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-08-01 16:12:06
 * @Description: ******
 */

import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import htmlJson from './dist/index.html.json';

const ColorizePropTypes = {
  ...ViewPropTypes,

  /**
   * 设置Colorize的样式
   */
  style: PropTypes.object,

  /**
   * 设置Colorize的宽度
   */
  width: PropTypes.number,

  /**
   * 设置Colorize的高度
   */
  height: PropTypes.number,

  /**
   * Colorize初始化完成事件
   */
  onInit: PropTypes.func,

  /**
   * Colorize加载错误事件
   */
  onError: PropTypes.func,
};

const fixStyle = StyleSheet.create({
  webview: {
    overflow: 'hidden',
    flex: 0,
  },
});

const methodMap = {
  init: 'init',
  destroy: 'destroy',
  reset: 'reset',
  render: 'render',
  domain: 'setDomain',
  label: 'setLabel',
  data: 'setData',
};

const Colorize = forwardRef((props, ref) => {
  const myRef = useRef(null);
  const eventRef = useRef({});
  const { style, width, height, onError, onInit } = props;
  const handleOnError = useCallback(
    () => onError(new Error('webview load error')),
    [onError],
  );
  const handleOnLoad = useCallback(() => onInit(), [onInit]);
  const handleOnMessage = useCallback(
    (e) => {
      const { type, ...restData } = JSON.parse(e.nativeEvent.data);
      if (type === 'error') {
        onError(new Error(restData.message));
      } else {
        if (eventRef.current[type]) {
          eventRef.current[type].forEach((cb) => {
            cb(restData);
          });
        }
      }
    },
    [onError],
  );

  useImperativeHandle(
    ref,
    () => {
      const invokeMethod = (command, option) =>
        myRef.current &&
        myRef.current.injectJavaScript(
          `(function(){if(!window.colorize){(window.ReactNativeWebView || window).postMessage(\`${JSON.stringify(
            {
              type: 'error',
              message:
                'window.colorize method not created, you can initialize in onLoad ...',
            },
          )}\`);}else{window.colorize('${command}',${JSON.stringify(
            option,
          )});}}())`,
        );
      const handle = {
        getWebView: () => myRef.current,
        on: (type, cb) => {
          if (!eventRef.current[type]) {
            eventRef.current[type] = [];
          }
          eventRef.current[type].push(cb);
        },
      };
      Object.keys(methodMap).forEach((m) => {
        handle[m] = (...args) => invokeMethod(methodMap[m], [...args]);
      });
      return handle;
    },
    [],
  );

  const size = {
    width,
    height,
  };

  return (
    <View style={[fixStyle.webview, style, size]}>
      <WebView
        ref={myRef}
        source={{ html: htmlJson.content }}
        originWhitelist={['*']}
        onMessage={handleOnMessage}
        onLoad={handleOnLoad}
        onError={handleOnError}
      />
    </View>
  );
});
Colorize.propTypes = ColorizePropTypes;

export default Colorize;
