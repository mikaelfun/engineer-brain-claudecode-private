---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Firewall Rule Migration"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FFirewall%20Rule%20Migration"
importDate: "2026-04-05"
type: troubleshooting-guide
---
[[_TOC_]]

# About Firewall Rule Migration

Many organizations are moving their security configuration to Microsoft Endpoint Manager to make use of modern, cloud-based management. Endpoint security in Endpoint Manager offers rich management experiences of Windows Firewall configuration and granular firewall rule management.

Because it can be challenging to move large numbers of existing Group Policies for Windows Firewall rules to Endpoint security policies in Endpoint Manager, we've created the Endpoint security firewall rule migration tool.

When you run the Endpoint security firewall rule migration tool on a reference Windows 10 client that has firewall rules based on Group Policy applied, the tool can automatically create Endpoint security firewall rule policies in Endpoint Manager. After the endpoint security rules are created, administrators can target the rules to Azure AD groups to configure MDM and co-managed clients.

[Endpoint security firewall rule migration tool for Microsoft Intune | Microsoft Docs](https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool)

# How Firewall Rule Migration works

Run the tool on a reference machine to migrate that machines current Windows Firewall rule configuration. When run, the tool exports all enabled firewall rules that are present on the device, and automatically creates new Intune policies with the collected rules.

# How to configure Firewall Rule Migration

Users assigned the Intune roles for Endpoint Security Manager, Intune Service Admin, or Global Admin can migrate Windows Firewall rules to Endpoint security policies. Alternatively, you can assign the user a custom role where Security baselines permissions are set with Delete, Read, Assign, Create, and Update grants are applied. For more information, see Grant admin permissions to Intune.

[Download the Endpoint security firewall rule migration tool](https://aka.ms/EndpointSecurityFWRuleMigrationTool)

Run the tool on a reference machine to migrate that machines current Windows Firewall rule configuration. When run, the tool exports all enabled firewall rules that are present on the device, and automatically creates new Intune policies with the collected rules.

1. Sign in to the reference machine with local administrator privileges.

2. Download and unzip the file Export-FirewallRules.zip.

The zip file contains the script file Export-FirewallRules.ps1.

3. Run the Export-FirewallRules.ps1 script on the machine.

The script downloads all the prerequisites it requires to run. When prompted, provide appropriate Intune administrator credentials. For more information about required permissions, see Required permissions.

4. Provide a policy name when prompted. The policy name must be unique for the tenant.

When more than 150 firewall rules are found, multiple policies are created.

Policies created by the tool are visible in the Microsoft Endpoint Manager in the Endpoint security > Firewall pane.

<IMG  src="https://saegpipelinesdatalive.blob.core.windows.net/private/evergreen%2Fneutral%2Fea43c027-fa5f-3287-fade-1dbdcc59c090%2F3f900f82a2912458ff2670acc277e4d029eda744.png?sv=2021-08-06&amp;st=2024-01-11T21%3A16%3A13Z&amp;se=2024-01-11T21%3A21%3A13Z&amp;sr=b&amp;sp=r&amp;sig=3KH%2FyibLIdDHc06c4Jn90C%2F%2FGMS8Q2sA3DQ16XJwqqE%3D"  alt="163679-jch-001-frm.png"/>

5. After the tool runs, it outputs a count of firewall rules that it couldn't automatically migrate. For more information, see Unsupported configuration.

Switches: https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#switches

# Scoping Questions for Firewall Rule Migration cases

1. Please provide the full error description.
2. Please provide the steps taken to observe the behavior.
3. Please provide the policyID, example userID and deviceID for the investigation.
4. Please provide if the deviceID is Intune enrolled, co-managed, tenant attached or MDE attached.
5. Please provide if this ever worked and what was the last change if any before the issue occurred.

# Support Boundaries for Firewall Rule Migration cases

Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue. Transfer the case or open an AR with the following teams.

- Microsoft Defender Application Guard: Windows UEX
- Microsoft Defender Firewall: Windows networking.
- Microsoft Defender SmartScreen: Azure Security
- Windows Encryption: MSaaS Windows Devices
- Microsoft Defender Exploit Guard: Azure Security
- Microsoft Defender Application Control: MSaaS Windows Devices
- Microsoft Defender Credential Guard: MSaaS Windows Devices
- Microsoft Defender Security Center: Azure Security
- Local device security options: Intune
- User Rights: MSaaS Windows Devices

**NOTE**: Due to misroutes and CSS support to remove delays to customers, please when referencing this article for Endpoint Security, please review the following MDE Attach and ConfigMgr Tenant attach articles below to assure that the support scenario you are facing aligns with Intune support. Please note that even in the event of the support falling under Intune these articles provide information relative to the investigation as well.

**MDE Attach for Windows Server security management - Support Boundaries**
Configuration Manager Tenant Attach - Support Boundaries (Opens in new window or tab) and How to deploy MDE policies to Windows Server KB (Opens in new window or tab)

**Endpoint Security**

Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue. Transfer the case or open an AR with the following teams.

- Antivirus: Azure Security
- Disk Encryption: MSaaS Windows Devices
- Firewall: Windows networking.
- Includes Firewall rule migration
- ASR: Azure Security
- Account protection: MSaaS Windows Devices credential guard or Azure Identity for WHFB

**Microsoft Defender Onboarding using Intune**

Intune supports the deployment of Defender and enabling the connector. Intune also supports verifying that the onboarding script gets to the devices and onboards to https://security.microsoft.com/ (Opens in new window or tab). If there issue is with onboarding itself, submit an AR to the Azure Security team.

Firewall unsupported configurations:Unsupported configurations:https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-configuration (Opens in new window or tab) Unsupported settings values: https://docs.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-rule-tool#unsupported-setting-values (Opens in new window or tab)

**Security Endpoint Reports**

Intune security reports on endpoint.microsoft.com (Opens in new window or tab) are supported by Intune. If the issue is directly related to security itself, that is owned by Azure Security.

**Endpoint Analytics: Azure Monitor**

Intune supports the deployment thru Intune stated on Quickstart - Enroll Intune devices - Microsoft Endpoint Manager | Microsoft Docs (Opens in new window or tab)

Note that the Azure Monitor team is responsible for the following:

- Workspace management (create, move, remove)
- Log Analytics agents installation and maintenance, both direct agents and extensions
- Workbook experience (not related to missing data / data accuracy)
- The following data connectors: Azure Active Directory, Azure Activity, Microsoft Web application firewall (WAF), Office 365 (legacy solution)
- Syslog related issues: Connector and agent deployment, data delays, data loss
- Parsing issues with Syslog and Windows/Linux agent
- Interflow data enrichment is also supported by the Monitoring team based on conversations with their Product Teams

**Disclaimer**

All Assistance Requests going to ANY Windows support team, requires to first be posted in a SME channel for the feature area in Intune and tagged with the WindowsAR tag to be reviewed by the Windows AR team. The Windows AR review team will review and provide feedback.

# Troubleshooting Firewall Rule Migration cases

Coming soon...

# Training and Videos for Firewall Rule Migration

[How to import Microsoft Defender Firewall Rules into Intune](https://youtu.be/QOrG7YmII_8)

# Additional Documentation for Firewall Rule Migration

Coming soon...






