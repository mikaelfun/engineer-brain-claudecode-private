# Intune Wi-Fi 配置 — 排查工作流

**来源草稿**: ado-wiki-WiFi-Profiles.md, mslearn-troubleshoot-wi-fi-profiles.md
**Kusto 引用**: (无)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Prerequisites (Enterprise Wi-Fi)
> 来源: ado-wiki-WiFi-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Wireless AP supporting WPA/WPA2 Enterprise
- Active Directory
- Certificate Authority
- RADIUS Server

## Key Configuration Tips
- **Cert Auth**: Always target SCEP/PKCS, root certificate, and Wi-Fi profiles to the **same group(s)**
- **Cert Auth**: Use **user certificate** instead of device certificate (works flawlessly for most scenarios)
- **NPS (RADIUS)**: Use UPN as SAN for user certificates, FQDN as SAN for device certificates
- Dependent policies: VPN/WiFi profile may not be applied if dependent policies have different targeting

## Support Boundaries
- Intune supports **policy configuration and delivery** only
- Intune does NOT guarantee connectivity
- Connectivity issues (intermittent disconnection, failed connectivity) → transfer to Windows Networking team or customer's network team
- If settings are delivered successfully → not an Intune problem

## Scenario 2: Intune Portal Troubleshooting
> 来源: ado-wiki-WiFi-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Public docs: Troubleshooting Wi-Fi profile issues in Microsoft Intune

## Scenario 3: Backend Troubleshooting
> 来源: ado-wiki-WiFi-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Assist365:**
- Check policy settings and targeting
- Verify Root, SCEP/PKCS, and Wi-Fi profiles target same group
- Export targeted policy for affected device and match settings

**Kusto:**
- Check IntuneEvent table for policy processing and compliance state
- Filter on device ID and time, project message column
- If non-compliant: identify which settings caused it

## Scenario 4: Infrastructure Troubleshooting (extra mile)
> 来源: ado-wiki-WiFi-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Not in Intune scope, but can help quick-check:
- RADIUS/NPS server connectivity
- Certificate chain validation
- 802.1X authentication: https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/802-1x-authentication-issues-troubleshooting
- EAP-TLS/PEAP certificate requirements: https://learn.microsoft.com/en-US/troubleshoot/windows-server/networking/certificate-requirements-eap-tls-peap

## SME Contacts
- ATZ: Carlos Jenkins, Jesus Santaella, Martin Kirtchayan, David Meza Umana, Manoj Kulkarni
- EMEA: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad, Ammar Tawabini, Jordi Segarra, Khalid Hussein
- APAC: Xinkun Yang, Joe Yang, Conny Cao, Gaurav Singh

Teams Channel: Device Config - Certificates, Email, VPN and Wifi

## Scenario 5: Prerequisites
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Trusted Root and SCEP profiles must be installed before Wi-Fi profile
- Certificate chain must be complete on device

## Scenario 6: Deployment Flow (Android)
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Trusted Root certificate notification > install
2. SCEP certificate notification > install
3. Wi-Fi profile notification > install
4. Wi-Fi appears as saved network

## Scenario 7: Troubleshooting: Wi-Fi Profile Not Deployed
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check profile assignment to correct group
2. Verify device sync (LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. Android: If CertificateSelector cannot match cert, Wi-Fi skipped
   - Log: "Skipping Wifi profile because it is pending certificates"
   - Check Any Purpose EKU mismatch
5. Windows: Download MDM Diagnostic Information log

## Scenario 8: Troubleshooting: Deployed But Cannot Connect
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Usually not an Intune issue
- Try manual connection with same cert criteria
- Check Radius server logs for connectivity errors

## Users Not Getting New Profile After Password Change

- Set up guest Wi-Fi as fallback
- Enable auto-connect settings
- Test with small group first
- Verify SSID and Pre-Shared Key correct

## Scenario 9: All Wi-Fi Profiles Report Failing
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Android Enterprise: When multiple Wi-Fi profiles deployed and one fails, all report failing (even working ones)

## Scenario 10: Wi-Fi Profile Reports Failing But Works
> 来源: mslearn-troubleshoot-wi-fi-profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- May be reporting error on Android
- Update Intune app to version 2021.05.02 or later

## Logs

| Platform | Log | Search Term |
|----------|-----|------------|
| Android | Omadmlog.log | wifimgr |
| iOS | Console app on Mac | Wi-Fi profile name |
| Windows | Event Viewer DeviceManagement-Enterprise-Diagnostic-Provider | WiFi |
