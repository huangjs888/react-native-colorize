// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2021-03-17 16:23:00
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-08-08 17:02:53
 * @Description: ******
 */
import { HeatMap } from '@huangjs888/d3-chart';
import './index.less';

const sendMessage = (data) =>
  (window.ReactNativeWebView || window).postMessage(JSON.stringify(data));

const hmId = `colorize-${Math.round(Math.random() * 100000)}`;

function init(option) {
  const { padding, legend = [22, 12, 50], tooltip = true } = option || {};
  const xAxis = (option || {}).xAxis || { type: 'linear' };
  const { zoom: xZoom, x2, ...restXAxis } = xAxis;
  const yAxis = (option || {}).yAxis || { type: 'linear' };
  const { zoom: yZoom, y2, ...restYAxis } = yAxis;
  let element = document.getElementById(hmId);
  if (!element) {
    element = document.createElement('div');
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.position = 'relative';
    element.id = hmId;
    document.body.appendChild(element);
  }
  const hm = new HeatMap({
    container: element,
    padding: !padding ? [24, 8, 36, 44] : padding,
    legend: !legend
      ? { show: false }
      : { show: true, width: legend[0], left: legend[1], right: legend[2] },
    tooltip: !tooltip ? false : { cross: 'xy' },
    zoom:
      !xZoom && !yZoom
        ? null
        : {
            x: !xZoom
              ? null
              : {
                  domain: xAxis.x2 ? 'x2' : 'x',
                  translate: xZoom.translate,
                  precision: xZoom.precision,
                },
            y: !yZoom
              ? null
              : {
                  domain: yAxis.y2 ? 'y2' : 'y',
                  translate: yZoom.translate,
                  precision: yZoom.precision,
                },
            doubleZoom: true,
          },
    scale: {
      x: x2 ? null : { ...restXAxis },
      x2: !x2 ? null : { ...restXAxis },
      y: y2 ? null : { ...restYAxis },
      y2: !y2 ? null : { ...restYAxis },
    },
  });
  hm.setEvent('zoomstart', () => sendMessage({ type: 'zoomstart' }));
  hm.setEvent('zooming', () => sendMessage({ type: 'zooming' }));
  hm.setEvent('zoomend', () => sendMessage({ type: 'zoomend' }));
  hm.setEvent('click', ({ sourceEvent }) =>
    sendMessage({
      type: 'click',
      x: sourceEvent.clientX,
      y: sourceEvent.clientY,
    }),
  );
  hm.setEvent('dblclick', () => sendMessage({ type: 'dblclick' }));
  hm.setEvent('reset', () => sendMessage({ type: 'reset' }));
  return hm;
}

let chart = null;
window.colorize = function (command, option) {
  try {
    const restOptions = option || [];
    if (command === 'init') {
      chart = init(...restOptions);
    } else if (chart) {
      if (chart[command]) {
        if (command === 'setData') {
          restOptions[0] = { heat: restOptions[0] };
        }
        chart[command](...restOptions);
      } else {
        sendMessage({ type: 'error', message: `no method ${command}...` });
      }
    } else {
      sendMessage({ type: 'error', message: '"init" method not executed...' });
    }
  } catch (e) {
    sendMessage({ type: 'error', message: e.message });
  }
};
