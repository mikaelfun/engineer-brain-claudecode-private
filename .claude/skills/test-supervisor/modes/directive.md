## Mode 5: `directive <type> [payload]`

**下达指令**。写入 `tests/directives.json` 供 test-loop 的 Step 0.5 处理。

### 快捷语法

| 命令 | 示例 |
|------|------|
| `directive pause` | 暂停 loop |
| `directive resume` | 恢复 loop |
| `directive skip <testId> "<reason>"` | 跳过测试 |
| `directive force_phase <phase>` | 强制切换阶段（SCAN/TEST/FIX/VERIFY） |
| `directive adjust_config <key> <value>` | 修改 state.json 配置 |
| `directive add_requirement "<description>"` | 注入新需求 |
| `directive add_learning "<id>" "<category>" "<problem>" "<solution>"` | 注入经验 |
| `directive note "<message>"` | 纯备注 |
| `directive prioritize <testId> <priority>` | 调整优先级（1=highest） |

### 执行步骤

1. 读取 `tests/directives.json`
2. 生成新指令 ID：`dir-{NNN}`（基于已有 directives 数量 + 1，3 位补零）
3. 根据 type 构造 payload：

   **pause/resume**:
   ```json
   { "type": "pause|resume", "payload": {} }
   ```

   **skip**:
   ```json
   { "type": "skip_test", "payload": { "testId": "<testId>", "reason": "<reason>" } }
   ```

   **force_phase**:
   ```json
   { "type": "force_phase", "payload": { "phase": "<SCAN|TEST|FIX|VERIFY>" } }
   ```
   验证 phase 必须是有效值，否则拒绝。

   **adjust_config**:
   ```json
   { "type": "adjust_config", "payload": { "key": "<key>", "value": "<value>" } }
   ```
   value 如果是纯数字则转为 number 类型。

   **add_requirement**:
   ```json
   { "type": "add_requirement", "payload": { "description": "<desc>", "priority": "normal", "category": "auto" } }
   ```

   **add_learning**:
   ```json
   { "type": "add_learning", "payload": { "id": "<id>", "category": "<cat>", "description": "<problem>", "solution": "<solution>" } }
   ```

   **note**:
   ```json
   { "type": "note", "payload": { "message": "<message>" } }
   ```

   **prioritize**:
   ```json
   { "type": "prioritize", "payload": { "testId": "<testId>", "priority": <N> } }
   ```

4. 写入 directive：
   ```json
   {
     "id": "dir-001",
     "type": "<type>",
     "status": "pending",
     "payload": { ... },
     "createdAt": "<ISO timestamp>",
     "processedAt": null,
     "processedResult": null
   }
   ```

5. 对于 `pause`，**额外**直接设置 `directives.json` 顶层 `paused: true`（立即生效）
6. 对于 `resume`，**额外**直接设置 `directives.json` 顶层 `paused: false`

7. 写回 `tests/directives.json`
8. 输出确认：
   ```
   ✅ Directive {id} created: {type}
   📋 Payload: {JSON payload}
   ⏳ Status: pending — will be processed in next test-loop round
   ```

### 用 node 原子写入

```bash
DIRECTIVES_FILE="tests/directives.json"
NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const d = JSON.parse(fs.readFileSync('$DIRECTIVES_FILE', 'utf8'));
  const nextNum = (d.directives || []).length + 1;
  const id = 'dir-' + String(nextNum).padStart(3, '0');
  const now = new Date().toISOString();
  const directive = {
    id,
    type: '<TYPE>',
    status: 'pending',
    payload: <PAYLOAD_JSON>,
    createdAt: now,
    processedAt: null,
    processedResult: null
  };
  d.directives.push(directive);
  // For pause/resume, also set top-level flag
  fs.writeFileSync('$DIRECTIVES_FILE', JSON.stringify(d, null, 2) + '\n');
  console.log(JSON.stringify({ id, type: directive.type, payload: directive.payload }));
"
```

---

## Mode 6: `directives`

**查看指令队列**。列出所有已创建的指令及其状态。

### 执行步骤

1. 读取 `tests/directives.json`
2. 格式化输出：

```
📋 Directive Queue (v{version})
═══════════════════════════════════════
⏸️ Loop Paused: {yes/no}

{for each directive:}
{status_emoji} {id} [{type}] — {status}
   Payload: {JSON.stringify(payload)}
   Created: {createdAt}
   {if processed: Processed: {processedAt} — {processedResult}}

{status emoji mapping:}
  pending   → ⏳
  processed → ✅
  rejected  → ❌

─────────────────────────────────────
Summary: {pending} pending, {processed} processed, {rejected} rejected
═══════════════════════════════════════
```

如果 directives 为空：
```
📋 Directive Queue — Empty
No directives have been issued.
Use /test-supervisor directive <type> to create one.
```

---

