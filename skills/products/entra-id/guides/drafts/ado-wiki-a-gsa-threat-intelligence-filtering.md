---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Threat Intelligence Filtering"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Threat%20Intelligence%20Filtering"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA - Threat Intelligence Filtering

## Summary

Microsoft Entra Global Secure Access (GSA) Threat Intelligence is a security feature that automatically identifies and **blocks connections to known malicious internet destinations**. It uses real-time threat indicator feeds (from Microsoft and select partners) to flag domains, URLs, or IP addresses associated with high-severity threats.

- **Policy Actions:** Administrators configure a Threat Intelligence policy in the Entra Global Secure Access portal. By default, any destination marked as a high-severity threat can be **Blocked** (traffic is denied), or the admin can choose Report-Only mode to **Allow** the traffic but log an alert. Admins can also create **allow exceptions** for specific sites (to override false positives).
- **Integration:** The Threat Intelligence policy works as part of GSA's Secure Web Gateway. It can apply **tenant-wide** (via a Baseline profile) or be scoped to specific user groups using Conditional Access (user-based policy). TLS Inspection (if enabled) allows TI to examine full URLs; otherwise, TI will still act on domain names.
- **Real-time Blocking:** When a user tries to visit a known malicious site, Threat Intelligence will immediately block the connection if it's a high-severity threat. The user's browser will show a block page stating the site is blocked by security policy.
- **Logging:** All Threat Intelligence actions are recorded in the **GSA Network Traffic Logs** with details such as the action taken (Blocked/Allowed), the indicator, and a **Threat Type** classification.

## Prerequisites

- The [Global Secure Access Administrator role](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference) to manage GSA features.
- The [Conditional Access Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#conditional-access-administrator) to create and interact with CA policies.
- Complete the [Get started with Global Secure Access](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-get-started-with-global-secure-access) guide.
- [Install the Global Secure Access client](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-install-windows-client) on end user devices.
- Disable DNS over HTTPS (Secure DNS) to tunnel network traffic.
- Disable built-in DNS client on Chrome and Microsoft Edge.
- IPv6 traffic isn't acquired by the client - set network adapter to [IPv4 preferred](https://learn.microsoft.com/en-us/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check#ipv4-preferred).
- QUIC (UDP) isn't supported in Internet Access preview. Deploy a Windows Firewall rule to block outbound UDP 443:
  ```powershell
  New-NetFirewallRule -DisplayName "Block QUIC" -Direction Outbound -Action Block -Protocol UDP -RemotePort 443
  ```
- (Optional) [Configure TLS inspection](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-transport-layer-security) for URL indicators to be evaluated against HTTPS traffic.

## High Level Steps

1. Enable internet traffic forwarding
2. Create a threat intelligence policy
3. Configure your allow list (optional)
4. Create a security profile
5. Link the security profile to a Conditional Access policy

## Enable Internet Traffic Forwarding

Enable the Internet Access traffic forwarding profile. See: [How to manage the Internet Access traffic forwarding profile](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-manage-internet-access-profile).

You can scope the Internet Access profile to specific users and groups.

## Create a Threat Intelligence Policy

1. Browse to **Global Secure Access** > **Secure** > **Threat Intelligence Policies**.
2. Select **Create policy**.
3. Enter a name and description for the policy and select **Next**.
4. The default action for threat intelligence is "Allow" (traffic not matching a rule will proceed to the next security control).
5. Select **Next** and **Review** your new threat intelligence policy.
6. Select **Create**.

**Important:** This policy is created with a rule blocking access to destinations where high severity threats are detected. Microsoft defines high severity threats as domains or URLs associated with active malware distribution, phishing campaigns, command-and-control (C2) infrastructure, and other threats.

## Configure Allow List (Optional)

1. Under **Global Secure Access** > **Secure** > **Threat Intelligence Policies**, select your chosen policy.
2. Select **Rules** > **Add rule**.
3. Enter a name, description, priority, and status for the rule.
4. Edit **Destination FQDNs** and select the list of domains for your allow list (comma-separated).
5. Select **Add**.

## Create a Security Profile

**Note:** You can only configure one threat intelligence policy per security profile. Rule priorities: (1) TLS inspection > (2) Web content filtering > (3) Threat intelligence > (4) File type > (6) DLP > (7) Third-party.

1. Browse to **Global Secure Access** > **Secure** > **Security profiles**.
2. Select **Create profile**.
3. Enter a name and description, select **Next**.
4. Select **Link a policy** > **Existing threat intelligence policy**.
5. Select the policy you created, select **Add**.
6. Select **Next** to review, then **Create profile**.

You can alternatively link your threat intelligence policy to the **baseline security profile** (applies tenant-wide to all users' traffic).

## Create and Link Conditional Access Policy

1. Browse to **Identity** > **Protection** > **Conditional Access**.
2. Select **Create new policy**.
3. Enter a name and assign a user or group.
4. Select **Target resources** > **All internet resources with Global Secure Access**.
5. Select **Session** > **Use Global Secure Access security profile** and choose the profile.
6. Ensure **On** is selected under **Enable policy**, then **Create**.

**Note:** Applying a new security profile can take up to 60-90 minutes because security profiles are enforced via access tokens.

## Verify End User Policy Enforcement

1. Right-click on the GSA client icon in the task tray > **Advanced Diagnostics** > **Forwarding profile**. Ensure Internet access acquisition rules are present.
2. Navigate to a known malicious site (e.g., `entratestthreat.com` or `smartscreentestratings2.net`). Ensure you're blocked and the Threat Type field is nonempty in traffic logs (may take up to 5 minutes to appear).
3. If blocked by Windows Defender or SmartScreen, override and access the site to test the GSA block message.
4. To test allow-listing, create a rule to allow access to the site. Within 2 minutes, you should be able to access it (clear browser cache if needed).

**Note:** After configuring a threat intelligence policy, you may need to clear your browser's cache to validate policy enforcement.

## ICM Escalations

| Area | IcM Path |
|------|----------|
| Data Path | Global Secure Access / GSA Datapath |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [Threat Intelligence threat types reference](https://learn.microsoft.com/entra/global-secure-access/reference-threat-intelligence-threat-types)
