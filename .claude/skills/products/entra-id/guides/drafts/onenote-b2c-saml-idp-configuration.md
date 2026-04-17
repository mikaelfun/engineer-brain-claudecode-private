# B2C SAML App as IDP Configuration Guide

## 概述
在 Azure AD B2C 自定义策略中配置 SAML 应用程序作为身份提供商（IDP），实现 B2C 用户通过 SAML federation 登录。

## 常见错误
- 在 21v 环境使用了 Global Azure 的 SAML endpoint → 需改为 `.cn` 域名

## 配置步骤

### 1. 获取 B2C SAML Metadata
```
https://<tenant>.b2clogin.cn/<tenant>.partner.onmschina.cn/<policy>/samlp/metadata?idptp=<technical-profile>
```
从中获取 `entityID` 和 `AssertionConsumerService` URL。

### 2. 创建 AAD SAML Toolkit Enterprise App
- 在 Azure Portal → Enterprise Applications → 添加 Azure AD SAML Toolkit
- 分配用户/组到该应用

### 3. 配置 Basic SAML Configuration
- **SAML Entity ID**: 从 B2C metadata 获取（如 `https://xxx.b2clogin.cn/xxx.partner.onmschina.cn/B2C_1A_TrustFrameworkBase`）
- **Assertion Consumer Service URL**: 如 `https://xxx.b2clogin.cn/xxx.partner.onmschina.cn/B2C_1A_TrustFrameworkBase/samlp/sso/assertionconsumer`
- **Sign on URL**: 自动生成

### 4. 配置 Attributes & Claims
- 根据 SAML metadata 中的 namespace 配置 claim mapping
- 确保 B2C technical profile 中的 claim 与 SAML app 中的 attribute 一致

### 5. 测试登录
```
https://xxx.b2clogin.cn/xxx.partner.onmschina.cn/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=xxx&nonce=defaultNonce&redirect_uri=https%3A%2F%2Fjwt.ms&scope=openid&response_type=id_token&prompt=login
```

### 6. 验证 SAML Token
使用 Chrome 插件 SAML-tracer 抓取和分析 SAML assertion。

## 21v 特殊注意
- 登录端点使用 `.cn` 域名: `b2clogin.cn`, `partner.onmschina.cn`
- B2C login endpoint 参考: https://docs.azure.cn/zh-cn/active-directory-b2c/b2clogin

## 参考
- https://learn.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-generic-saml
