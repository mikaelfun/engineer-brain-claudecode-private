# INTUNE 邮件配置与 Exchange — 已知问题详情

**条目数**: 59 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Samsung KNOX: EAS email profile error 0x87D1FDE8 remediation failed.
**Solution**: Deselect Samsung Notes sync option. Wait up to 24h.
`[Source: mslearn, Score: 8.0]`

### Step 2: Users cannot send images from auto-configured email accounts.
**Solution**: Enable the setting in email profile Properties > Settings.
`[Source: mslearn, Score: 8.0]`

### Step 3: iOS email profile: no password prompt after password change. No email sent/received.
**Solution**: Enable OAuth in email profile. Ensure email service supports OAuth first.
`[Source: mslearn, Score: 8.0]`

### Step 4: When trying to configure the Microsoft Intune On-Premise Exchange connector, error: 'Configuration Failed - The Microsoft Intune Exchange Connector...
**Solution**: Download and install the latest version of the Intune on-premise Exchange connector from the Exchange Access blade.
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: Alert: 'The Service to Service Connector Failed to Retrieve ACS Token' when using Intune O365 Exchange Connector.
**Solution**: Wait 24 hours (may be maintenance). If not resolved: ensure Global Admin who set up the Service Connector has both Intune and O365 Exchange licenses. Verify certificate and ACS registration.
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: Unable to Configure Android for Work due to continuous looping back to Configure Page.
**Solution**: Workaround 1: If Protected Mode mismatch, go to Internet Options > Security, enable Protected Mode for the mismatched zone and restart IE. Workaround 2: Add https://*.google.com to the same security zone as manage.microsoft.com, restart IE and retry.
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: When trying to configure the Microsoft Intune Exchange Connector you receive the following error message. The Microsoft Intune Exchange Connector e...
**Solution**: To resolve the issue you can do the following In Intune there can only be one Exchange connector. You can run either the Intune on premise Exchange connector or the Intune Exchange service to Service connector.. You cannot run both connectors at the same time. To resolve the issue remove one of the Intune Exchange connector and install the connector will be able to manage the user mailboxes that have Intune licenses. This error message can also be caused by not being able to connect to any of th
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: A method is needed to have someone notified when the 20GB of cloud storage built in to Intune is close to being depleted. For example, this could b...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Samsung KNOX: EAS email profile error 0x87D1FDE8 remediation failed. | Samsung Notes sync option selected but no longer supported. | Deselect Samsung Notes sync option. Wait up to 24h. | 8.0 | mslearn |
| 2 | Users cannot send images from auto-configured email accounts. | Allow e-mail from third-party applications not enabled. | Enable the setting in email profile Properties > Settings. | 8.0 | mslearn |
| 3 | iOS email profile: no password prompt after password change. No email sent/re... | EAS basic authentication limitation does not trigger re-auth prompt. | Enable OAuth in email profile. Ensure email service supports OAuth first. | 8.0 | mslearn |
| 4 | When trying to configure the Microsoft Intune On-Premise Exchange connector, ... | This issue can be caused by having an older version of the Intune on-premise ... | Download and install the latest version of the Intune on-premise Exchange con... | 7.5 | contentidea-kb |
| 5 | Alert: 'The Service to Service Connector Failed to Retrieve ACS Token' when u... | An invalid/different certificate is used, tenant is not registered in ACS, or... | Wait 24 hours (may be maintenance). If not resolved: ensure Global Admin who ... | 7.5 | contentidea-kb |
| 6 | Unable to Configure Android for Work due to continuous looping back to Config... | Issue with IE Security Zone Settings. The manage.microsoft.com page and play.... | Workaround 1: If Protected Mode mismatch, go to Internet Options > Security, ... | 7.5 | contentidea-kb |
| 7 | When trying to configure the Microsoft Intune Exchange Connector you receive ... | This error can be caused by two things :Customer has configured Intune Exchan... | To resolve the issue you can do the following In Intune there can only be one... | 7.5 | contentidea-kb |
| 8 | A method is needed to have someone notified when the 20GB of cloud storage bu... |  |  | 7.5 | contentidea-kb |
| 9 | After your tenant is migrated from the Classic portal to the Azure Intune por... | This can occur if you configure Device platforms when creating the conditiona... | To resolve this problem, make sure that Device platforms is not configured wh... | 7.5 | contentidea-kb |
| 10 | Customer has an on-premise Exchange environment. Customer would like to know ... |  |  | 7.5 | contentidea-kb |
| 11 | Customer has configured Intune on-premise Exchange conditional access.    The... | This issue can occur if the user has configured Exchange active sync device r... | To find the users that are having are bypassing the Intune on-premise Exchang... | 7.5 | contentidea-kb |
| 12 | When setting up the Intune on-premise Exchange connector, error: The remote s... | Three possible causes: 1) Account used to setup connector is missing Intune l... | 1) Ensure account is global administrator and has Intune license. 2) Verify c... | 7.5 | contentidea-kb |
| 13 | At the beginning of February, Microsoft publicly released the information tha... | This issue was encountered because the Keys mentioned in the documentation ar... | I managed to pre-configure the Outlook email profile settings by using the Ke... | 7.5 | contentidea-kb |
| 14 | Previously customers could not remove email profiles if there was not another... | This is currently by-design. | Currently, the Engineering team has suspended removal of email profiles due t... | 7.5 | contentidea-kb |
| 15 | Previously Intune could not deliver support for MFA email-profiles. This is n... |  |  | 7.5 | contentidea-kb |
| 16 | As per the following TechNet Article https://docs.microsoft.com/en-us/sccm/md... |  |  | 7.5 | contentidea-kb |
| 17 | When you check on mobile device in the Intune console and under Exchange Acce... | This can be caused by HasActiveSyncDevicePartnership is set to false on user ... | To resolve this issue run the following Exchange PowerShell command Get-CASMa... | 7.5 | contentidea-kb |
| 18 | Moving Intune Exchange connector to new Exchange server fails with error: The... | Existing Exchange connector is still installed. | Remove the old connector first and then install the new connector. | 7.5 | contentidea-kb |
| 19 | Configuring Intune On-Premise Exchange Connector fails with error: The Micros... | Caused by different/mismatched version of the Intune On-premise Exchange conn... | Delete the existing connector from Intune Portal: Azure Portal > Intune > On-... | 7.5 | contentidea-kb |
| 20 | Email access issue on iOS 12 targeted by an Intune iOS Email Profile. User im... | This issue was caused by Intune deploying email profiles with a new iOS 12 op... | For new Email profile deployments, the issue was resolved for all impacted cu... | 7.5 | contentidea-kb |
| 21 | &quot;Device Admin is marked deprecated for enterprise use through updates to... |  |  | 7.5 | contentidea-kb |
| 22 | Email profiles deployed via Intune to iOS devices are not prompting the users... | This is a limitation of the EAS protocol when using basic authentication | This is expected behavior. An alternate solution is to enable OAuth for Authe... | 7.5 | contentidea-kb |
| 23 | When configuring the Intune Managed Browser or Edge browser there is several ... |  |  | 7.5 | contentidea-kb |
| 24 | Issue is resolved with 1904 Intune service releaseThere is currently an issue... |  |  | 7.5 | contentidea-kb |
| 25 | After enrolling into Intune and trying to configure Exchange mail in the nati... | This was occurring because the customer was migrating from Mobile Iron to Int... | To resolve this problem, remove the action from Mobile Iron. Once this is don... | 7.5 | contentidea-kb |
| 26 | Administrator has a highly scoped environment with multiple locations (+20), ... | Collected an F12 trace of the action failing in the portal.&nbsp; We used GSu... | Changed that setting to the All Users &amp; All devices selection for the Sco... | 7.5 | contentidea-kb |
| 27 | After configuring the Intune on premise Exchange connector&nbsp; you notice t... | This issue can be caused by a couple of things the first being that server ru... | To resolve the issue first make sure that you can connect to the affected Exc... | 7.5 | contentidea-kb |
| 28 | Prevent users from adding personal Google accounts to Android Enterprise devi... |  |  | 7.5 | contentidea-kb |
| 29 | Managed Exchange ActiveSync Profile improvements in iOS 13/iPadOSExchange Act... |  |  | 7.5 | contentidea-kb |
| 30 | When setting up the Intune on premise Exchange connector you receive the foll... | This issue can be caused by a couple of different causes. &nbsp; &nbsp;The fi... | Depending on the cause of the issue there are couple of different ways&nbsp; ... | 7.5 | contentidea-kb |
| 31 | Companies may use Zebra devices for retail, on the factory floor, and more. F... |  |  | 7.5 | contentidea-kb |
| 32 | Tenant Attach Case Handling &nbsp; Starting in Configuration Manager version ... |  |  | 7.5 | contentidea-kb |
| 33 | These are some of the suggested Best Practices for Surface Hubs.&nbsp;These a... |  |  | 7.5 | contentidea-kb |
| 34 | User changes UPN on AD. New UPN appears on Intune portal after few minutes as... | Username attribute in email profile settings was selected as a sAM account name. | Steps tried before final resolution.Step 1 – Create AD userStep 2 – Add user ... | 7.5 | contentidea-kb |
| 35 | The third-party application includes the Intune SDK (not the latest SDK versi... |  |  | 7.5 | contentidea-kb |
| 36 | When setting up the new unified Intune Certificates connector (Version 6.2108... | The Proxy Scheme for the new Unified Intune Connector that holds all connecto... | Therefore, editing the Proxy configuration for the Intune Connector will solv... | 7.5 | contentidea-kb |
| 37 | If you've uploaded a root certificate to Intune device configuration profile,... | Due to security reasons, the customer will not be able to download the root c... | You need to check the root certificate configuration profiles that applied to... | 7.5 | contentidea-kb |
| 38 | We can use managed device type app configuration policy to manage Chrome buil... |  |  | 7.5 | contentidea-kb |
| 39 | When troubleshooting Android Enterprise device configuration profiles, you ma... |  |  | 7.5 | contentidea-kb |
| 40 | Managed Home Screen Virtual Home button not working on Honeywell CT40 and Cov... |  | We need to create the following Device Configuration profile to address the i... | 7.5 | contentidea-kb |
| 41 | Similar to the Intune and other M365 services Windows 365 has its own applica... |  |  | 7.5 | contentidea-kb |
| 42 | This scenario was an advisory that was particularly critical due to the fact ... |  |  | 7.5 | contentidea-kb |
| 43 | Device Query provide administrators the ability to immediately query managed ... |  |  | 7.5 | contentidea-kb |
| 44 | Before deploying the configuration from Intune, go to a local machine make su... | Need to correct the XML | To solve this issue, I reproduce the following configuration     Need to corr... | 7.5 | contentidea-kb |
| 45 | This article is meant to help ease the troubleshooting routine when customers... |  |  | 7.5 | contentidea-kb |
| 46 | With the introduction of Podman rootless as an option for installing the Micr... |  |  | 7.5 | contentidea-kb |
| 47 | Some custom configuration profiles for iOS (used to configure exchange on-pre... | cx is creating the XML manually not using the Passwords delivered within the ... | Cx adjusted the format of the password in the xml file. | 7.5 | contentidea-kb |
| 48 | Summary: This article outlines observed service-side limitations when managin... |  |  | 7.5 | contentidea-kb |
| 49 | Email profile: Users repeatedly prompted for password. | Certificate profiles not assigned to same group type as email profile. | Assign all cert profiles to same group type (user or device) consistently. | 7.0 | mslearn |
| 50 | Exchange Connector configuration fails with error 0x0000001: The Microsoft In... | Internet proxy settings are misconfigured, preventing the Exchange Connector ... | Configure proxy using Netsh winhttp set proxy with correct proxy server and b... | 6.5 | mslearn |
| 51 | Exchange Connector configuration fails with error 0x000000b: CertEnroll::CX50... | The account used to sign in to Intune is not a Global Administrator account | Sign in to Intune with a Global Administrator account, or add the current acc... | 6.5 | mslearn |
| 52 | Exchange Connector configuration fails with error 0x0000006: The Microsoft In... | A proxy server is blocking traffic to the Intune service | Either remove proxy settings or configure the proxy to allow communication to... | 6.5 | mslearn |
| 53 | Exchange Connector service fails to start with Event 7000 or 7041: The servic... | The WIEC_USER service account does not have the Log on as a service user righ... | Assign Log on as a service right to WIEC_USER via Local Security Policy (secp... | 6.5 | mslearn |
| 54 | Email profiles deployed via Intune to iOS devices are not prompting the users... | This is a limitation of the EAS protocol when using basic authentication | This is expected behavior. An alternate solution is to enable OAuth for Authe... | 4.5 | contentidea-kb |
| 55 | Administrator has a highly scoped environment with multiple locations (+20), ... | Collected an F12 trace of the action failing in the portal. We used GSuite’s ... | Changed that setting to the All Users & All devices selection for the Scope G... | 4.5 | contentidea-kb |
| 56 | "Device Admin is marked deprecated for enterprise use through updates to docu... |  |  | 3.0 | contentidea-kb |
| 57 | When configuring the Intune Managed Browser or Edge browser there is several ... |  |  | 3.0 | contentidea-kb |
| 58 | Issue is resolved with 1904 Intune service release There is currently an issu... |  |  | 3.0 | contentidea-kb |
| 59 | After enrolling into Intune and trying to configure Exchange mail in the nati... | This was occurring because the customer was migrating from Mobile Iron to Int... | To resolve this problem, remove the action from Mobile Iron. Once this is don... | 3.0 | contentidea-kb |
