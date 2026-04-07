---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/How To: AD RMS/How To: IIS Kerberos configuration for AD RMS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20IIS%20Kerberos%20configuration%20for%20AD%20RMS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
In some cases AD RMS cluster name configuration is configured to use Kerberos authentication. When using Kerberos authentication, where the Kerberos service principal (SPN) is on the AD RMS service account, ensure IIS is configured properly.

# Purpose
This is not an authoritative guide for configuring Kerberos authentication. It is a way to do so, for guidance. 

# AD RMS Service Account
**Service Principal Names (SPN)**
During authentication AD RMS clients will query active directory for a Kerberos SPN. In this case the RMS cluster FQDN is `irm.moose.local`. The Kerberos service request for a web service is `HTTP`. Note this has no relationship to whether AD RMS is using the http or https protocol. In the end clients are looking for an SPN of `HTTP/irm.moose.local`.

There are two ways to configure a SPN on an account in AD. You may use a command line tool, `setspn.exe` or the AD Users and Computer GUI. We'll use the GUI in this wiki. 

Once the appropriate SPNs are registered on the service account it must be trusted for delegation. 

## Registering SPNs 

1. Open AD Users and Computers (ADUC)
2. Go under `View` and enable `Advanced Features`.
3. Navigate to the RMS service account, right click, and choose properties. 
4. In the properties page:
 - Go to the `Attribute Editor` tab. 
 - Press the `Filter` button and choose `Show only attributes that have values`.
5. Scroll to the `servicePrincipalName` attribute and double click it. 
 - In the multi-valued string editor dialog add the `HTTP/irm.moose.local` text and press add. 
 - Press OK to finish this dialog. 

## Trusting for Delegation
Continue on in ADUC from the previous step.

1. On the RMS service account's property page, select the `Delegation` tab. 
 - Enable the 'Trust this user for delegation to specified services only' and `Use Kerberos only` radio buttons. 
 - Press the `Add` button.
2. In the `Add Services` dialog, press the `Users and Computers...` button and use it to choose the RMS service account.
3. Under `Available services` choose the HTTP for the RMS cluster name and press OK.
4. The service account is now trusted to do Kerberos for the HTTP service. 

# AD RMS Server

## IIS

When using a service account for the Kerberos authentication, the following setting needs to be configured.

1. Open IIS Management Console.
2. Navigate to the `_wmcs` object.
3. Choose Authentication from the center section.
4. Go to Windows authentication and choose `Advanced Settings`.
5. Ensure `Enable Kernel-mode authentication` is selected.
