import type { FootprintConfig } from 'footprint-globe';

export const residence: FootprintConfig = {
  version: 1,
  categories: [
    {
      id: 'residence',
      label: '居住',
      color: '#2563eb',
      pins: [
        { name: '1995.06 临沂', coords: [118.35053086280824, 35.10379488422636] },
        { name: '2012.09 武汉', coords: [114.2999353, 30.5951051] },
        { name: '2015.12 杭州', coords: [120.2052342, 30.2489634] },
        { name: '2017.05 上海', coords: [121.4692071, 31.2322758] },
        { name: '2023.10 新加坡', coords: [103.851959, 1.29027] },
      ],
    },
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [
        { name: '2019.04 东京', coords: [139.7594549, 35.6828387] },
        { name: '2022.12 巴黎', coords: [2.3200571537017827, 48.85914127882758] },
        { name: '2022.12 罗马', coords: [12.483054399490358, 41.893639222307314] },
        { name: '2023.08 维也纳', coords: [16.372418403625492, 48.20871655750039] },
        { name: '2025.05 巴厘岛', coords: [115.1919203, -8.2271303] },
      ],
    },
  ],
  config: {
    projection: 'globe',
    theme: 'light',
    center: [100, 30],
    zoom: 1.2,
    legend: true,
  },
};
