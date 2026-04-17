# Intune 条件访问 — 排查工作流

**来源草稿**: ado-wiki-conditional-access.md
**Kusto 引用**: (无)
**场景数**: 13
**生成日期**: 2026-04-07

---

## Scenario 1: Description
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Intune app protection policies help protect company data on devices enrolled into Intune (and on employee-owned devices not enrolled for management). With Conditional Access, organizations can restrict access to approved (modern authentication capable) client apps.

- **Require approved client app**: Device must use an approved client app (iOS/Android only). Broker app required (Microsoft Authenticator for iOS, Company Portal for Android).
- **Require app protection policy**: Intune app protection policy must be present on the client app before access. Broker app required.

## Scenario 2: Prerequisites
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Enterprise Mobility + Security (EMS) or Azure AD Premium subscription
- Users licensed for EMS or Azure AD
- Modern authentication required (OAuth2)

## Scenario 3: Supported Apps for Approved Client App
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Microsoft Edge, Outlook, OneDrive, Teams, Excel, Word, PowerPoint, SharePoint, OneNote, Planner, Power BI, and others.

## Scenario 4: Supported Apps for App Protection Policy
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Microsoft Cortana, OneDrive, Outlook, Planner.

## Device-based Conditional Access

## Scenario 5: Key Concepts
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Require device to be marked as compliant**: Device must be registered with Azure AD and marked compliant by Intune or third-party MDM (Windows 10 only for third-party).
- **Require Hybrid Azure AD joined device**: Applies to Windows 10 or down-level devices (Windows 7/8) joined to on-premises AD.

## Configuration Best Practices

## Scenario 6: Configurations to AVOID
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **All users + All cloud apps + Block access** — blocks entire organization
- **All users + All cloud apps + Require compliant device** — blocks users without enrolled devices, including admins
- **All users + All cloud apps + Require domain join** — blocks all users without domain-joined devices
- **All users + All cloud apps + Require app protection policy** — blocks all users without Intune policy, including admins

## Scoping Questions

## Scenario 7: App-based CA
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- What is the affected UPN?
- Was this working before and suddenly stopped?
- What error message appears?
- What platforms are affected?
- Can we check sign-in logs for that user?
- Can we run the What If tool?
- Can we get authenticator logs?

## Scenario 8: Device-based CA
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. What is the UPN of the connecting user?
2. Is the device enrolled in Intune? Device name?
3. Affected platform? (iOS, Android, Windows, macOS)
4. What app is the user trying to connect with? (1st party / 3rd party / LOB)
5. Has this ever worked?
6. When did the problem begin?
7. What error is shown? (screenshots with "More details" expanded)
8. Have you checked Azure AD sign-in events? (screenshot of CA tab)
9. What does the customer expect to happen?

## Support Boundaries

Conditional Access is an **Azure AD capability** (Azure AD Premium license). Intune's role is limited to:
1. Ensuring prerequisites are met
2. Ensuring CA is properly configured
3. Ensuring devices are communicating with Intune service

If the problem remains after these checks → consult **Azure AD Identity team**.

## Scenario 9: Sign-in Interrupt Analysis
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Review error message on the sign-in error page (expand "More Details")
2. Check Azure AD sign-in events:
   - Azure portal → Azure AD → Sign-ins
   - Filter by Correlation ID, Conditional Access status, Username, Date
   - Review **Conditional Access** tab for policy evaluation
   - Check **Troubleshooting and support** tab for failure reason
   - Click policy name to drill into configuration
   - Check **Device Info** tab for device details

## Scenario 10: Devices Compliant but Users Blocked
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify user has Intune license (IntuneLicensed=true in Rave)
- Check if user is DEM admin (DEM users blocked by design)
- Non-Knox Android: user must click "Get Started Now" in quarantine email
- New enrollment: wait a few minutes for compliance info to register
- iOS: check for existing email profile blocking Intune profile
- Device stuck in checking-compliance: update Company Portal, restart device, try different network
- Android encryption with default PIN: set new non-default PIN

## Scenario 11: Noncompliant but Not Blocked
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows PCs: CA only blocks native email, Office 2013 w/ Modern Auth, Office 2016
- Selectively wiped device: Exchange caches access for ~6 hours
- Check compliance policy and CA policy assignments (Target/Exclusion groups)

## Scenario 12: Noncompliant Device Not Blocked
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify Target/Exclusion groups
- Check Exchange Connector pointing to correct server
- PowerShell: `Get-ActiveSyncDeviceStatistics -mailbox mbx` to verify device visibility
- `Get-CASmailbox -identity:'upn' | fl` for access state details

## Scenario 13: Android-specific
> 来源: ado-wiki-conditional-access.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- "No certificates found" → Enable Browser Access in Company Portal settings
- Android Enterprise blocked with "Your admin requires your device to be managed" → see internal doc 4533999

## FAQ Highlights
- CA policies enforced for B2B/guest users (but guests may not satisfy all requirements)
- SharePoint Online policy also applies to OneDrive for Business
- Cannot set policy directly on client apps (policies set on services, enforced at authentication)
- Service accounts subject to CA; can be excluded via policy settings
- Teams relies on Exchange Online and SharePoint Online CA policies

## References
- Intune CA: https://learn.microsoft.com/en-us/mem/intune/protect/conditional-access
- Azure AD CA: https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/overview
- CA Best Practices: https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/best-practices
- What If tool: https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/troubleshoot-conditional-access-what-if
