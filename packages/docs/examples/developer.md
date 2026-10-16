# 开发者主页

极简灰、等宽字体。适合个人主页的 About 页。

## 效果

- 等宽字体，无装饰
- 提示符 `$ ` 前缀与路径 `~/about`
- 双分类：居住（蓝）+ 旅行（橙）
- 底部 meta 行显示统计

## 代码

```html
<footprint-globe
  data-src="./data/pins.json"
  height="480px"
  theme="light"
  legend="true"></footprint-globe>
```

## 风格要点

| 项     | 值                  |
| ------ | ------------------- |
| 字体   | monospace           |
| 背景色 | `#fafafa`           |
| 边框   | 1px `#e5e5e5`       |
| 圆角   | 8px                 |
| 强调色 | `#10b981`（提示符） |

## 数据

双分类：5 居住 + 5 旅行。

## 完整源码

[GitHub → examples/developer](https://github.com/footprint-studio/footprint-studio/tree/main/examples/developer)
