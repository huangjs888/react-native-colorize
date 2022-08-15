<!--
 * @Author: Huangjs
 * @Date: 2022-05-27 10:16:38
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-08-15 16:05:34
 * @Description: ******
-->
# react-native-colorize

## Getting started

`$ npm install @huangjs888/react-native-colorize --save`

## Usage
```javascript

import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import Colorize from '@huangjs888/react-native-colorize';

export default () => {
  const colorizeRef = useRef(null);
  const handleOnError = useCallback((e) => {
    console.log(e.message);
  }, []);
  const handleOnInit = useCallback(() => {
    if (colorizeRef.current) {
      colorizeRef.current.on('click', (data) => {
        console.log('click', data);
      });
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
          label: 'PM10',
          unit: 'ug/m³',
        },
      });
      colorizeRef.current.domain({
        x: [0, new Date().getTime()],
        y: [0, 6000],
        z: [
          1,
          [
            'rgb(0,228,0)',
            'rgb(255,255,0)',
            'rgb(255,126,0)',
            'rgb(255,0,0)',
            'rgb(153,0,76)',
            'rgb(126,0,35)',
          ],
          [0, 20, 40, 60, 80, 100],
        ],
      });
      colorizeRef.current.data({ x: [], y: [], z: [] });
      colorizeRef.current.render();
    }
  }, []);
  return (
    <View>
      <Colorize
        ref={colorizeRef}
        height={200}
        onInit={handleOnInit}
        onError={handleOnError}
      />
    </View>
  );
};
  
```
