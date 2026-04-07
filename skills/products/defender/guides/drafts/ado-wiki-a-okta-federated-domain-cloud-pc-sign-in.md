---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/Logstash to LA Connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Third%20Party%20Connectors/Logstash%20to%20LA%20Connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary**
User is unable to sign in to Cloud PC via web or remote desktop client
Investigation shows that the domain is federated with a third party identity provider (Okta)
Web client shows error "Sign in failed"

![image.png](/.attachments/image-76f68b09-598d-4dc9-a821-bdd5c18392f9.png)


**Cause**
Cause 1 - The UserPrincipalName in Azure AD does not match the UserPrincipalName that Okta uses to authenticate

Cause 2 - Okta has a policy that blocks basic authentication

Cause 3 - Okta is not properly configured for use with Hybrid Azure AD Joined devices

Note: In all three scenarios mentioned above, the actions need to take place in the Okta portal. As a best practice, have the customer open a support ticket with Okta as soon as you identify that the domain is federated with Okta.

**Troubleshooting**

Use ASC to validate if the domain is federated with a third party IDP
Go to ASC and open the tenant for the organization
Under Tenant Explorer, select Domains
Click on Federation tab, look for the affected domain and confirm if it is federated:
![image.png](/.attachments/image-c73297ab-c3b0-407d-acf2-8d29e4c90814.png)

If the domain is federated with a third party IDP and the customer is having authentication issues, please have the customer open a support ticket with Okta for further assistance. You may keep the ticket open with Windows 365 and collaborate with Okta if necessary.

Use ASC to look for failed sign in attempt
Under User tab, search for the affected user
Click on Sign-ins tab, and search for Application: "Azure Virtual Desktop Client"
Check if you find any failed sign in attempt in interactive and non-interactive logs.

Check Security log in Event Viewer
Collect logs from the affected Cloud PCs
Filter Security log for event 4625
This is an example of a failed sign in attempt when using Okta:

	Log Name:      Security
	Source:        Microsoft-Windows-Security-Auditing
	Date:          8/3/2022 2:06:14 PM
	Event ID:      4625
	Task Category: Logon
	Level:         Information
	Keywords:      Audit Failure
	User:          N/A
	Computer:      CPC-JohnContoso
	Description:
	An account failed to log on.
	
	Failure Information:
		Failure Reason:		An Error occured during Logon.
		Status:			0xC000006D
		Sub Status:		0xC00484C1
	
Error translation:
0xc000006d	-1073741715	STATUS_LOGON_FAILURE	The attempted logon is invalid. This is either due to a bad username or authentication information.	ntstatus.h
0xc00484c1	-1073445695	AAD_CLOUDAP_E_WSTRUST_SAML_TOKENS_ARE_EMPTY	N/A	aadidcrl.h

This log was for scenario 2, where Okta blocked legacy/basic auth for all Office 365 connections. 
Confirmed that the second authentication prompt when connecting to the Cloud PC from the web requires basic authentication.
Okta team guided the customer to enable Legacy auth but then filter on "request.userAgent.contains("Windows-AzureAD-Authentication-Provider/1.0")" to only allow basic Auth on Cloud PCs.

**More information**

Per our public documentation, federated domain must support WS-Trust protocol to authenticate Windows current hybrid Azure AD joined devices with Azure AD. Customer needs to work with their third party IDP to ensure that it supports WSTrust
https://docs.microsoft.com/en-us/azure/active-directory/devices/howto-hybrid-azure-ad-join#federated-domains

Some providers also need a special configuration to enable ability to authenticate to HAADJ devices.
Using Okta for Hybrid Microsoft AAD Join:
https://www.okta.com/resources/whitepaper/using-okta-for-hybrid-microsoft-aad-join/ 

https://dev.azure.com/contentidea/ContentIdea/_workitems/edit/169013
https://internal.evergreen.microsoft.com/topic/e2b56993-2fd9-f358-47ea-5abe6b596ac6
