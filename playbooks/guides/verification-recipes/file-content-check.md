# Recipe: File Content Verification

## 匹配条件

验收标准涉及：文件内容、行数、格式规范、JSON schema、Markdown 结构、YAML 格式、文件存在性、目录结构

## 前置检查

1. **目标文件/目录存在**: `test -f "$FILE_PATH"` 或 `test -d "$DIR_PATH"`
2. **Git Bash 路径**: POSIX 格式 `/c/Users/...`（不是 `C:\Users\...`）
3. **jq 可用**（如需 JSON 验证）: `which jq`

## 执行步骤

### 1. 文件存在性检查

```bash
# 单文件
test -f "$FILE_PATH" || echo "FAIL: file not found: $FILE_PATH"

# 批量文件
for f in file1.md file2.md file3.json; do
  test -f "$DIR/$f" || echo "FAIL: missing $f"
done

# 目录结构
for d in subdir1 subdir2; do
  test -d "$DIR/$d" || echo "FAIL: missing directory $d"
done
```

### 2. 文件内容检查

**关键字/段落存在**:
```bash
grep -qF "expected keyword" "$FILE_PATH" || echo "FAIL: missing keyword"

# 多个关键字
for keyword in "Section 1" "Section 2" "## Summary"; do
  grep -qF "$keyword" "$FILE_PATH" || echo "FAIL: missing '$keyword'"
done
```

**行数范围**:
```bash
LINE_COUNT=$(wc -l < "$FILE_PATH")
[ "$LINE_COUNT" -ge 10 ] || echo "FAIL: expected >= 10 lines, got $LINE_COUNT"
[ "$LINE_COUNT" -le 500 ] || echo "WARN: file unusually long ($LINE_COUNT lines)"
```

**文件大小**:
```bash
SIZE=$(wc -c < "$FILE_PATH")
[ "$SIZE" -gt 0 ] || echo "FAIL: file is empty"
```

### 3. JSON 验证

```bash
# 语法合法
jq empty "$FILE_PATH" 2>/dev/null || echo "FAIL: invalid JSON"

# 字段存在 + 值检查
jq -e '.id' "$FILE_PATH" > /dev/null || echo "FAIL: missing .id field"
jq -e '.status == "pending"' "$FILE_PATH" > /dev/null || echo "FAIL: status != pending"

# 数组长度
COUNT=$(jq '.items | length' "$FILE_PATH")
[ "$COUNT" -gt 0 ] || echo "FAIL: items array empty"

# 嵌套字段
jq -e '.phases.total > 0' "$FILE_PATH" > /dev/null || echo "FAIL: phases.total not > 0"
```

### 4. Markdown 结构验证

```bash
# 检查必需的 heading
for heading in "## Summary" "## Acceptance Criteria" "## Dependencies"; do
  grep -qF "$heading" "$FILE_PATH" || echo "FAIL: missing heading '$heading'"
done

# 检查 checklist 项数
CHECKBOX_COUNT=$(grep -c '^\- \[.\]' "$FILE_PATH")
[ "$CHECKBOX_COUNT" -ge 3 ] || echo "FAIL: expected >= 3 checklist items, got $CHECKBOX_COUNT"

# 检查 frontmatter
head -1 "$FILE_PATH" | grep -qF '---' || echo "WARN: no YAML frontmatter"
```

### 5. YAML 验证

```bash
# 基本语法（需要 python 或 yq）
python3 -c "import yaml; yaml.safe_load(open('$FILE_PATH'))" 2>/dev/null \
  || echo "FAIL: invalid YAML"

# 或用 node
node -e "
  const fs = require('fs');
  const yaml = require('js-yaml');
  try { yaml.load(fs.readFileSync('$FILE_PATH', 'utf8')); console.log('PASS'); }
  catch(e) { console.log('FAIL: ' + e.message); }
"
```

### 6. Diff 比较（变更验证）

```bash
# 与基线比较
diff "$EXPECTED_FILE" "$ACTUAL_FILE" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "FAIL: file content differs from expected"
  diff "$EXPECTED_FILE" "$ACTUAL_FILE"
fi

# 部分内容比较（忽略时间戳等动态字段）
diff <(jq 'del(.updated, .created)' "$EXPECTED") \
     <(jq 'del(.updated, .created)' "$ACTUAL") \
  || echo "FAIL: content differs (ignoring timestamps)"
```

### 7. Recipe 格式验证（自身）

用于验证 verification-recipes 目录下的 recipe 文件格式：
```bash
RECIPE_DIR="playbooks/guides/verification-recipes"
for recipe in "$RECIPE_DIR"/*.md; do
  [ "$recipe" = "$RECIPE_DIR/_index.md" ] && continue
  for section in "## 匹配条件" "## 前置检查" "## 执行步骤" "## 常见坑"; do
    grep -qF "$section" "$recipe" || echo "FAIL: $recipe missing section '$section'"
  done
done
```

## 常见坑

| 症状 | 原因 | 解决 |
|------|------|------|
| `No such file or directory` | Windows 路径 | 用 POSIX `/c/Users/...` |
| `jq: error - null` | JSON 字段不存在 | 用 `-e` flag + `// null` 默认值 |
| 行数不对 | 文件末尾无换行 | `wc -l` 不计无换行最后一行，用 `grep -c ''` 替代 |
| 编码问题 | UTF-8 BOM | `file --mime-encoding` 检查编码 |
| Node.js 读不了 POSIX 路径 | Windows Node 不认 `/c/` | `cygpath -w` 转换后传给 Node |
