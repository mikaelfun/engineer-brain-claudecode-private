# ARM Azure Arc 通用 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Arc onboarding script fails to add on-premises server when Azure Arc Private Link is configur… | When Azure Arc Private Link Scope is configured, the onboarding script requires proper DNS resoluti… | 1) Verify all required private endpoints are created for Azure Arc Private Link Scope (Microsoft.Hy… | 🟢 8.5 — onenote+21V适用 | [MCVKB/#Case records and study..md] |
| 2 | Customer asks about Azure Arc-enabled SQL Server availability in Mooncake (Azure China) | Arc-enabled SQL Server is not available in Mooncake. The service has not been deployed to Azure Chi… | Inform customer Arc-enabled SQL Server is not supported in Mooncake. For Arc-enabled server collab … | 🔵 7.5 — onenote+21V适用 | [MCVKB/#Support boundaries_scope..md] |
| 3 | Azure Arc agent onboard fails with AZCM0026 network error: required endpoints unreachable | Firewall, proxy, or DNS misconfiguration blocking outbound connectivity to Azure Arc required endpo… | Run azcmagent check to identify blocked endpoints. Ensure required URLs are allowed through firewal… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 4 | Azure Arc agent onboard fails: subscription not registered to use namespace Microsoft.HybridCompute | Required resource providers (Microsoft.HybridCompute, Microsoft.GuestConfiguration, Microsoft.Hybri… | Register providers: az provider register --namespace Microsoft.HybridCompute and Microsoft.GuestCon… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 | Azure Arc agent onboard fails: proxy/firewall blocking login.windows.net or management.azure.com wi… | Corporate proxy or firewall blocking HTTPS to Azure AD or ARM endpoints needed for Arc authenticati… | 1) azcmagent check to diagnose. 2) Configure proxy: azcmagent config set proxy.url. 3) Whitelist lo… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 6 | Azure Arc agent connect fails: AZCM0044 resource with same name already exists or AZCM0067 machine … | Machine was previously connected to Azure Arc; local agent state or Azure resource still exists. | Run azcmagent disconnect first then retry connect. Use --resource-name for different name if confli… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. 1) Verify all required private endpoints are created for Azure Arc Private Link… `[来源: onenote]`
2. Inform customer Arc-enabled SQL Server is not supported in Mooncake. For Arc-en… `[来源: onenote]`
3. Run azcmagent check to identify blocked endpoints. Ensure required URLs are all… `[来源: mslearn]`
