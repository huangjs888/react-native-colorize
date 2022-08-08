// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2022-06-01 12:40:31
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-08-08 16:45:17
 * @Description: ******
 */

import React, { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import Colorize from '@huangjs888/react-native-colorize';
import pm10 from '../data/pm10.json';

const dataTypeSet = [
  {
    unit: 'ug/m³',
    label: 'PM10',
    key: 'pm10',
    domain: {
      range: [0, 20, 40, 60, 80, 100],
      color: [
        'rgb(0,228,0)',
        'rgb(255,255,0)',
        'rgb(255,126,0)',
        'rgb(255,0,0)',
        'rgb(153,0,76)',
        'rgb(126,0,35)',
      ],
      opacity: 0.8,
    },
  },
  {
    unit: 'km⁻¹',
    label: '消光系数',
    key: 'depol',
    domain: {
      range: [0, 0.2, 0.4, 0.6, 0.8, 1],
      color: ['#003ddf', '#00acc0', '#5afa00', '#ffff00', '#ffa500', '#ff0000'],
      opacity: 1,
    },
  },
  {
    unit: 'ug/m³',
    label: 'PM2.5',
    key: 'pm25',
    domain: {
      range: [0, 20, 40, 60, 80, 100],
      color: ['#003ddf', '#00acc0', '#5afa00', '#ffff00', '#ffa500', '#ff0000'],
      opacity: 1,
    },
  },
];
var parse = function (list, dataType, type) {
  var heatData = { x: [], y: [], z: [] };
  if (list) {
    var dlength = list.length;
    for (var j = 0; j < dlength; j += 1) {
      heatData.x[j] = +list[j].dataTime + (+type === 2 ? 0 : 12 * 3600 * 1000);
      var value = list[j][dataType];
      if (!value || !value.length) {
        if (!heatData.x.invalid) {
          heatData.x.invalid = [];
        }
        heatData.x.invalid.push(j);
      }
      var vlength = value.length;
      for (var i = 0; i < vlength; i += 1) {
        if (heatData.y.length < value.length && heatData.y.length === i) {
          heatData.y[i] =
            (list[j].startDistance || 0) + i * +list[j].heightInterval;
        }
        if (!heatData.z[i]) {
          heatData.z[i] = [];
        }
        heatData.z[i][j] = +value[i] || 0;
      }
    }
  }
  return heatData;
};

export default () => {
  const colorizeRef = useRef(null);
  const colorizeRef2 = useRef(null);
  const handleOnInit = useCallback(() => {
    if (colorizeRef.current) {
      colorizeRef.current.on('click', (data) => {
        console.log('click1', data);
      });
      const source = parse(pm10.data.list, dataTypeSet[0].key);
      colorizeRef.current.init({
        tooltip: true,
        legend: [16, 0, 32],
        padding: [20, 10, 20, 28],
        xAxis: {
          type: 'time',
          showRange: false,
        },
        yAxis: {
          type: 'linear',
          showRange: false,
        },
      });
      colorizeRef.current.label({
        x: {
          label: '时间',
          unit: '',
        },
        y: {
          label: '距离',
          unit: 'm',
        },
        z: {
          label: dataTypeSet[0].label,
          unit: dataTypeSet[0].unit,
        },
      });
      colorizeRef.current.domain({
        x: [source.x[0], source.x[source.x.length - 1]],
        y: [source.y[0], source.y[source.y.length - 1]],
        z: [
          dataTypeSet[0].domain.opacity,
          dataTypeSet[0].domain.color,
          dataTypeSet[0].domain.range,
        ],
      });
      colorizeRef.current.data(source);
      colorizeRef.current.render();
      colorizeRef.current.on('click', (data) => {
        console.log('click2', data);
      });
      console.log('onLoaded');
    }
    console.log('onLoad');
  }, []);
  const handleOnInit2 = useCallback(() => {
    if (colorizeRef2.current) {
      colorizeRef2.current.on('zoomend', (data) => {
        console.log('zoomend1', data);
      });
      const source = parse(pm10.data.list, dataTypeSet[0].key, 2);
      colorizeRef2.current.init({
        tooltip: true,
        legend: [16, 0, 32],
        padding: [24, 8, 36, 44],
        xAxis: {
          type: 'time',
          zoom: {
            // 不能使用Infinity,否则无法拖动
            translate: [0, new Date().getTime() + Number.MAX_SAFE_INTEGER],
            precision: [1000, 366 * 24 * 60 * 60 * 1000],
          },
        },
        yAxis: {
          type: 'linear',
          zoom: { translate: [-5000, 35000], precision: [30, 40000] },
        },
      });
      colorizeRef2.current.label({
        x: {
          label: '时间',
          unit: '',
        },
        y: {
          label: '距离',
          unit: 'm',
        },
        z: {
          label: dataTypeSet[2].label,
          unit: dataTypeSet[2].unit,
        },
      });
      colorizeRef2.current.domain({
        x: [source.x[0], source.x[source.x.length - 1]],
        y: [source.y[0], source.y[source.y.length - 1]],
        z: [
          dataTypeSet[2].domain.opacity,
          dataTypeSet[2].domain.color,
          dataTypeSet[2].domain.range,
        ],
      });
      colorizeRef2.current.data(source);
      colorizeRef2.current.render();
      colorizeRef2.current.on('click', (data) => {
        console.log('zoomend2', data);
      });
      console.log('onLoaded2');
    }
    console.log('onLoad2');
  }, []);
  const handleOnError = useCallback((e) => {
    console.log(e.message);
  }, []);
  return (
    <View style={styles.view}>
      <Colorize
        ref={colorizeRef}
        height={200}
        onInit={handleOnInit}
        onError={handleOnError}
      />
      <Colorize
        ref={colorizeRef2}
        height={200}
        onInit={handleOnInit2}
        onError={handleOnError}
      />
      <WebView source={{ uri: 'http://www.baidu.com' }} />
    </View>
  );
};
const styles = StyleSheet.create({
  view: { flex: 1, paddingTop: 16, paddingBottom: 16 },
});
