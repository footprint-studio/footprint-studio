import type { FootprintConfig } from '../../src/config/schema';

export const configBasic: FootprintConfig = {
  version: 1,
  categories: [
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [
        { name: '东京', coords: [139.7594549, 35.6828387] },
        { name: '京都', coords: [135.7556075, 35.021041] },
        { name: '大阪', coords: [135.5014539, 34.6937569] },
      ],
    },
  ],
};

export const configMulti: FootprintConfig = {
  version: 1,
  dataId: 'aBc12XyZ',
  categories: [
    {
      id: 'residence',
      label: '居住',
      color: '#2563eb',
      pins: [{ name: '2023.10 新加坡', coords: [103.851959, 1.29027] }],
    },
    {
      id: 'travel',
      label: '旅行',
      color: '#f97316',
      pins: [{ name: '2019.04 东京', coords: [139.7594549, 35.6828387] }],
    },
  ],
};
