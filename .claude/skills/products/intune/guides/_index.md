# Intune 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [MAM 通用策略与 App SDK](mam-general.md) | 📋 融合 | 1 | mam, ios, android, app-protection, app-wrapping-tool | 4 | high |
| [注册通用问题](enrollment-general.md) | 📋 融合 | 3 | enrollment, ios, mdm-authority, windows, macos | 4 | high |
| [iOS/iPadOS 通用问题](ios-general.md) | 📋 融合 | 1 | ios, vpp, enrollment, dep, abm | 4 | high |
| [设备合规策略](compliance-policy.md) | 📋 融合 | 2 | compliance, conditional-access, ios, windows, android | 4 | high |
| [SCEP / NDES 证书部署与排查](cert-scep-ndes.md) | 📋 融合 | 1 | scep, ndes, certificate, iis, certificate-connector | 4 | high |
| [Win32 应用部署与 IME](app-win32.md) | 📋 融合 | 2 | ime, win32, win32-app, powershell, windows | 3 | high |
| [应用部署通用问题](app-general.md) | 📋 融合 | 1 | company-portal, ios, android, app-deployment, lob | 4 | high |
| [Intune 其他/未分类问题](intune-general.md) | 📊 速查 | 0 | general | 4 | low |
| [21V 功能差异与不支持特性](21v-feature-gaps.md) | 📋 融合 | 0 | 21v-unsupported, 21v, mooncake, enrollment, android | 3 | high |
| [证书通用问题与 Cloud PKI](cert-general.md) | 📋 融合 | 1 | certificate, enrollment, scep, macos, cloud-pki | 4 | high |
| [Autopilot 通用问题](autopilot-general.md) | 📋 融合 | 1 | autopilot, icm-678596064, windows, enrollment, omadmclient | 5 | high |
| [Office / M365 应用部署](app-office.md) | 📋 融合 | 0 | office-c2r, autopilot, hard-block, odt, timeout | 4 | high |
| [设备配置通用问题](config-general.md) | 📋 融合 | 2 | device-configuration, kusto, macos, security-baselines, conflict | 4 | high |
| [Co-Management / SCCM / ConfigMgr](comanagement.md) | 📋 融合 | 1 | co-management, sccm, cmg, windows, registry | 5 | high |
| [许可证与租户](license-tenant.md) | 📋 融合 | 1 | license, rbac, test-tenant, mcaps, permissions | 4 | high |
| [PKCS / PFX 证书部署](cert-pkcs-pfx.md) | 📋 融合 | 1 | pkcs, certificate, pending, pfx, scep | 4 | high |
| [Windows 通用问题](windows-general.md) | 📊 速查 | 0 | windows, wns, device-inventory, resource-explorer, advanced-analytics | 4 | high |
| [ADMX / OMA-URI / Settings Catalog](config-admx-omauri.md) | 📋 融合 | 1 | csp, windows, oma-uri, allowlocallogon, device-config | 4 | high |
| [Autopilot Hybrid AADJ 与域加入](autopilot-hybrid.md) | 📋 融合 | 1 | autopilot, haadj, odj-connector, hybrid-aadj, hybrid-join | 4 | high |
| [iOS 应用部署与 VPP](app-ios.md) | 📋 融合 | 3 | vpp, ios, abm, apple, license-revoke | 3 | high |
| [条件访问](conditional-access.md) | 📋 融合 | 0 | conditional-access, windows, mfa, office, device-actions | 4 | high |
| [Graph API 与 PowerShell 自动化](graph-api.md) | 📋 融合 | 0 | graph-api, admin-ui, rbac, 403, powershell | 4 | high |
| [Android 通用问题](android-general.md) | 📊 速查 | 0 | android, work-profile, reset-token, samsung, conditional-access | 4 | high |
| [设备操作（擦除/锁定/重置等）](device-actions.md) | 📋 融合 | 0 | device-actions, wipe, retire, pending, android | 4 | high |
| [Android 应用部署](app-android.md) | 📋 融合 | 1 | android, mgp, managed-google-play, upgrade, enrollment | 3 | high |
| [邮件配置与 Exchange](email-profiles.md) | 📋 融合 | 0 | exchange-connector, email-profile, proxy, on-premise, version | 2 | medium |
| [BitLocker 加密管理](windows-bitlocker.md) | 📋 融合 | 0 | bitlocker, tpm, silent-encryption, wipe, windows | 3 | high |
| [Security Copilot for Intune](copilot-intune.md) | 📋 融合 | 0 | copilot, security-copilot, policy-configuration-agent, content-filter, scu | 1 | low |
| [Autopilot v2 / Device Preparation](autopilot-v2.md) | 📋 融合 | 1 | autopilot, ap-dp, apv2, autopilot-v2, oobe | 2 | medium |
| [Windows MAM 与 WIP / Edge](mam-windows.md) | 📊 速查 | 0 | windows-mam, wip, edge, device-registration, dlp | 2 | medium |
| [Windows 注册与 Auto-Enrollment](enrollment-windows.md) | 📋 融合 | 1 | enrollment, auto-enrollment, co-management, windows, upn | 3 | high |
| [Windows Update / Update Rings / WUFB](windows-update.md) | 📋 融合 | 0 | wufb, windows-update, feature-update, quality-update, 21v-unsupported | 3 | high |
| [Windows Hello for Business 与 KDC](cert-whfb.md) | 📋 融合 | 0 | whfb, provisioning, wam, cloudexperiencehost, cxh | 2 | medium |
| [Microsoft Tunnel VPN](vpn-ms-tunnel.md) | 📋 融合 | 0 | ms-tunnel, vpn, proxy, ios, android | 1 | low |
| [macOS 应用部署](app-macos.md) | 📋 融合 | 0 | macos, lob, pkg, install-location, uninstall | 3 | high |
| [报告与诊断日志收集](reporting-diagnostics.md) | 📋 融合 | 2 | diagnostics, update-readiness, epm, elevation-reporting, sensor-log | 3 | high |
| [Security Baseline 与策略冲突](config-security-baseline.md) | 📋 融合 | 0 | security-baselines, pending, check-in, windows, security-baseline | 2 | medium |
| [Windows LAPS](windows-laps.md) | 📋 融合 | 0 | laps, windows-laps, event-10059, azure-ad, device-settings | 1 | low |
| [macOS 通用问题](macos-general.md) | 📊 速查 | 0 | app-wrapping-tool, macos, detection, dynamic-library, mdm | 2 | medium |
| [Autopilot ESP 与预配置](autopilot-esp.md) | 📋 融合 | 1 | autopilot, pre-provisioning, white-glove, entra-join, dsregcmd | 1 | low |
| [iOS/iPadOS 注册与 ADE/DEP](enrollment-ios.md) | 📋 融合 | 2 | dep, ios, enrollment, ade, xpc_type_error | 3 | high |
| [VPN 配置](vpn-general.md) | 📊 速查 | 0 | myworkspace, jit, activate, disabled, modernrdp | 3 | high |
| [Defender for Endpoint 集成](windows-defender.md) | 📋 融合 | 0 | mde, mde-attach, endpoint-security, defender, tamper-protection | 2 | medium |
| [macOS Shell 脚本与 Sidecar Agent](macos-scripts.md) | 📋 融合 | 0 | macos, shell-script, powershell, encoding, unicode | 3 | high |
| [macOS 软件更新 / DDM](macos-update.md) | 📋 融合 | 0 | ddm, macos, status-report, error-configuration-cannot-be-applied, os-version | 2 | medium |
| [Windows Kiosk 模式](windows-kiosk.md) | 📋 融合 | 0 | kiosk, sid-mapping, user-account, profile-deployment, assigned-access | 1 | low |
| [Android MAM 与 App Protection](mam-android.md) | 📋 融合 | 1 | app-sdk, android, mam, gradle, build-failure | 1 | low |
| [Wi-Fi 配置](wifi-profiles.md) | 📋 融合 | 0 | scep, wifi, eap-tls, peap, onboarding | 1 | low |
| [macOS FileVault 加密](macos-filevault.md) | 📊 速查 | 0 | macos, filevault, encryption, device-configuration | 1 | low |

最后更新: 2026-04-07

总计: 49 个 topic (42 融合, 7 速查)
