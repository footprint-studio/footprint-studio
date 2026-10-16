# 旅行博客

暖色大图风格，适合旅行博客的「关于」页或年度总结。

## 效果

- 大标题 + 短文
- 3D 地球（520px）
- 底部统计卡（城市数、国家数、最近出发）

## 代码

```html
<div class="globe-wrap">
  <footprint-globe
    data-src="./data/pins.json"
    height="520px"
    theme="light"
    projection="globe"
    legend="true"></footprint-globe>
</div>
```

## 风格要点

| 项     | 值                                          |
| ------ | ------------------------------------------- |
| 背景色 | `#fefaf6`（暖白）                           |
| 主色   | `#ea580c`（橙）                             |
| 圆角   | 20px                                        |
| 阴影   | `0 20px 60px -20px rgba(234, 88, 12, 0.25)` |

## 数据

单分类，6 个城市。`pins` 数组每项包含 `name`、`coords`、`date`。

## 完整源码

[GitHub → examples/travel](https://github.com/footprint-studio/footprint-studio/tree/main/examples/travel)
