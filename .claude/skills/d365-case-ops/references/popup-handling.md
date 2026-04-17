# 弹窗处理策略

D365 Copilot Service workspace 在操作过程中会弹出各种对话框和提示。Agent 需要在每个关键操作后检测并处理这些弹窗。

## 已知弹窗清单

### 1. Copilot 广告弹窗 "A Copilot for you!"

- **触发条件**：首次进入 Copilot Service workspace
- **出现频率**：每个浏览器 session 可能出现一次
- **处理方式**：
  ```
  playwright-cli click <Dismiss 按钮的 ref>
  ```
  选择器：`getByRole('button', { name: 'Dismiss' })`

### 2. 麦克风权限提示

- **触发条件**：进入 workspace 后（与 OneVoice Connector 相关）
- **表现**：顶部 alert bar，提示 "To make a voice call, you must allow your browser to access your microphone"
- **处理方式**：点击 Close 按钮，或直接忽略（不阻塞操作）
  ```
  选择器：alert 区域内的 getByRole('button', { name: 'Close' })
  ```

### 3. AI "Change status for this case" 对话框

- **触发条件**：添加 Note 后，如果笔记内容中包含状态相关关键词（如 "waiting on customer"、"resolved" 等），D365 AI 会自动分析并建议变更 Case 状态
- **出现频率**：不确定，取决于笔记内容
- **表现**：模态对话框，标题 "Change status for this case"，包含 Case Number（只读）和 "Change status to" 下拉框
- **处理方式**：
  ```javascript
  // 用 run-code 检测并处理
  const dialog = page.getByRole('dialog', { name: 'Change status for this case' });
  try {
    await dialog.waitFor({ timeout: 5000 });
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  } catch {
    // 没出现，正常继续
  }
  ```
- **注意**：如果用户明确要求改状态，可以选择对应状态后点 Submit

### 4. Permission prompt 标签页

- **触发条件**：Edge 浏览器权限请求
- **表现**：在 tab-list 中出现第二个标签页 `edge://permission-request-dialog/`
- **处理方式**：忽略，不影响操作。如需关闭：`playwright-cli tab-close 1`

### 5. OneVoice Connector session 错误

- **触发条件**：进入 workspace 后，OneVoice Connector 面板加载失败
- **表现**：面板中显示 "There is a problem with your session. Please clear your browser cache or try resetting your session and try again."
- **处理方式**：忽略，不影响 Case 操作。该面板在右侧，可以折叠。

## 通用容错模式

在 **每个工作流的关键操作后**（如保存 Note、保存 Labor、打开 Case 后），执行以下检查：

```
# 检查是否有 Dismiss 按钮（Copilot 广告等）
尝试 click getByRole('button', { name: 'Dismiss' })，超时 2 秒后放弃

# 检查是否有 Change status 对话框
尝试检测 getByRole('dialog', { name: 'Change status for this case' })，有则 Cancel

# 检查是否有其他模态对话框
尝试 press Escape，超时 1 秒后放弃
```

**原则**：宁可多检查一次（浪费 2 秒），也不要让弹窗阻塞后续操作。
