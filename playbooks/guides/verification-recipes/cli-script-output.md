# Recipe: CLI Script Output Verification

## 匹配条件

验收标准涉及：CLI 命令、shell 脚本输出、stdout/stderr 格式、脚本行为、退出码、确定性输出

## 前置检查

1. **脚本存在**: `test -f "$SCRIPT_PATH"` → 存在
2. **可执行权限**: `test -x "$SCRIPT_PATH"` → 有（或用 `bash "$SCRIPT_PATH"` 调用）
3. **依赖工具**: 检查脚本依赖的外部命令是否可用（`which jq`, `which pwsh` 等）
4. **Git Bash 环境**: 路径必须 POSIX 格式（`/c/Users/...` 不是 `C:\Users\...`）

## 执行步骤

### 1. 备份测试数据

```bash
# 如果脚本会修改文件，先备份
BACKUP_DIR=$(mktemp -d)
cp -r "$TARGET_DIR" "$BACKUP_DIR/"
```

### 2. 构造测试输入

```bash
# 根据验收标准构造场景数据
# 例：构造特定的 JSON 文件、meta 数据等
echo '{"status": "test"}' > "$TEST_DIR/input.json"
```

### 3. 运行脚本 + 捕获输出

```bash
# 同时捕获 stdout、stderr 和退出码
OUTPUT=$(bash "$SCRIPT_PATH" --arg1 val1 2>&1)
EXIT_CODE=$?

# 或分开捕获
STDOUT=$(bash "$SCRIPT_PATH" --arg1 val1 2>/dev/null)
STDERR=$(bash "$SCRIPT_PATH" --arg1 val1 2>&1 >/dev/null)
```

### 4. 验证输出

**退出码检查**:
```bash
if [ "$EXIT_CODE" -ne 0 ]; then
  echo "FAIL: exit code $EXIT_CODE (expected 0)"
fi
```

**输出内容检查**:
```bash
# 精确匹配
echo "$OUTPUT" | grep -qF "expected string" || echo "FAIL: missing expected output"

# 行数检查
LINE_COUNT=$(echo "$OUTPUT" | wc -l)
[ "$LINE_COUNT" -ge 5 ] || echo "FAIL: expected >= 5 lines, got $LINE_COUNT"

# JSON 输出验证
echo "$OUTPUT" | jq -e '.status == "success"' > /dev/null || echo "FAIL: JSON assertion failed"
```

**文件副作用检查**:
```bash
# 检查脚本生成的文件
test -f "$OUTPUT_FILE" || echo "FAIL: output file not created"
# 验证文件内容
grep -qF "expected content" "$OUTPUT_FILE" || echo "FAIL: file content mismatch"
```

### 5. 确定性验证（可选）

```bash
# 运行两次，输出应相同（忽略时间戳等动态字段）
OUT1=$(bash "$SCRIPT_PATH" 2>&1 | sed 's/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/DATE/g')
OUT2=$(bash "$SCRIPT_PATH" 2>&1 | sed 's/[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/DATE/g')
diff <(echo "$OUT1") <(echo "$OUT2") || echo "FAIL: non-deterministic output"
```

### 6. 恢复数据

```bash
# 恢复备份
rm -rf "$TARGET_DIR"
cp -r "$BACKUP_DIR/"* "$TARGET_DIR/"
rm -rf "$BACKUP_DIR"
```

## 常见坑

| 症状 | 原因 | 解决 |
|------|------|------|
| `No such file or directory` | Windows 路径格式 | 用 POSIX 格式 `/c/Users/...` |
| 变量值为空 | 赋值和 pipe 同一行 | 变量赋值独占一行（不用 `;`） |
| `local: not in a function` | `local` 用在函数外 | 改用普通变量赋值 |
| PowerShell 脚本路径错误 | Node.js 不认 POSIX 路径 | `cygpath -w "$POSIX_PATH"` 转换 |
| 输出含 ANSI 颜色码 | 脚本输出了颜色 | `\| sed 's/\x1b\[[0-9;]*m//g'` 去色 |
| 脚本输出含邮件正文 `❌` | 误判为错误 | 只检查最后 5 行判断 PASS/FAIL |
