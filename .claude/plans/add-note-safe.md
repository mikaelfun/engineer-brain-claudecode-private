# Plan: 重写 add-note 脚本

## 问题诊断

### Bug 1: 写入错误 Case
`add-note.ps1` 调用 `Get-CurrentCaseId` 从缓存/浏览器取 incidentid，忽略传入的 `$TicketNumber`。
WebUI submit 时缓存可能指向其他 case → 写入错误目标。

### Bug 2: 换行被写成 literal `\n`
`Invoke-D365Api` 通用转义链有 bug：
```
ConvertTo-Json: \n (1 backslash + n)  
→ -replace '\\','\\\\': \\\\n (4 backslashes + n)
→ JS parse: \\n (literal backslash + n)
→ D365 存储: \n 文本而非换行
```

### Bug 3: 静默失败
UI fallback 所有 playwright-cli 输出 piped 到 `Out-Null`，脚本无条件输出 `✅ Note added` 并 exit 0。

## 方案：新建 `add-note-safe.ps1`

保留旧脚本不动（其他地方可能引用），新脚本解决所有问题。

### 核心设计
1. **TicketNumber 必填** — 不再依赖缓存/浏览器上下文
2. **API-only** — 不走 UI fallback（服务端调用无浏览器意义）
3. **Base64 传递 body** — 绕过 `Invoke-D365Api` 的 JS 转义 bug，在 JS 层面 atob 解码后构建 JSON
4. **写前校验** — 写入前通过 incidentid 反查 ticketnumber，确认一致
5. **写后验证** — 写入后查询新 annotation，确认存在
6. **严格错误处理** — 任何步骤失败 → throw，不静默通过

### 参数
```
-TicketNumber  (Mandatory)  Case 编号
-Title         (Mandatory*)  标题
-Body          (Mandatory*)  正文
-TitleFile     (Optional)   从文件读 Title（优先于 -Title）
-BodyFile      (Optional)   从文件读 Body（优先于 -Body）
-DryRun        (Switch)     只验证，不写入
```

### 执行流程
```
1. 读取 Title/Body（文件或参数）
2. Get-IncidentId -TicketNumber → 解析 incidentid
3. 反查验证：GET /incidents($id)?$select=ticketnumber → 确认匹配
4. Base64 编码 title + body
5. 通过 Invoke-PlaywrightCode 执行自定义 JS：
   - atob 解码 title/body
   - JSON.stringify 构建 payload（JS 层面处理，无 PS→JS 转义问题）
   - fetch POST /api/data/v9.0/annotations
   - 返回 annotationid 或 error
6. 解析返回值，验证 status 204 + entityId
7. 写后验证：GET /annotations($newId) → 确认 subject 匹配
8. 输出 JSON 结果供调用方解析
```

### 输出格式
```json
{"success":true,"annotationId":"xxx","ticketNumber":"xxx","title":"xxx"}
{"success":false,"error":"Ticket number mismatch: expected xxx, got yyy"}
```

最后一行固定是 JSON，调用方用 `tail -1` 取结果。

## 同步修改

### `note-gap-routes.ts` submit 路由
- 改为调用 `add-note-safe.ps1`
- 解析最后一行 JSON 判断成功/失败
- 失败时返回 500 + 错误信息，**不删 draft**
- 成功时才删 draft + 调 fetch-notes 刷新

## 文件变更清单
| 文件 | 操作 |
|------|------|
| `skills/d365-case-ops/scripts/add-note-safe.ps1` | 新建 |
| `dashboard/src/routes/note-gap-routes.ts` | 修改 submit 路由 |
