// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2022-05-19 16:27:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-28 13:49:34
 * @Description: ******
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import htmlJson from './dist/index.html.json';

const LabelType = PropTypes.shape({
  subLabel: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
});
const scaleType = PropTypes.shape({
  type: PropTypes.string, // 坐标类型
  ticks: PropTypes.number, // 坐标刻度数目
  format: PropTypes.func, // 坐标值格式化函数
  showRange: PropTypes.bool, // 是否坐标轴范围
  domain: PropTypes.arrayOf(PropTypes.number), // 横坐标缩放为1，位移为0时的坐标范围
  subLabel: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
});
export const ColorizeInitCfgType = PropTypes.shape({
  colorBar: PropTypes.shape({
    show: PropTypes.bool,
    left: PropTypes.number,
    width: PropTypes.number,
    right: PropTypes.number,
  }),
  tooptip: PropTypes.shape({
    cross: PropTypes.string,
    compute: PropTypes.func,
  }),
  scale: PropTypes.shape({
    x: scaleType,
    x2: scaleType,
    y: scaleType,
    y2: scaleType,
    z: scaleType,
  }),
  zoom: PropTypes.shape({
    x: PropTypes.shape({
      domain: PropTypes.oneOf(['x', 'x2']),
      translate: PropTypes.arrayOf(PropTypes.number),
      precision: PropTypes.arrayOf(PropTypes.number),
    }),
    y: PropTypes.shape({
      domain: PropTypes.oneOf(['y', 'y2']),
      translate: PropTypes.arrayOf(PropTypes.number),
      precision: PropTypes.arrayOf(PropTypes.number),
    }),
    doubleZoom: PropTypes.bool,
  }),
});
export const ColorizeDataType = PropTypes.shape({
  x: PropTypes.arrayOf(PropTypes.number),
  y: PropTypes.arrayOf(PropTypes.number),
  z: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
});
export const ColorizeDomainType = PropTypes.shape({
  x: PropTypes.arrayOf(PropTypes.number),
  y: PropTypes.arrayOf(PropTypes.number),
  z: PropTypes.array,
});
export const ColorizeLabelType = PropTypes.shape({
  x: LabelType,
  y: LabelType,
  z: LabelType,
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
  width: PropTypes.number,

  /**
   * 设置webview的高度
   */
  height: PropTypes.number,

  /**
   * 初始配置
   */
  initCfg: ColorizeInitCfgType,

  /**
   * xyz轴范围
   */
  domain: ColorizeDomainType,

  /**
   * xyz轴文字
   */
  label: ColorizeLabelType,

  /**
   * xy轴缩放最大和最小刻度范围
   */
  precision: ColorizeDomainType,

  /**
   * xy移动最大和最小刻度范围
   */
  translate: ColorizeDomainType,

  /**
   * 渲染数据
   */
  dataSource: ColorizeDataType,

  /**
   * webview加载页面完成事件
   */
  onLoad: PropTypes.func,

  /**
   * webview加载错误事件
   */
  onError: PropTypes.func,
};

const fixStyle = StyleSheet.create({
  webview: {
    overflow: 'hidden',
    flex: 1,
  },
});

const Colorize = forwardRef((props, ref) => {
  const myRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const {
    style,
    width,
    height,
    onError,
    onInited,
    initCfg,
    domain,
    label,
    precision,
    translate,
    dataSource,
  } = props;
  const handleOnError = useCallback(
    () => onError(new Error('webview load error')),
    [onError],
  );
  const handleOnMessage = useCallback(
    (e) => {
      const { type, ...restData } = JSON.parse(e.nativeEvent.data);
      if (type === 'error') {
        onError(new Error(restData.message));
      } else {
        console.log(type);
      }
    },
    [onError],
  );
  const handleOnLoad = useCallback(() => setLoaded(true), []);
  const injectMethod = useCallback(
    (command, option) =>
      loaded &&
      myRef.current &&
      myRef.current.injectJavaScript(
        `(function(){window.colorize('${command}',${JSON.stringify(
          option,
          (k, v) => (typeof v === 'function' ? v.toString() : v),
        )});}())`,
      ),
    [loaded],
  );
  useImperativeHandle(
    ref,
    () => {
      const handle = {
        getWebView: () => myRef.current,
      };
      ['reset', 'render', 'resize'].forEach(
        (key) =>
          (handle[key] = (...args) => {
            if (injectMethod(key, args) === false) {
              throw new Error('colorize uninitialized...');
            }
          }),
      );
      return handle;
    },
    [injectMethod],
  );
  useEffect(() => {
    injectMethod('init', [initCfg]);
    return () => {
      injectMethod('destroy', []);
    };
  }, [initCfg, injectMethod]);
  useEffect(() => {
    injectMethod('setDomain', [domain, true]);
  }, [domain, injectMethod]);
  useEffect(() => {
    injectMethod('setLabel', [label]);
  }, [label, injectMethod]);
  useEffect(() => {
    injectMethod('setPrecision', [precision]);
  }, [precision, injectMethod]);
  useEffect(() => {
    injectMethod('setTranslate', [translate]);
  }, [translate, injectMethod]);
  useEffect(() => {
    console.log(
      injectMethod('setData', [{ heat: dataSource }, true]),
      !!dataSource,
    );
  }, [dataSource, injectMethod]);
  useEffect(() => {
    if (loaded) {
      onInited();
    }
  }, [loaded, onInited]);

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
