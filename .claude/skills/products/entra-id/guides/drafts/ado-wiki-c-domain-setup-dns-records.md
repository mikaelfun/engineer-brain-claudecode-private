---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Domains and DNS/Domain setup and verification DNS records"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FDomains%20and%20DNS%2FDomain%20setup%20and%20verification%20DNS%20records"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Setup/Verification and DNS Records

## Introduction
This article explains the steps required to setup and verify a custom domain. It also talks about common known issues related to domain verification and DNS records required by services like EXO and SfBO.

## Requirements
You need to have Global Administrator role to manage DNS records on M365 admin portal.

## Domain Setup and Verification
Refer to the wiki for detailed steps on how to verify a custom domain and troubleshoot common issues related to it.
[Azure AD Domain Name Management - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183951/Azure-AD-Domain-Name-Management?anchor=concepts)

## Tenant Lockout Scenarios

If you find yourself in a Tenant Lockout Scenario see [Tenant Lockout Eng Instructions](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/355310/Tenant-Lockout-Eng-Instructions) for insights, how to respond to a tenant lockout and when to engage the Data Protection team.

### [Common Lockout Scenarios](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1076816/Common-Lockout-Scenarios)

## Verify Domain Configuration

If you need to verify if a domain is already verified and in which tenant, if the tenant is **Viral or "common"**. Refer to [Troubleshooting domain verification configuration](https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/808948/Troubleshooting-domain-verification-configuration) for more information.

### Verify Viral Vs Managed Domain
### Confirming Federated vs Managed Domain Configuration

## Manage DNS Records
Once the domain is verified, M365 admin portal points to configure few DNS records for EXO and SfBO services.

NOTE: Domain verification required either TXT or MX record only. All other records are consumed by respective services.

These contain DNS records for Microsoft Exchange, Skype for Business Online, Basic Mobility & Security and DKIM. You can manage these records by going to **M365 admin center -> Settings -> Domains -> Your custom domain -> ManageDNS**.

Wrong DNS configuration for these records might cause issues with EXO/SfBO services.

While configuring DNS records, the portal will show the default values for these records that need to be configured on the DNS server. However, don't use the default records in the following conditions:

- You need custom DNS routing for your email, for example, to route traffic through an external spam filtering service.
- You're already using Exchange on-premises as well as Exchange Online (also called a hybrid deployment).

In such cases you will have to consult Exchange SMEs to configure the right set of DNS values.

NOTE: Cases related to TXT record for domain verification will be our responsibility, rest all other records are consumed by respective services. Route the case to the respective service, if the issue is not caused by M365 portal itself.

## How to Setup Microsoft 365 to Manage DNS Records

After the domain verified on M365 admin center, the user can set up their domain with Microsoft 365 services. They need to change their domain's nameserver (NS) records at domain registrar to point to the Microsoft 365 primary and secondary nameservers:

1. First nameserver: ns1.bdm.microsoftonline.com
2. Second nameserver: ns2.bdm.microsoftonline.com
3. Third nameserver: ns3.bdm.microsoftonline.com
4. Fourth nameserver: ns4.bdm.microsoftonline.com

Steps:
1. Navigate to Office 365 admin center > Settings > Domains page
2. Select a domain (non-pointed domains show as "Managed at Generic")
3. Click "Manage DNS"
4. On connection options page, click "More options"
5. Add nameserver records shown on portal to domain registrar
6. After NS records published, domain will show as "Managed at Microsoft 365"

## Common Scenarios

### Scenario 1: Wrong Exchange DNS records causing mail flow
- **Troubleshooting Scope: M365 Identity** — Values on portal must match DNS server. If mismatch, collect HAR trace. Wait 24 hours for recent changes before reaching PG.
- **Troubleshooting Scope: Exchange Online** — If issue stems from wrong CNAME or autodiscover records, route to Exchange Online.

### Scenario 2: DKIM failure
Any DKIM queries must be addressed by Exchange Online team. If records are incorrect, change as directed by Exchange team. If customer wants self-managed DKIM, uncheck DKIM on Portal.

### Scenario 3: Residual name servers on M365 portal
**Resolution:** Click "Manage DNS" and choose "manage your own DNS records". Copy TXT/MX record values to DNS provider. After update, NS records should be removed in M365 admin center.

## Name Server Scenarios

### Scenario 1: NS records not detected error
**Solution:**
1. Confirm if customer needs NS records pointed to Microsoft 365
2. If "No" — change domain connection option from "Set up my online services for me" to "Add your own DNS records"
3. If "Yes" — verify NS records at registrar in correct format (ns1-ns4.bdm.microsoftonline.com)
4. Use nslookup to verify NS records resolve from internet
5. If records resolve but portal still errors — go to Setup > Domains > Check health
6. If still failing — escalate via ICM: **[ID] [M365] [MAC] - Manage Users, Groups, and Domains**

### Scenario 2: NS records detected but domain not managed
**Solution:** Change domain connection option to "Set up my online services for me" (user had incorrect option selected).

## Escalation
ICM template: **[ID] [M365] [MAC] - Manage Users, Groups, and Domains**
