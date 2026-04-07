# ARM Azure Stack Hub 密钥轮换与证书 — 排查速查

**来源数**: 7 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub secret rotation fails with 403 Forbidden StorageException ('Server failed to authen… | When storage external/internal certs are expired or storage service is unhealthy, WAS role attempts… | Run RepairConfigure on WASP/WASPUBLIC roles via unlocked PEP session: 1) Create custom action plan … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub internal root certificate is not rotated by SecretRotation until 2108 | Internal root certificate has an extended validity period (until 2108) and is not included in the s… | Run Test-AzsSupportKIInternalRootCertExpiring from CSSTools Azs.Support module to check root certif… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Non-self-signed Entrust certificate in Trusted Root store on Azure Stack Hub, causing certificate c… | Entrust certificate (non-self-signed) incorrectly present in Trusted Root Certification Authorities… | Run Test-AzsSupportKINonSelfSignedCertInTrustedRoot from the Azs.Support module. Use -Remediate fla… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Internal secret rotation fails on Azure Stack Hub environments originally deployed on version 1901 … | Bug in internal secret rotation process introduced in 1907 that does not account for older deployme… | Apply hotfix 1.1907.15.50 (KB 4520315, released Sep 5 2019). Suppresses NC cluster certificate warn… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub operators cannot perform update or secret rotation because test-azurestack updatere… | test-azurestack updatereadiness incorrectly surfaced NC cluster certificate warnings as blocking co… | Apply hotfix 1.1907.15.50 (KB 4520315). NC cluster certificate warning suppressed in test-azurestac… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | External certificate expiration alerts continue appearing on Azure Stack Hub admin portal even afte… | Certificate alerting was not scoped to only certificates bound to external endpoints; alerts fired … | Apply hotfix 1.1907.29.80 (KB 4555650, released Apr 2 2020). Certificate alerting fixed to only ale… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub internal secret rotation fails at step 'Rotate Secret for Azure Stack ARM and Porta… | Some resource provider endpoints (e.g., MySQLAdapter, App Service, SQL RP) are not reachable from W… | (1) Collect Wait-AcceptResourceManagerClientCertificate log from WAS01 to identify unreachable RP e… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Run RepairConfigure on WASP/WASPUBLIC roles via unlocked PEP session: 1) Create… `[来源: ado-wiki]`
2. Run Test-AzsSupportKIInternalRootCertExpiring from CSSTools Azs.Support module … `[来源: ado-wiki]`
3. Run Test-AzsSupportKINonSelfSignedCertInTrustedRoot from the Azs.Support module… `[来源: ado-wiki]`
