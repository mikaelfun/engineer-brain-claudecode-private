---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Global Secure Access client for iOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGlobal%20Secure%20Access%20client%20for%20iOS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Global Secure Access Client for iOS

The GSA client is deployed through Microsoft Defender for Endpoint on iOS. The GSA client on iOS uses a local/self-looping VPN (not a regular VPN).

## Prerequisites

- iOS endpoint device must be Microsoft Entra registered
- Tenant onboarded to Global Secure Access with one or more traffic forwarding profiles configured
- For Kerberos SSO: deploy a Single sign-on app extension profile via Intune

## Requirements

### Network Requirements
Configure firewall/proxy to enable access to Microsoft Defender for Endpoint service URLs.

**Note: MDE on iOS is NOT supported on userless or shared devices.**

### System Requirements
- iOS 15.0 or newer
- Microsoft Authenticator app or Intune Company Portal app installed
- Device enrolled to enforce Intune device compliance policies

## Supported Modes
Supports both supervised and unsupervised enrolled devices.

## Installation Steps (Intune)

1. In Intune admin center: **Apps** > **iOS/iPadOS** > **Add** > **iOS store app**
2. Search for **Microsoft Defender** in App Store
3. Select **iOS 15.0** as minimum OS
4. In **Assignments** > **Required** > **Add group** (must be Intune enrolled users)
5. **Review + Create**

## VPN Profile Configuration

1. In Intune: **Devices** > **Configuration** > **Create** > **New Policy**
2. Platform: **iOS/iPadOS**, Profile type: **Templates**, Template: **VPN**
3. Connection Type: **Custom VPN**
4. Base VPN settings:
   - Connection Name: Microsoft Defender for Endpoint
   - VPN server address: 127.0.0.1
   - Auth method: Username and password
   - Split Tunneling: Disable
   - VPN identifier: com.microsoft.scmx

5. Key-value pairs:
   - **SilentOnboard** = True
   - **EnableGSA**: 0=disabled/hidden, 1=visible+default off, 2=visible+default on, 3=visible+forced on
   - **EnableGSAPrivateChannel** (optional): same values as EnableGSA for Private Access toggle

6. Automatic VPN: On-demand VPN
   - Rule: Connect VPN, Restrict to All domains
7. Block users from disabling automatic VPN: **Yes** (recommended)

## Troubleshooting

### GSA Tile Not Appearing
Force stop the Defender app and relaunch it.

### Private Access Connection Timeout After Sign-in
Reload the application or refresh the web browser.

### Collecting Client Logs
1. Open Defender app > side navigation menu
2. **Help & Feedback** > **Send Feedback to Microsoft**
3. Select **I want to report an issue**
4. Add description, check **Include your email address** and **Send diagnostic data**
5. Submit

For basic debugging from logs: see [Basic Debugging from Logs - Overview](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/61582/Basic-Debugging-from-Logs)

### Services Status Check
Open Defender > click **Global Secure Access** tile. Icon should show **green** if GSA is tunneling traffic. Expand services card to verify **Connected** status.

### Health Check
Tap the GSA icon **5 times** rapidly > expand troubleshooting card > **Advanced diagnostics** > **Network and hostname traffic** > **Start**.

## ICM Escalations

| Area          | IcM Path                                 |
| :------------ | :--------------------------------------- |
| Data Path     | Global Secure Access / GSA Datapath      |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [The Global Secure Access Client for iOS (Preview)](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-install-ios-client)
