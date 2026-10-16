import type { FootprintConfig } from '../../src/config/schema';

export const configFull: FootprintConfig = {
  version: 1,
  dataId: 'Ab12Cd34',
  categories: [
    {
      id: 'residence',
      label: '居住',
      color: '#2563eb',
      icon: 'dot',
      pins: [{ name: '新加坡', coords: [103.851959, 1.29027] }],
    },
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      icon: 'pin',
      pins: [
        {
          name: '东京',
          coords: [139.7594549, 35.6828387],
          date: '2019-04',
          note: '春天看樱花',
          photos: ['https://a.jpg', 'https://b.jpg'],
        },
      ],
    },
  ],
  config: {
    projection: 'globe',
    theme: 'light',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [100, 30],
    zoom: 1.2,
    pitch: 0,
    bearing: 0,
    legend: true,
    autorotate: false,
    attribution: false,
    privacy: { blur: 0, cityOnly: false },
  },
};
