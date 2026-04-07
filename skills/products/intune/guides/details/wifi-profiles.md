# Intune Wi-Fi 配置 — 综合排查指南

**条目数**: 1 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-WiFi-Profiles.md, mslearn-troubleshoot-wi-fi-profiles.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Wifi Profiles
> 来源: ADO Wiki — [ado-wiki-WiFi-Profiles.md](../drafts/ado-wiki-WiFi-Profiles.md)

**Wi-Fi Profiles in Intune**
**Overview**
- Android 4+, Android Enterprise, iOS 8.0+, iPadOS 13.0+, macOS X 10.11+, Windows 10+, Windows 10 Mobile, Windows Holographic for Business.
- Windows 8.1: import-only.

**Profile Types**
1. **UI-created profiles**: Device Configuration > Wi-Fi (all platforms)
2. **Custom Wi-Fi profiles**: OMA-URI + XML (Windows, Android)
3. **Wi-Fi imported profiles**: Export from connected device, import to Intune (Windows 8.1+)

**Prerequisites (Enterprise Wi-Fi)**
- Wireless AP supporting WPA/WPA2 Enterprise
- Active Directory
- Certificate Authority
- RADIUS Server

**Key Configuration Tips**
- **Cert Auth**: Always target SCEP/PKCS, root certificate, and Wi-Fi profiles to the **same group(s)**
- **Cert Auth**: Use **user certificate** instead of device certificate (works flawlessly for most scenarios)
- **NPS (RADIUS)**: Use UPN as SAN for user certificates, FQDN as SAN for device certificates
- Dependent policies: VPN/WiFi profile may not be applied if dependent policies have different targeting

**Support Boundaries**
- Intune supports **policy configuration and delivery** only
- Intune does NOT guarantee connectivity
- Connectivity issues (intermittent disconnection, failed connectivity) → transfer to Windows Networking team or customer's network team
- If settings are delivered successfully → not an Intune problem

**Troubleshooting Workflow**

**Intune Portal Troubleshooting**

**Backend Troubleshooting**
- Check policy settings and targeting
- Verify Root, SCEP/PKCS, and Wi-Fi profiles target same group
- Export targeted policy for affected device and match settings
... (详见原始草稿)

### Phase 2: Troubleshoot Wi Fi Profiles
> 来源: MS Learn — [mslearn-troubleshoot-wi-fi-profiles.md](../drafts/mslearn-troubleshoot-wi-fi-profiles.md)

**Troubleshooting Wi-Fi Device Configuration Profiles in Microsoft Intune**
**Prerequisites**
- Trusted Root and SCEP profiles must be installed before Wi-Fi profile
- Certificate chain must be complete on device

**Deployment Flow (Android)**
1. Trusted Root certificate notification > install
2. SCEP certificate notification > install
3. Wi-Fi profile notification > install
4. Wi-Fi appears as saved network

**Troubleshooting: Wi-Fi Profile Not Deployed**
1. Check profile assignment to correct group
2. Verify device sync (LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. Android: If CertificateSelector cannot match cert, Wi-Fi skipped
   - Log: "Skipping Wifi profile because it is pending certificates"
   - Check Any Purpose EKU mismatch
5. Windows: Download MDM Diagnostic Information log

**Troubleshooting: Deployed But Cannot Connect**
- Usually not an Intune issue
- Try manual connection with same cert criteria
- Check Radius server logs for connectivity errors

**Users Not Getting New Profile After Password Change**
- Set up guest Wi-Fi as fallback
- Enable auto-connect settings
- Test with small group first
- Verify SSID and Pre-Shared Key correct
... (详见原始草稿)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Network connectivity drops during Windows new hire onboarding after Intune deploys SCEP certifica... | When Intune pushes SCEP+WiFi profile to newly enrolled device, the WiFi authe... | (1) Check WiFi connection timestamp vs auth method switch timing to confirm this is the cause; (2... | 🟢 9.0 | OneNote |
