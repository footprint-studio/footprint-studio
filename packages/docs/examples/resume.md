# 简历

打印友好、紧凑布局。适合作为简历的补充材料。

## 效果

- 顶部信息条（姓名 / 职位 / 联系方式）
- 3D 地球（360px，紧凑）
- 时间轴展示居住、教育
- 打印优化

## 代码

```html
<div class="globe-wrap">
  <footprint-globe
    data-src="./data/pins.json"
    height="360px"
    theme="light"
    legend="true"></footprint-globe>
</div>
```

## 风格要点

| 项   | 值            |
| ---- | ------------- |
| 背景 | `#fff`        |
| 主色 | `#111827`     |
| 边框 | 1px `#e5e7eb` |
| 圆角 | 10px          |

## 打印

浏览器「打印 → 另存为 PDF」。`@media print` 已去除多余留白。

**注意：** 静态 PDF 中地图不可交互，仅作为缩略图。

## 隐私建议

简历公开时建议开启隐私模式：

```json
{
  "config": {
    "privacy": { "cityOnly": true }
  }
}
```

这样坐标保留 2 位小数，约 1km 精度。

## 完整源码

[GitHub → examples/resume](https://github.com/footprint-studio/footprint-studio/tree/main/examples/resume)
