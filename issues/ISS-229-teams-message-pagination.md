# ISS-229: Teams 消息分页拉取 — 确保搜索命中消息被覆盖

## 问题

MCP `ListChatMessages` 硬限制每次 20 条（top 参数无效），默认拉取最新 20 条。
当 Graph 搜索命中的消息在第 21+ 条时，拉到的内容不包含搜索关键词，导致：
1. LLM scorer 看不到命中消息 → 可能幻觉出错误的 relevance 判断
2. 有实际 case 相关讨论但被截断时，丢失关键上下文

## 实测验证

- Case 2601290030000748, Oliver Wu 聊天
- Graph 搜索匹配到第 21 条消息（`filter=lastModifiedDateTime lt {最早消息时间}` 可成功翻页拉到）
- 消息内容: "可以帮忙改个case的SAP吗 2601290030000748" — 只是请帮忙改 SAP，非 case 排查
- MCP 支持 `filter` (lastModifiedDateTime gt/lt) + `orderby` (createdDateTime desc)

## 方案

### 方案 A: 分页拉取到命中消息

1. 先拉最新 20 条
2. 检查是否包含搜索关键词（case number）
3. 如果不包含，用 `filter=lastModifiedDateTime lt {最早消息时间}` 翻页
4. 最多翻 3 页（60 条），找到包含关键词的消息后 + 该消息之后的所有消息一起保存
5. 好处：精确覆盖搜索命中点 + 上下文

### 方案 B: 按 case 创建日期锚定

1. 从 case-info.md 提取 case 创建日期
2. 用 `filter=lastModifiedDateTime gt {case创建日期 - 1天}` 拉取
3. MCP 每页 20 条，可能需要分页
4. 好处：只拉 case 生命周期内的消息

### 方案 C: 搜索结果提取命中时间戳

1. Graph Search API 的 hit.resource 应包含匹配消息的 createdDateTime
2. 用该时间戳作为锚点拉取 `filter=lastModifiedDateTime gt {hit_time - 1hour}`
3. 需要修改 search 结果解析逻辑，提取 hit 元数据
4. 好处：最精确，但依赖 search response 格式

## 优先级

P2 — 已通过 scoring prompt 防幻觉缓解了主要影响

## 相关

- generate-digest.py scoring prompt 已加防幻觉规则
- teams-search-http.sh 消息拉取逻辑
