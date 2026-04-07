---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: Authentication Policies and Silos/Verifications and Troubleshooting/Identity and Claims"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20Authentication%20Policies%20and%20Silos/Verifications%20and%20Troubleshooting/Identity%20and%20Claims"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924668&Instance=1924668&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1924668&Instance=1924668&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This article explains the concept of claims in the context of Active Directory and Windows Server 2012. It describes what claims are, the types of claims, claim data types, and how claims are used in the Privilege Attribute Certificate (PAC) and Kerberos armoring.

[[_TOC_]]
  

# What Is a Claim
A claim is information a trusted source makes about an entity. The SID of a user or computer; mail uses by ADFS; and the health state of a computer are all valid examples of a claim. An entity can contain more than one claim, and any combination of those claims can be used to authorize access to resources.  
extends authorization identity beyond using the SID for identity and allows administrators to configure authorization based on claims issued in Active Directory.  

# Types of Claims
Windows Server 2012 introduces three new types of claims: user, device, and transformation claim types.  

- User Claim  
A user claim is information provided by a DC about a user.

- Device Claim  
A device claim is information provided by a DC about a device represented by a computer account in Active Directory. A
Transformation Claim

- A transformation claim   
is a claim issued by a domain controller through a claim transformation policy. 

# Claim Data Types
Claims, like Active Directory attributes, are strongly typed to hold specific information. This is important because Windows evaluates claims through one or more Boolean expressions.   
Boolean expressions are expressions that have a left value, an operator (an equal sign or greater than sign), and a right value. For Windows to correctly evaluate the expression, values on either side of the operand must be of the same or compatible data type.

##Table 1 Claim Data Types

| Claim data type | Usage description |
| :---: | :---: |
| Boolean | An integer-based claim that represents true and false values|
| Multi-valued String | A claim that contains one or more string values |
| Multi-valued Unsigned Integer | A claim that contains one or more positive integer values|
| Security Identifier| A claim that contains one or more security identifiers|
| String| A claim that contains literal alpha-numeric characters |
| Unsigned Integer| A claim that contains a positive numerical value|

# Claim information in the PAC
During TGT creation, the domain controller retrieves the claim type information from Active Directory, maps the claim type's source value to a claim for the security principal, and includes the claim information in the PAC. The KDC also includes the Claims Valid security identifier in the PAC to indicate the claims included in the PAC.  

# Kerberos Armoring (FAST)

Kerberos armoring, or Flexible Authentication Secure Tunneling (FAST) as defined in [RFC 6113](https://www.rfc-editor.org/rfc/rfc6113.html).  
FAST uses the computer's TGT to armor the user's AS messages . This protected channel increases security against network monitoring and KDC Kerberos error spoofing.