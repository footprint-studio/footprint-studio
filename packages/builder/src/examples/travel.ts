import type { FootprintConfig } from 'footprint-globe';

export const travel: FootprintConfig = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [
        { name: '2019.04 东京', coords: [139.7594549, 35.6828387] },
        { name: '2019.04 京都', coords: [135.7556075, 35.021041] },
        { name: '2019.04 大阪', coords: [135.5014539, 34.6937569] },
        { name: '2022.12 巴黎', coords: [2.3200571537017827, 48.85914127882758] },
        { name: '2022.12 罗马', coords: [12.483054399490358, 41.893639222307314] },
        { name: '2022.12 威尼斯', coords: [12.334846258163454, 45.43740243405552] },
        { name: '2023.08 维也纳', coords: [16.372418403625492, 48.20871655750039] },
        { name: '2023.08 布达佩斯', coords: [19.077758789062504, 47.57652571374621] },
        { name: '2023.11 香港', coords: [114.1693611, 22.3193039] },
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
