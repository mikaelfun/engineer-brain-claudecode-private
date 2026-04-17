# Fiddler HTTPS 流量抓取指南（Entra ID 应用排查）

> Source: MS Learn Troubleshoot docs (multiple articles)
> Quality: guide-draft

## 适用场景

排查 Entra ID 应用认证问题时，需要抓取 HTTPS 流量分析 OAuth/OIDC 令牌交换过程。

## 基本步骤（浏览器应用）

1. 安装 Fiddler Classic，启用 **Tools > Options > HTTPS > Decrypt HTTPS Traffic**
2. 安装 Fiddler 根证书
3. 使用浏览器隐私模式或清除缓存
4. 复现问题，File > Save > All Sessions (SAZ)

## Python 应用特殊配置

Python 使用独立的证书存储，不会自动信任 Fiddler 证书。

### ADAL for Python
```python
import os
os.environ["ADAL_PYTHON_SSL_NO_VERIFY"] = "1"
# 或
context = adal.AuthenticationContext(authority, verify_ssl=False)
```

### MSAL for Python
```python
app = msal.PublicClientApplication(client_id=appId, authority=authority, verify=False)
```

### Requests 模块
```python
requests.get(endpoint, headers=headers,
    proxies={"http": "http://127.0.0.1:8888", "https": "http://127.0.0.1:8888"},
    verify=False)
```

## Node.js 应用
```bash
set https_proxy=http://127.0.0.1:8888
set http_proxy=http://127.0.0.1:8888
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```

## .NET (Azure Key Vault SDK)
```csharp
Environment.SetEnvironmentVariable("HTTP_PROXY", "http://127.0.0.1:8888");
Environment.SetEnvironmentVariable("HTTPS_PROXY", "http://127.0.0.1:8888");
```

## 流量过滤

### 按域名过滤
Filters tab > Show only the following Hosts:
`localhost;login.microsoftonline.com;graph.microsoft.com`

### 按进程过滤（高级 — FiddlerScript）
在 CustomRules.js 的 OnBeforeRequest 中添加 host + processlist 数组过滤。

## 参考链接
- [Capture HTTPS traffic for Entra ID apps](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/capture-https-traffic-fiddler-entra-id-app)
- [Capture HTTPS traffic from Python apps](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/capture-https-traffic-fiddler-python-app)
- [Capture SSL traffic (Node.js/.NET)](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/fiddler-capture-ssl-traffic)
- [Filter Fiddler traffic](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/filter-fiddler-traffic-using-domain-name-client-process)
