# 团队分布

商务蓝，左右分栏。适合团队「关于」页或远程办公主页。

## 效果

- 左侧地球（560px）
- 右侧成员列表（320px）
- 顶部实时在线徽章
- 窄屏纵向堆叠

## 代码

```html
<div class="layout">
  <footprint-globe
    data-src="./data/pins.json"
    height="560px"
    legend="true"></footprint-globe>

  <aside class="members">
    <!-- 成员列表 -->
  </aside>
</div>
```

## 风格要点

| 项     | 值                        |
| ------ | ------------------------- |
| 背景色 | `#f1f5f9`                 |
| 主色   | `#10b981`（在线点、标记） |
| 圆角   | 16px                      |
| 布局   | Grid 1fr + 320px          |

## 数据

8 位成员，分布全球 3 大洲。

## 扩展思路

- 点击标记时高亮右侧对应成员（监听 `marker:click`）
- 若成员 > 20，建议分页或改用列表

## 完整源码

[GitHub → examples/team](https://github.com/footprint-studio/footprint-studio/tree/main/examples/team)
