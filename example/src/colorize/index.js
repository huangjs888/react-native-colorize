// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2022-06-01 12:40:31
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-28 13:50:16
 * @Description: ******
 */

import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Colorize from '@huangjs888/react-native-colorize';
import pm10 from '../../server/data/pm10.json';

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

const initCfg = {
  zoom: {
    x: {
      domain: 'x',
      translate: [-Infinity, Infinity],
      precision: [1000, 366 * 24 * 60 * 60 * 1000],
    },
    y: {
      domain: 'y',
      translate: [-5000, 35000],
      precision: [30, 40000],
    },
  },
  scale: {
    x: {
      type: 'time',
      label: '时间',
      unit: '',
    },
    y: {
      type: 'linear',
      label: '距离',
      unit: 'm',
    },
  },
};

var parse = function (list, dataType) {
  var heatData = { x: [], y: [], z: [] };
  if (list) {
    var dlength = list.length;
    for (var j = 0; j < dlength; j += 1) {
      heatData.x[j] = +list[j].dataTime;
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
  const [data, setData] = useState(null);
  const [domain, setDomain] = useState(null);
  const [label, setLabel] = useState(null);
  useEffect(() => {
    const source = parse(pm10.data.list, dataTypeSet[0].key);
    setLabel({
      z: {
        label: dataTypeSet[0].label,
        unit: dataTypeSet[0].unit,
      },
    });
    setDomain({
      x: [source.x[0], source.x[source.x.length - 1]],
      y: [source.y[0], source.y[source.y.length - 1]],
      z: [
        dataTypeSet[0].domain.opacity,
        dataTypeSet[0].domain.color,
        dataTypeSet[0].domain.range,
      ],
    });
    setData(source);
    setTimeout(() => {
      setDomain({
        z: [
          dataTypeSet[2].domain.opacity,
          dataTypeSet[2].domain.color,
          dataTypeSet[2].domain.range,
        ],
      });
      setLabel({
        z: {
          label: dataTypeSet[2].label,
          unit: dataTypeSet[2].unit,
        },
      });
    }, 3000);
  }, []);
  return (
    <View style={styles.view}>
      <Colorize
        style={styles.view}
        height={320}
        domain={domain}
        label={label}
        dataSource={data}
        onInited={() => {
          console.log('onInited');
        }}
        onError={(e) => {
          console.log(e.message);
        }}
        initCfg={initCfg}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  view: { flex: 1, width: '100%', height: '80%' },
});
