// @ts-nocheck
/*
 * @Author: Huangjs
 * @Date: 2021-03-17 16:23:00
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-07-28 09:21:54
 * @Description: ******
 */
import { HeatMap } from '@huangjs888/d3-chart';
import './index.less';

const sendMessage = (data) =>
  (window.ReactNativeWebView || window).postMessage(JSON.stringify(data));

const hmId = `colorize-${Math.round(Math.random() * 100000)}`;

function init(option) {
  const { colorBar, tooptip, ...restOptions } = option || {};
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
    padding: [20, 62, 36, 62],
    colorBar:
      typeof colorBar === 'undefined'
        ? { show: true, width: 22, left: 12, right: 50 }
        : colorBar,
    tooptip: typeof tooptip === 'undefined' ? { cross: 'xy' } : tooptip,
    ...restOptions,
  });
  hm.setEvent('zoomstart', () => sendMessage({ type: 'zoomstart' }));
  hm.setEvent('zooming', () => sendMessage({ type: 'zooming' }));
  hm.setEvent('zoomend', () => sendMessage({ type: 'zoomend' }));
  hm.setEvent('click', () => sendMessage({ type: 'click' }));
  hm.setEvent('dblclick', () => sendMessage({ type: 'dblclick' }));
  hm.setEvent('reset', () => sendMessage({ type: 'reset' }));
  hm.setEvent('resize', () => sendMessage({ type: 'resize' }));
  return hm;
}

let chart = null;
window.colorize = function (command, option) {
  if (command === 'init') {
    chart = init(...option);
  } else if (typeof command === 'string') {
    if (chart) {
      if (chart[command]) {
        chart[command](...option);
      } else {
        sendMessage({ type: 'error', message: `no method ${command}...` });
      }
    } else {
      sendMessage({ type: 'error', message: 'uninitialized...' });
    }
  } else {
    sendMessage({ type: 'error', message: 'pass the correct command...' });
  }
};
