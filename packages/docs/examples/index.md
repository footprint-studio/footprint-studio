# 示例

4 个真实场景，均可独立打开。复制对应目录即可用于自己的站点。

## 场景总览

| 示例 | 风格 | 适合 |
|---|---|---|
| [旅行博客](/examples/travel) | 暖色大图 | 关于页、年度总结 |
| [开发者主页](/examples/developer) | 极简灰 | About、个人主页 |
| [团队分布](/examples/team) | 商务蓝 | 团队页、远程办公 |
| [简历](/examples/resume) | 打印友好 | 简历、PDF 导出 |

## 快速预览

::: code-group

```html [旅行博客]
<div class="globe-wrap">
  <footprint-globe
    data-src="./data/pins.json"
    height="520px"
    legend="true"></footprint-globe>
</div>
```

```html [开发者主页]
<footprint-globe
  data-src="./pins.json"
  height="480px"
  theme="light"
  legend="true"></footprint-globe>
```

```html [团队分布]
<footprint-globe
  data-src="./team.json"
  height="560px"
  legend="true"></footprint-globe>
```

```html [简历]
<footprint-globe
  data-src="./resume.json"
  height="360px"
  legend="true"></footprint-globe>
```

:::

## 源代码

所有示例在 GitHub：

```
examples/
├── travel/
├── developer/
├── team/
└── resume/
```

[GitHub → examples](https://github.com/footprint-studio/footprint-studio/tree/main/examples)

## 定制

复制对应目录 → 替换 `data/pins.json` → 调整文案与样式。

或直接使用 [在线 Builder](https://footprint-studio.pages.dev/builder/) 生成嵌入代码。
