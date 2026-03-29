## Mode 1: `dashboard`（默认）

**一屏总览**。快速了解测试循环当前状态、执行进度和异常情况。

### 执行步骤

1. 运行 dashboard 渲染脚本：
   ```bash
   bash tests/executors/dashboard-renderer.sh
   ```
2. 将输出**原样展示**（不要重新格式化或省略任何 section）
3. 如果输出包含 `⚠️ Attention` 下的 🔴/🟡 项，在输出后追加**一行**简短建议

---
