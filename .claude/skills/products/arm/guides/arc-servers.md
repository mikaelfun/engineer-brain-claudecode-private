# ARM Azure Arc 服务器 — 排查速查

**来源数**: 4 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Arc server custom script extension provisioning failed (CSE provisioning error) | Custom script extension (CustomScriptExtension) deployment on Arc-enabled servers can fail due to m… | 1) Verify Arc agent connectivity and status via azcmagent show; 2) Check extension logs on the mach… | 🟢 8.5 — onenote+21V适用 | [MCVKB/#Case records and study..md] |
| 2 | Azure Monitor Agent (AMA) install fails on Arc-enabled server in China North 3 region with HCRP500 … | Region-specific issue in China North 3 affecting AMA extension installation on Arc-enabled servers.… | Workaround: Deploy the Arc-enabled server in a different region (e.g., China North 2, China East 2)… | 🟢 8.5 — onenote+21V适用 | [MCVKB/1.On going issue for Arc server(30th Jan.).md] |
| 3 | Arc VM extension stuck in 'updating' state indefinitely when updating the same extension with ident… | Updating the same Arc connected machine extension repeatedly (via Update-AzConnectedMachineExtensio… | 1) Avoid updating the same extension repeatedly without necessity; 2) If stuck, remove the extensio… | 🟢 8.5 — onenote+21V适用 | [MCVKB/2.How to deploy a customscriprtextension using pow.md] |
| 4 | Azure Monitor Agent (AMA) installed on Arc-enabled server but no data appears in Log Analytics work… | AMA requires a Data Collection Rule (DCR) to be associated. Without DCR, AMA is installed but does … | Create DCR and associate with Arc-enabled server. Deploy AMA via Portal/PowerShell/Azure Policy. Us… | 🔵 7.0 — onenote+21V适用 | [MCVKB/AzureMonitorAgent(AMA).md] |

## 快速排查路径
1. 1) Verify Arc agent connectivity and status via azcmagent show; 2) Check extens… `[来源: onenote]`
2. Workaround: Deploy the Arc-enabled server in a different region (e.g., China No… `[来源: onenote]`
3. 1) Avoid updating the same extension repeatedly without necessity; 2) If stuck,… `[来源: onenote]`
