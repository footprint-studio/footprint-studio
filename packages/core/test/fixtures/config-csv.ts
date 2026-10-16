export const csvBasic = `name,lng,lat,category,date,note,photos
2023.10 新加坡,103.851959,1.29027,residence,2023-10,,https://a.jpg|https://b.jpg
2019.04 东京,139.7594549,35.6828387,travel,2019-04,春天看樱花,
2019.04 京都,135.7556075,35.021041,travel,2019-04,,
`;

export const csvMissingColumns = `name,lng
东京,139.759
`;

export const csvOutOfRange = `name,lng,lat
东京,200,35.68
京都,135.75,35.02
`;

export const csvBadCategory = `name,lng,lat,category
东京,139.759,35.682,TOKYO
`;
