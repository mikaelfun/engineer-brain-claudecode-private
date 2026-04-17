---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Trusts/Kerberos: Understanding Trust Directions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20Example%20Reference/Kerberos%3A%20Trusts/Kerberos%3A%20Understanding%20Trust%20Directions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2150845&Instance=2150845&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/2150845&Instance=2150845&Feedback=2)

___
<div id='cssfeedback-end'></div>

Understanding terminology regarding trusts can be confusing.  This article should help to be a quick reference guide for one way trusts.  

###Trusted
"`adatum.com` is trusted by `contoso.com`"  
Since Adatum is trusted as an authentication authority, Adatum user accounts are allowed access to Contoso.  You can assign permissions on Contoso resources to Adatum users.
###Trusts
"`contoso.com` trusts `adatum.com`"  
Since Contoso trusts Adatum as an authentication authority, Adatum user accounts are allowed access to Contoso.  You can assign permissions on Contoso resources to Adatum users.
###Outgoing trust
"`Contoso.com` has an outgoing trust with `adatum.com`"  
![image.png](/.attachments/image-fdb937e6-71fd-4444-8a7a-71ef70568fd2.png)  
Per the text, "Domains trusted by this domain," `adatum.com` is a domain trusted by this (`contoso.com`) domain.  
Since Adatum is trusted as an authentication authority, Adatum user accounts are allowed access to Contoso.  You can assign permissions on Contoso resources to Adatum users.
###Incoming trust
"`adatum.com` has an incoming trust with `contoso.com`"  
![image.png](/.attachments/image-b590f95a-db29-409c-bc5a-97126d544d44.png)  
Per the text, "Domains that trust this domain," `contoso.com` is a domain that trusts this (`adatum.com`) domain.  
Since Contoso trusts Adatum as an authentication authority, Adatum user accounts are allowed access to Contoso.  You can assign permissions on Contoso resources to Adatum users.

###Resource granting effects in trustING domain
What affect does this have when it comes to locations?  Since we would need to be able to assign Adatum users somewhere in Contoso, we will see it in the list of locations on Contoso assets:  
![image.png](/.attachments/image-8f4b8b3a-d898-4a4f-8f67-294fa2231adf.png)  
This is just looking at the Locations option when selecting NTFS permissions.

###Resource granting effects in trustED domain
However, in Adatum, it does not trust Contoso, so there is no reason to permit Contoso as an option in locations when granting access to resources.  
![image.png](/.attachments/image-a9daf296-f752-47f0-a89e-106efa041049.png)
