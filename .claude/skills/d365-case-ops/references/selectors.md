# 稳定选择器映射表

本文件记录所有经过验证的稳定选择器，按页面区域组织。

> **选择器原则**：只用 Playwright `getByRole()` 的 role + name 格式，或 CSS 选择器中的稳定属性（如 `id`、`title`）。

---

## App Landing Page（iframe 内）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| App Landing iframe | `page.frameLocator('#AppLandingPage')` | 所有 app 选择都在此 iframe 内 |
| Copilot Service workspace 应用 | `frame.locator('text=Copilot Service workspace')` | 点击进入应用 |
| Customer Service Hub 应用 | `frame.locator('text=Customer Service Hub')` | 另一个可用应用 |

## Dashboard（Support Engineer Dashboard）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| My Open Cases 表格 | `treegrid[name="My Open Cases"]` | Dashboard 主表格 |
| Case 链接 | `getByRole('link', { name: '<Case标题片段>' })` | 点击打开 Case |
| Dashboard 标题 | `heading "Support Engineer Dashboard"` | 验证是否在 Dashboard |

## Case Form Header（顶部区域）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| Case 标题 | `heading[level=1]`（form 内第一个） | 包含完整标题和保存状态 |
| Assigned To 链接 | 标题下方的 `link`（如 `link "Jerry He"`） | 分配给谁 |
| Resolve case 按钮 | `getByRole('menuitem', { name: 'Resolve case' })` | 工具栏 |
| Save case 按钮 | `getByRole('button', { name: /Save case/ })` | 保存 |
| More commands 菜单 | `getByRole('menuitem', { name: /More commands for Case/ })` | 展开更多操作 |
| Share 按钮 | `getByRole('button', { name: 'Share' })` | 分享 |

## Case Tabs（标签页）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| Summary 标签 | `getByRole('tab', { name: 'Summary' })` | 摘要页 |
| Timeline 标签 | `getByRole('tab', { name: 'Timeline' })` | 时间线 |
| Details 标签 | `getByRole('tab', { name: 'Details' })` | 详情 |
| Attachments 标签 | `getByRole('tab', { name: /Attachments/ })` | 附件（数量会变，用正则） |
| Resolve 标签 | `getByRole('tab', { name: 'Resolve' })` | 结案 |
| More Tabs 下拉 | `getByRole('tab', { name: 'More Tabs' })` | 展开隐藏标签 |
| Labor（在 More Tabs 内） | `getByRole('menuitem', { name: 'Labor' })` | 需先点击 More Tabs |

## Timeline 区域

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| Enter a note 按钮 | `getByRole('button', { name: 'Enter a note...' })` | 快速添加笔记 |
| Create timeline record 按钮 | `getByRole('button', { name: 'Create a timeline record.' })` | 创建记录 |
| Add an attachment 按钮 | `getByRole('button', { name: 'Add an attachment' })` | 添加附件 |
| Refresh timeline 按钮 | `getByRole('button', { name: 'Refresh timeline' })` | 刷新 |
| Expand all records 按钮 | `getByRole('button', { name: 'Expand all records.' })` | 展开所有 |
| Search timeline 输入框 | `textbox "Search timeline"` | 搜索 |
| Timeline 条目 | `listitem`（标题格式：`"Email from xxx"` 或无标题为 Note） | 每条记录 |
| Reply All 链接 | `getByRole('link', { name: 'Reply All' })`（在 listitem 内） | 回复邮件 |
| View more 按钮 | `getByRole('button', { name: 'View more' })`（在 listitem 内） | 展开内容 |

## Note 表单（Enter a note 后出现）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| Title 输入框 | `getByRole('textbox', { name: 'Create a Note title' })` | 笔记标题 |
| Rich Text 正文 | `getByRole('textbox', { name: 'Rich Text Editor Control' })` | ⚠️ 只能用 keyboard.type() |
| Add note and close | `getByRole('button', { name: 'Add note and close' })` | 保存笔记 |
| Cancel | `getByRole('button', { name: 'Cancel' })` | 取消 |

## Labor 表单（New Labor 后出现）

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| New Labor 按钮 | `getByRole('menuitem', { name: /New Labor/ })` | 创建新 Labor |
| Classification 下拉 | `combobox "Classification"` | 默认 Troubleshooting |
| Date 日期选择 | `combobox "Date of Date"` | 默认今天 |
| Increment Hours 按钮 | `getByRole('button', { name: 'Increment Hours' })` | ⚠️ Duration 必须用按钮 |
| Decrement Hours 按钮 | `getByRole('button', { name: 'Decrement Hours' })` | |
| Increment Minutes 按钮 | `getByRole('button', { name: 'Increment Minutes' })` | |
| Decrement Minutes 按钮 | `getByRole('button', { name: 'Decrement Minutes' })` | |
| Minutes 输入框 | Minutes 区域的 `textbox`（在 MIN label 附近） | click({clickCount:3}) + pressSequentially |
| Description 输入框 | `textbox "Description"` | 默认 "See case notes" |
| Save & Close 按钮 | `getByRole('menuitem', { name: 'Save & Close' })` | 保存 Labor |

## More Commands 菜单项（在 ⋮ 菜单内）

| 用途 | 选择器方式 |
|------|-----------|
| New collaboration | `getByRole('menuitem', { name: 'New collaboration' })` |
| Edit SAP | `getByRole('menuitem', { name: /Edit SAP/ })` |
| Assign | `getByRole('menuitem', { name: 'Assign' })` |
| Transfer Case | `getByRole('menuitem', { name: 'Transfer Case' })` |
| Follow | `getByRole('menuitem', { name: 'Follow' })` |
| Email a Link | `getByRole('menuitem', { name: 'Email a Link' })` |

## 通用弹窗

| 用途 | 选择器方式 |
|------|-----------|
| Dismiss 按钮 | `getByRole('button', { name: 'Dismiss' })` |
| Close 按钮 | `getByRole('button', { name: 'Close' })` |
| Cancel 按钮 | `getByRole('button', { name: 'Cancel' })` |
| Change status 对话框 | `getByRole('dialog', { name: 'Change status for this case' })` |

## 全局搜索

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| 搜索框 | `getByRole('searchbox', { name: 'Search' })` | 顶部 banner 区域 |
| 清除搜索文本 | `getByRole('button', { name: 'Clear text' })` | 搜索框有文本时出现 |
| 搜索建议提示 | `alert "Suggestions available..."` | 输入后出现 |
| 建议列表 grid | `getByRole('grid')` → 内含 `row` → `button` | 建议下拉框，button 的 textContent 包含标题和 "Case number: xxx" |
| Show more results 按钮 | `getByRole('button', { name: /Show more results/ })` | 展开完整搜索结果页 |
| 搜索结果页标题 | `getByRole('heading', { name: 'Search results' })` | 验证搜索页已加载 |
| 搜索结果分类 Tab | `tab "Top results"`, `tab "Cases (N)"`, `tab "Notes (N)"` | 按类型过滤 |
| 搜索结果 Cases 表格 | `getByRole('treegrid')` + columnheader 含 "Customer title" | 与 Dashboard treegrid 列不同 |
| 关闭搜索 Tab | `getByRole('button', { name: 'Press Enter to close the tab Search' })` | 搜索完成后关闭 |

## Request Case Access 对话框

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| 触发按钮 | `getByRole('menuitem', { name: 'Request case access' })` | Command Bar |
| 对话框 | `getByRole('dialog', { name: 'Support data access request' })` | 模态对话框 |
| Case Number | `textbox "Case Number"` | 自动填充，只读 |
| Requestor | `list "Requestor"` | 自动填充当前用户，锁定 |
| Access Duration | `textbox "Access Duration"` | 默认 "8 Hours"，锁定 |
| Request Reason | `combobox "Request Reason"` | 必填下拉 |
| Submit | `button "Submit"` | 提交 |
| Cancel | `button "Cancel"` | 取消 |

## Phone Call Quick Create 对话框

| 用途 | 选择器方式 | 备注 |
|------|-----------|------|
| 触发入口 | `button "Create a timeline record."` → `menuitem "Phone Call Activity"` | Summary Tab 的 Timeline 区域 |
| 对话框 | `dialog "Quick Create: Phone Call"` | 模态对话框 |
| Subject | `textbox "Subject"` | 必填 |
| Call From | `list "Call From"` | 自动填充当前用户，锁定 |
| Call To | `list "Call To"` | 自动填充 Case 联系人 |
| Direction | `combobox "Direction"` | 默认 Outbound |
| Phone Number | `textbox "Phone Number"` | 必填，无预填时兜底 +000000 |
| Duration | 同 Labor 的 Increment/Decrement 按钮 | 在对话框内 |
| Save and Close | `button "Save and Close"` | ⚠️ 有两个匹配，用 `.first()` |
