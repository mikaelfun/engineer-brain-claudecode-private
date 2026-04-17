---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: How to build your lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA%3A%20How%20to%20build%20your%20lab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: How to build your lab

## Why use Intune Cloud PKI?

Intune Cloud PKI is the simplest means of deploying a PKI and deploying certs for use for CBA.

- Provides a secure PKI with no need to patch and maintain any on-premises infrastructure
- Provides CRL paths that are internet accessible without the need for maintaining firewall rules
- Supports deploying certs via SCEP for use with Windows Hello for Business

However, it has some limitations. You cannot enrol for certificates on your smart card using this method as of now.

This document describes a simple approach for getting a PKI built and certs deployed to Intune managed lab devices for use with CBA on Windows and non-Windows (iOS/Android/MacOS) platforms.

## Step 1: Create your Entra ID tenant

**You can skip this section if your lab is already created using https://aka.ms/SupportSubscriptions instructions.**

Follow the guidance at https://aka.ms/SupportSubscriptions to create a tenant if you don't already have a suitable lab tenant.

## Step 2: Enable Intune Cloud PKI trial

1. Browse the https://intune.microsoft.com portal
2. Navigate to Tenant Administration - Intune Add-ons
3. Click on view details link for the "Cloud PKI" option
4. Navigate to the offer link displayed for the Microsoft 365 admin center
5. Click the free trial option and complete it

## Step 3: License the users for Intune Cloud PKI

Use the https://admin.microsoft.com portal to assign licenses to users.

## Step 4: Configure 2-tier Cloud PKI

Follow instructions at https://learn.microsoft.com/en-us/mem/intune/protect/microsoft-cloud-pki-configure-ca

For EKU selection at the very least include "Client Authentication" and "Smart Card Logon".
Choose the longest duration possible for each CA created. Download the certs for each CA for use in later steps.

## Step 5a: Configure Intune policies to deploy trusted certs

Trusted Root and Intermediate certs via the "trusted certificate" template. You may have done this already as part of the earlier step.

## Step 5b: Configure Intune policies to deploy certs via SCEP

For deploying certs for use with Windows Hello for Business see https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/rdp-sign-in?tabs=intune#deploy-certificates to configure the following policies.

For regular user certificates unrelated to WHfB you can use the same settings as for RDP but choose a different KSP such as "Enroll to Trusted Platform Module (TPM) KSP if present, otherwise Software KSP". These certs will be stored in the user profile.

Ensure you have "Digital Signature" in key usage selected and the SAN should have {{UserPrincipalName}}.
The SCEP URL will be of the issuing CA and not the root CA.

Once the device checks for any applicable Intune configuration policies the licensed user will get any relevant certs deployed to their device accordingly.

You can use certmgr.msc on Windows to see any certificates that have been enrolled on the device.

## Step 6: Enable CBA in Entra

See https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-certificate-based-authentication.

You should now be able to logon using a web browser to Entra using any certs received via SCEP from your PKI.
