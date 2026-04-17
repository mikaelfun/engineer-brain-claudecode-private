---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 AVD Conditional Access Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FAVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%2FAVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20AVD%20Conditional%20Access%20Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Conditional Access Policies for Azure Virtual Desktop access

When creating a Conditional Access policy that requires multifactor authentication when connecting to Azure Virtual Desktop, include these applications under **Cloud apps or actions**.

## Using Azure Virtual Desktop (based on Azure Resource Manager)

Configure MFA for three different apps:

- **Azure Virtual Desktop** (app ID `9cdead84-a844-4324-93f2-b2e6bb768d07`) - applies when user subscribes to a feed and authenticates to the AVD Gateway during connection.
  - **Note**: The app name was previously **Windows Virtual Desktop**. If the customer registered the `Microsoft.DesktopVirtualization` resource provider before the display name changed, the application will be named **Windows Virtual Desktop** with the same app ID.

- **Microsoft Remote Desktop** (app ID `a4a365df-50f1-4397-bc59-1a1564b8bb9c`) and **Windows Cloud Login** (app ID `270efc09-cd0d-444b-a71f-39af4910ec45`) - apply when user authenticates to session host when SSO is enabled. Match CA policies between these apps and the AVD app, except for sign-in frequency.

## Using Azure Virtual Desktop (classic)

Configure MFA using these apps:

- **Windows Virtual Desktop** (app ID `5a0aa725-4958-4b0c-80a9-34562e23f3b7`)
- **Windows Virtual Desktop Client** (app ID `fa4345a4-a730-4230-84a8-7d9651b86739`) - for web client policies.

> **Note**: If using AVD (classic) and CA policy blocks all access excluding AVD app IDs, also add **Azure Virtual Desktop** (app ID `9cdead84-a844-4324-93f2-b2e6bb768d07`) to prevent blocking feed discovery.

## Enforce MFA for Windows Remote Desktop Client (mstsc.exe)

Using the **Advanced** User Authentication property in the .RDP file ("Use a web account to sign in to the remote computer"):

- To enforce MFA: Include **Microsoft Remote Desktop** and **Azure Virtual Desktop** as cloud apps with **Require multifactor authentication** grant control.
- To prevent MFA: Include **All cloud apps** and Exclude **Microsoft Remote Desktop** and **Azure Virtual Desktop**.

## Enforce MFA for AVD

Requires the `enablerdsaadauth` property added as an RDP property on the AVD host pool:

- To enforce MFA: Include **Azure Virtual Desktop** and **Windows Virtual Desktop Client** as cloud apps with MFA grant control.
- To prevent MFA: Include **All cloud apps** and Exclude **Azure Virtual Desktop** and **Windows Virtual Desktop Client**.

## Key App IDs Reference

| App Name | App ID | Use Case |
|----------|--------|----------|
| Azure Virtual Desktop | `9cdead84-a844-4324-93f2-b2e6bb768d07` | Feed subscription + Gateway auth |
| Microsoft Remote Desktop | `a4a365df-50f1-4397-bc59-1a1564b8bb9c` | Session host auth (SSO) |
| Windows Cloud Login | `270efc09-cd0d-444b-a71f-39af4910ec45` | Session host auth (SSO) |
| Windows Virtual Desktop (classic) | `5a0aa725-4958-4b0c-80a9-34562e23f3b7` | Classic AVD |
| Windows Virtual Desktop Client (classic) | `fa4345a4-a730-4230-84a8-7d9651b86739` | Classic web client |

## Reference

- [Enforce Microsoft Entra MFA for Azure Virtual Desktop using Conditional Access](https://learn.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa?tabs=avd)
