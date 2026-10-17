# 自动部署启用指南（Cloudflare Pages）

> 适用仓库：`footprint-studio/footprint-studio`
> 工作流：`.github/workflows/deploy.yml`（push 到 `main` 或手动触发）
> 部署目标：主站 `footprint-studio` + 嵌入页 `footprint-studio-embed` 两个 Cloudflare Pages 项目

---

## 一、原理说明

`deploy.yml` 的执行条件是仓库变量 `DEPLOY_CLOUDFLARE == "true"`：

- **未配置**时：Deploy 工作流自动跳过（显示 ⏭ skipped，不报错）；
- **配置后**：每次 push 到 `main`，GitHub Actions 会自动完成
  `安装依赖 → 构建 5 个包 → 组装 dist-site → 部署到 Cloudflare Pages` 全流程。

流程中需要两把密钥，全部存放在 GitHub Secrets 中，**不会出现在代码里**：

| 名称 | 类型 | 存放位置 | 用途 |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret | Actions Secrets | 调用 Cloudflare API 上传部署产物 |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Actions Secrets | 标识部署到哪个 Cloudflare 账号 |
| `DEPLOY_CLOUDFLARE` | **Variable**（明文开关） | Actions Variables | 控制部署流水线是否执行 |

---

## 二、获取 Cloudflare API Token（约 2 分钟）

1. 打开 <https://dash.cloudflare.com/> 并登录
2. 右上角头像 → **My Profile**（我的个人资料）
3. 左侧 **API Tokens**（API 令牌）→ **Create Token**（创建令牌）
4. 在模板列表中选择 **"Edit Cloudflare Workers"** 模板旁的 **Use template**，
   然后按下表调整权限（或直接自定义）：

   | 设置项 | 值 |
   |---|---|
   | 权限 1 | **Account** → **Cloudflare Pages** → **Edit** |
   | Account Resources | Include → 你的账号 |
   | Zone Resources | 可留空（Pages 部署不需要 Zone 权限） |
   | Client IP Filtering | 留空 |
   | TTL（有效期） | 建议设置到期时间，到期自动失效 |

5. **Continue to summary** → **Create Token**
6. **立即复制**页面显示的 Token（只显示这一次），形如 `xxxxxxxx...` 的 40 位字符串

## 三、获取 Account ID

1. 回到 Cloudflare Dashboard 首页
2. 右侧栏 **Account ID**（账户 ID），或进入 **Workers & Pages** 概览页右侧复制
3. 形如 32 位十六进制字符串，如 `a1b2c3d4...`

---

## 四、在 GitHub 配置 Secrets 与 Variable（约 1 分钟）

打开仓库页面 → **Settings** → 左栏 **Secrets and variables** → **Actions**
（注意选 **Actions** 这一分类，不是 Codespaces / Dependabot）。

### 4.1 添加两个 Secret

在 **Secrets** 标签页 → 右上 **New repository secret**，分别添加：

**第 1 个：**

- Name: `CLOUDFLARE_API_TOKEN`
- Secret: 粘贴第二步生成的 API Token

**第 2 个：**

- Name: `CLOUDFLARE_ACCOUNT_ID`
- Secret: 粘贴第三步复制的 Account ID

### 4.2 添加开关 Variable

切换到同一页面顶部的 **Variables** 标签页 → **New repository variable**：

- Name: `DEPLOY_CLOUDFLARE`
- Value: `true`

> ⚠️ Secret 和 Variable 是两个不同的标签页，别把 `DEPLOY_CLOUDFLARE` 加到 Secrets 里——工作流读取的是 `${{ vars.DEPLOY_CLOUDFLARE }}`。

---

## 五、触发首次自动部署

配置完成后任选一种方式：

**方式 A：随便推一个提交到 main**（比如改个 README）。

**方式 B：手动触发**

1. 仓库顶部 **Actions** 标签页
2. 左侧列表选 **Deploy** 工作流
3. 右侧 **Run workflow** → 分支 `main` → **Run workflow**

### 验证部署成功

- Actions 页面中 Deploy 工作流变绿 ✅，点进日志能看到两行部署 URL：
  - `footprint-studio` → <https://footprint-studio.pages.dev>
  - `footprint-studio-embed` → <https://footprint-studio-embed.pages.dev>
- 打开线上地址，标题应为「足迹地球」，且内容为最新提交的构建产物

---

## 六、日常工作流（配置完成后无需再动）

| 你做的事 | 系统自动做的事 |
|---|---|
| push 代码到 main | CI 校验（format/lint/typecheck/test）→ 自动构建并部署两个 Pages 站点 |
| `pnpm changeset` 写变更 + push | Release 机器人自动开 "chore: version packages" PR |
| 合并 Version PR（需另配 `NPM_TOKEN`） | 自动发布 npm 包并打 git tag |

线上更新延迟约 3~5 分钟（构建 + 上传）。

---

## 七、常见问题排查

| 现象 | 原因与处理 |
|---|---|
| Deploy 显示 skipped | `DEPLOY_CLOUDFLARE` 变量未配置或值不是 `true`（注意在 Variables 页签，不是 Secrets） |
| 日志报 `Authentication error [code: 10000]` | API Token 无效或过期 → 重新生成并更新 Secret |
| 日志报 `RequestError: Authentication failed` 或 403 | Token 权限不足 → 确认含 **Account → Cloudflare Pages → Edit** |
| 日志报 `project not found` | Pages 项目被误删 → 到 Cloudflare Dashboard 重建同名项目，或本地 `wrangler pages project create footprint-studio --production-branch=main` |
| 部署成功但页面没变化 | 浏览器缓存 → 强刷（Cmd+Shift+R）；Pages 也可能需要 1 分钟传播 |
| 想临时停止自动部署 | 把 Variable `DEPLOY_CLOUDFLARE` 改为 `false`（不用删 Secret） |

---

## 八、可选：启用 npm 自动发版

`release.yml` 已就位，补一个 Secret 即可：

1. npmjs.com → 头像 → **Access Tokens** → **Generate New Token** → 选 **Granular Access Token**，勾选 **Read and write**（或 Classic 的 Automation 类型）
2. GitHub 仓库 → Secrets → New repository secret：
   - Name: `NPM_TOKEN`
   - Secret: 粘贴 token
3. 流程：本地 `pnpm changeset` 描述变更 → push → 机器人开 Version PR → 合并 → 自动 `changeset publish` + 打 tag

---

## 九、安全建议

- API Token 设置有效期（TTL），到期在 Cloudflare 后台续期即可
- 定期到 GitHub → Settings → **Personal access tokens** 清理不再使用的 PAT（如今天用于推送的 `footprint-ci-push`，任务完成请立即 **Revoke**）
- Secrets 一旦泄漏（如误贴到公开场合），立即在 Cloudflare **API Tokens → Roll** 重置，并同步更新 GitHub Secret

---

## 十、启用记录

- 2026-10-17：Secrets（`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`）与 Variable（`DEPLOY_CLOUDFLARE=true`）配置完成，自动部署流水线启用。
- 2026-10-18：`NPM_TOKEN` 更换为可绕过 2FA 的 token，npm 自动发版链路启用。
