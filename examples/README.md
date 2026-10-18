# 示例库

4 个真实场景，均可独立打开。

## 前提

先构建 core 与 web-component：

```bash
pnpm build
```

然后在仓库根目录启动 HTTP 服务：

```bash
npx serve .
# 或
python3 -m http.server 8080
```

访问：

- `http://localhost:8080/examples/travel/`
- `http://localhost:8080/examples/developer/`
- `http://localhost:8080/examples/team/`
- `http://localhost:8080/examples/resume/`

## 场景

| 示例         | 风格     | 数据         | 适合               |
| ------------ | -------- | ------------ | ------------------ |
| `travel/`    | 暖色大图 | 单分类 6 点  | 旅行博客、年度总结 |
| `developer/` | 极简灰   | 双分类 10 点 | 个人主页、关于页   |
| `team/`      | 商务蓝   | 单分类 8 人  | 团队分布、远程办公 |
| `resume/`    | 打印友好 | 双分类 8 点  | 简历、PDF 导出     |

## 通用结构

每个示例包含：

- `index.html` — 独立可打开
- `data/pins.json` — 数据
- `README.md` — 场景说明

## 定制

复制对应目录，替换 `data/pins.json` 中的数据，即可用于自己的站点。

也可直接使用 [在线 Builder](https://footprint-studio.pages.dev/builder/) 生成嵌入代码。
