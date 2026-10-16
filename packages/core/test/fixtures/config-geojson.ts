export const geojsonBasic = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [103.85, 1.29] },
      properties: { name: '2023.10 新加坡', category: 'residence', date: '2023-10' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [139.7594549, 35.6828387] },
      properties: { name: '2019.04 东京', category: 'travel' },
    },
  ],
};

export const geojsonMixed = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [139.759, 35.682] },
      properties: { name: '东京' },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [139.759, 35.682],
          [135.756, 35.021],
        ],
      },
      properties: {},
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [200, 35.682] },
      properties: { name: '越界点' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [103.85, 1.29] },
      properties: {},
    },
  ],
};
