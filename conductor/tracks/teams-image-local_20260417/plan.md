# Implementation Plan: Teams Chat 图片本地化

**Track ID:** teams-image-local_20260417
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-17
**Status:** [x] Complete

## Overview

四阶段实现：① teams-search-inline.sh 下载图片到 teams/assets/ → ② write-teams.ps1 替换 URL → ③ generate-digest.py teams 分支 vision 支持 → ④ WebUI 后端 API + 前端渲染。

## Phase 1: Image Download — teams-search-inline.sh 图片下载

在 teams-search-inline.sh 的 Python heredoc 中，消息获取后、JSON 输出前，解析 HTML body 中的 hostedContents URL 并下载图片。

### Tasks

- [x] Task 1.1: 在 Python heredoc 的 `fetch_chat_messages()` 后添加 `download_hosted_images()` 函数 — 扫描每条消息的 `body.content` HTML，提取 `<img src="https://graph.microsoft.com/.../hostedContents/.../$value">` URL，通过 agency proxy 或直接 HTTP 下载到 `{caseDir}/teams/assets/`。文件名：`{msgId}_{index}.png`。跳过 >1MB 的图片。
- [x] Task 1.2: 探索 agency proxy 图片下载能力 — 测试通过 `http://localhost:{PORT}` 代理 Graph API 请求是否可行。如不可行，从 agency proxy 的初始化响应或环境变量提取 Bearer token，用 requests 直接下载。
- [x] Task 1.3: 在输出 JSON（`_mcp-raw.json`）中添加 `imageMap` 字段 — 格式 `{"https://graph.microsoft.com/.../$value": "./assets/msg123_0.png", ...}`，供 write-teams.ps1 使用。
- [x] Task 1.4: 增量缓存逻辑 — 下载前检查 `{caseDir}/teams/assets/{filename}` 是否已存在，存在则跳过下载。imageMap 仍包含该文件的映射（供 write-teams.ps1 替换 URL）。日志输出 `skip: {filename} (cached)` / `download: {filename} ({size}KB)`。
- [x] Task 1.5: 添加 `--skip-images` 降级开关（环境变量 `TEAMS_SKIP_IMAGES=1`），跳过图片下载但保留原始 URL。

### Verification

- [ ] 手动运行 teams-search-inline.sh 对含图片的 case，确认 `teams/assets/` 目录生成且图片文件可查看
- [ ] 确认 `_mcp-raw.json` 包含 `imageMap` 映射

## Phase 2: URL 替换 — write-teams.ps1

修改 write-teams.ps1，读取 `imageMap` 并在 Strip-Html 阶段将 Graph API URL 替换为本地路径。

### Tasks

- [x] Task 2.1: 在 write-teams.ps1 的 input JSON 解析后读取 `imageMap`（`$data.imageMap`），构建 URL→本地路径的替换 hashtable
- [x] Task 2.2: 修改 `Strip-Html` 函数 — 在正则转换 `<img>` → `![](url)` 后，遍历 imageMap 替换 URL。或者更优：在正则匹配时直接查找 imageMap 替换。确保 `![image](./assets/msg123_0.png)` 格式正确。
- [x] Task 2.3: 处理增量写入场景 — 已有 chat md 中的旧 Graph API URL 也应被替换（避免混合态）。在 `Write-ChatFileIncremental` 的 rewrite 和 append 路径都应用 imageMap。

### Verification

- [ ] 运行 write-teams.ps1（带 imageMap 的测试 JSON），确认输出 .md 中图片引用为 `./assets/` 本地路径
- [ ] 确认无 imageMap 时行为不变（兼容性）

## Phase 3: LLM Vision — generate-digest.py teams 分支

复用 OneNote 分支的 vision 模式，在 teams digest 生成时传入图片。

### Tasks

- [x] Task 3.1: 在 `generate_teams_digest()` 中添加图片检测 — 检查 `{caseDir}/teams/assets/` 目录是否存在且有图片文件
- [x] Task 3.2: 新增 `extract_images_from_chat(chat_path, assets_dir, max_images=3)` 函数 — 解析 chat md 中的 `![...](./assets/xxx.png)` 引用，从 `teams/assets/` 读取对应文件 base64 编码，返回 vision content blocks
- [x] Task 3.3: 修改 `generate_teams_digest()` 的 user_prompt 构建 — 有图片时从 str 改为 list[dict] 格式（文本 + 图片 blocks），复用 call_llm 的 vision 支持
- [x] Task 3.4: 更新 system_prompt — 增加"从截图中提取错误信息、配置详情、Portal 界面状态等关键诊断信息"指令

### Verification

- [ ] 运行 generate-digest.py 对含图片的 case，确认 LLM API 请求包含 image_url content blocks
- [ ] 确认 teams-digest.md 输出包含图片分析内容

## Phase 4: WebUI — 后端 API + 前端渲染

后端新增 teams assets 路由，前端 TeamsTab 替换图片路径。

### Tasks

- [x] Task 4.1: 后端 `cases.ts` 新增 `GET /api/cases/:id/teams/assets/:filename` — 复用 OneNote assets 路由模式（line 977-1016），从 `{caseDir}/teams/assets/` 读取图片，路径安全校验
- [x] Task 4.2: 前端 `CaseDetail.tsx` TeamsTab — MarkdownContent 中拦截 `./assets/` 开头的图片路径，替换为 `/api/cases/${caseNumber}/teams/assets/${filename}`。方案：自定义 img renderer 或 content 预处理。
- [x] Task 4.3: 图片展示优化 — 点击放大（lightbox/modal），限制默认宽度 max-width: 100%，loading 占位。复用 OneNote 的 lightbox 逻辑（如已实现）。

### Verification

- [ ] 打开 WebUI Case 详情页 Teams tab，确认图片内联渲染
- [ ] 确认图片点击可放大
- [ ] 确认无图片时不报错

## Phase 5: OneNote 图片增量缓存

检查并修复 search-inline.py 的 assets 复制逻辑，确保已存在的图片不重复拷贝。

### Tasks

- [x] Task 5.1: 审计 search-inline.py 的 `copy_page_assets()` 函数 — 确认是否有文件存在性检查。如果没有，添加：目标文件已存在且 size 一致时跳过拷贝，输出 `skip: {filename} (cached, {size}B)`。
- [x] Task 5.2: 验证增量场景 — 第一次搜索复制 assets → 第二次搜索相同 case 时确认不重复拷贝

### Verification

- [ ] 运行两次 search-inline.py（同一 case），确认第二次 assets 文件不被重写（比较 mtime 或日志输出）

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | teams-search 下载 hostedContents | E2E | 找到含图片的 Teams chat → 运行 teams-search-inline.sh → 验证 teams/assets/ 目录有图片 → 验证 _mcp-raw.json 有 imageMap → 清理 |
| 2 | write-teams.ps1 URL 替换 | E2E | 构造含 imageMap 的测试 JSON + teams/assets/ 图片 → 运行 write-teams.ps1 → 验证 chat md 中引用为 ./assets/ 路径 → 清理 |
| 3 | generate-digest.py vision | E2E | 备份 teams/ → 放入含本地图片的 chat md + assets/ → 运行 generate-digest.py --type teams → 验证 API payload 含 image_url → 验证 digest 含图片分析 → 恢复 |
| 4 | 后端 teams/assets 端点 | API | curl GET /api/cases/{id}/teams/assets/{filename} → 验证返回 image/png + 正确内容 → 测试 ../../../etc/passwd 路径被拒绝 |
| 5 | WebUI 图片内联渲染 | Visual | 确保 case 有 teams 图片数据 → 打开 CaseDetail → Teams tab → 截图验证图片渲染 |
| 6 | Teams 图片增量缓存 | E2E | 下载图片到 teams/assets/ → 记录 mtime → 再次运行 teams-search → 验证图片 mtime 未变 + 日志输出 skip |
| 7 | OneNote 图片增量缓存 | E2E | 拷贝 assets 到 onenote/assets/ → 记录 mtime → 再次运行 search-inline.py → 验证图片 mtime 未变 + 日志输出 skip |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON 状态已更新为 `implemented`（非 `done`，需 verify 后才可标 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
