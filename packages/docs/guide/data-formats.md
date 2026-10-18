# 数据格式

支持 JSON（主格式）、CSV、GeoJSON。

## JSON

见 [配置协议](/guide/config-protocol)。

---

## CSV

适合从 Excel / 表格导入。

### 列定义

| 列 | 必填 | 说明 |
|---|---|---|
| `name` | 是 | 地点名称，长度 ≤ 200 |
| `lng` | 是 | 经度 `[-180, 180]` |
| `lat` | 是 | 纬度 `[-90, 90]` |
| `category` | 否 | 分类 ID，匹配 `^[a-z][a-z0-9-]*$`，缺失归 `default` |
| `date` | 否 | ISO 日期，如 `2023-10` |
| `note` | 否 | 备注，长度 ≤ 500 |
| `photos` | 否 | 多个 URL 用 `\|` 分隔，最多 5 个 |

### 示例

```csv
name,lng,lat,category,date,note,photos
2023.10 新加坡,103.851959,1.29027,residence,2023-10,,https://a.jpg|https://b.jpg
2019.04 东京,139.7594549,35.6828387,travel,2019-04,春天看樱花,
2019.04 京都,135.7556075,35.021041,travel,2019-04,,
```

### 约束

- 首行必须为表头
- 行数 ≤ 1000（超出警告并截断）
- 文件 ≤ 1MB
- UTF-8 编码
- 逗号分隔；字段含逗号需引号包裹
- 字段顺序无关
- 空行忽略

### 错误处理

| 情况 | 行为 |
|---|---|
| 缺少必填列 | 整体失败，提示缺哪列 |
| 单行坐标越界 | 跳过该行，记录警告 |
| 单行分类不合法 | 归入 `default`，记录警告 |

---

## GeoJSON

标准地理数据交换格式。**仅处理 `Point`。**

### 支持

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [103.85, 1.29] },
      "properties": {
        "name": "2023.10 新加坡",
        "category": "residence",
        "date": "2023-10",
        "note": "",
        "photos": []
      }
    }
  ]
}
```

| 属性 | 必填 | 说明 |
|---|---|---|
| `name` | 否 | 缺失用 `未命名` 占位 |
| `category` | 否 | 缺失归 `default` |
| `date` | 否 | ISO 日期 |
| `note` | 否 | 备注 |
| `photos` | 否 | 字符串数组 |

### 不支持（跳过并警告）

- `LineString` / `Polygon` / `MultiPoint` / `MultiLineString` / `MultiPolygon`
- `GeometryCollection`
- 嵌套 `FeatureCollection`

### 错误处理

| 情况 | 行为 |
|---|---|
| 顶层不是 `FeatureCollection` | 整体失败 |
| 非 `Point` feature | 跳过并警告 |
| 坐标越界 | 跳过并警告 |

---

## 共同约束

| 项 | 上限 | 超出行为 |
|---|---|---|
| 总标记数 | 1000 | 警告并截断 |
| 文件大小 | 1MB | 拒绝加载 |
| `name` 长度 | 200 | 截断 |
| `note` 长度 | 500 | 截断 |
| `photos` 数量 | 5 | 截断 |
| 分类数量 | 8 | 警告 |

---

## 数据量建议

| 数据量 | 推荐方式 |
|---|---|
| < 2 KB | Web Component + `data-pins` 内联 |
| 2 KB – 50 KB | Web Component + `data-src` 自托管 |
| > 50 KB | iframe + `data-src`（v1.1 支持短链托管） |

[在线 Builder](https://footprint-studio.pages.dev/builder/) 会根据数据量自动推荐。
