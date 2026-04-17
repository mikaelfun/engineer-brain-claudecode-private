# Clear OneAuth / MSAL Cache

> Source: OneNote - M365 Identity IDO / Common operation_TSG

## 场景

Office 应用使用 OneAuth 框架认证时出现缓存凭据问题，需要清理 OneAuth 和 MSAL 缓存。

## 缓存路径

| 缓存类型 | 路径 |
|----------|------|
| OneAuth Account | `%localappdata%\Microsoft\OneAuth` |
| MSAL Account + Token | `%localappdata%\Microsoft\IdentityCache` |

## 操作

关闭所有 Office 应用后，删除上述两个文件夹即可清除所有 OneAuth + MSAL 账号缓存。

## 参考

- [Authentication framework for Office apps](https://supportability.visualstudio.com/Office/_wiki/wikis/Office/755778/Authentication-framework-for-Office-apps)
