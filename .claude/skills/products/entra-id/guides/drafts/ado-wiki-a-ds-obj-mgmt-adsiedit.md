---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/ADSIEDIT"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/ADSIEDIT"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419595&Instance=419595&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419595&Instance=419595&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   This article explains what ADSIEDIT is and how to use it to manage Active Directory information, including the Domain naming context, Configuration partition, and AD LDS instances. It provides detailed instructions and visuals to guide users through the process.

# What is ADSIEDIT?

ADSIEDIT is similar to the Active Directory Users and Computers snap-in, but provides a much lower-level view of Active Directory information. The most common use for ADSIEDIT is to view and manage objects in the configuration, application naming contexts (NCs) such as DomainDNSZones, and Active Directory Lightweight Directory Services (AD LDS) partitions.

## Usage

Upon starting Adsiedit.msc, you will be presented with the snap-in and be able to connect to one of the three NCs: Domain, Configuration, and Schema:  
![ADSIEDIT snap-in interface](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT.png)

## The "Domain naming context" partition

- The added value when connecting to the "Domain naming context" is that, by default, you will get:
  1. Some additional containers:

![Additional containers](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_1.png)

  2. The "Attribute Editor" tab on Active Directory objects.
  3. The object's "sub-objects" (if any):

 ![Sub-objects](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_2.png)

**Note:** To enjoy the same benefits with the "Active Directory Users and Computers" snap-in, the "Users, contacts, Groups and Computers as containers" and the "Advanced Features" options have to be chosen:  

 ![Advanced Features options](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_3.png)

## Managing and viewing the "Configuration" partition

The most common usage of Adsiedit.msc is managing and viewing the "Configuration" partition, as there is no easy way to manage most of the NC's objects besides using Adsiedit.msc.

**Note:** "CN=Services,CN=Configuration,DC=CONTOSO,DC=COM" sub-containers can be managed from the "Active Directory Sites and Services" snap-in once the "Show Services Node" option is chosen:  

 ![Show Services Node option](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_4.png)

- Connecting to other Application NCs can be easily achieved by navigating to the "Partitions" container, right-clicking the partition, and choosing "New Connection to Naming Context".  

 ![New Connection to Naming Context](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_5.png)

## Connecting to AD LDS instances

ADSIEDIT is the only GUI-based tool to manage AD LDS instances.  

 ![AD LDS instances](/.attachments/UserComputerGroupObjectMgmt/ADSIEDIT_6.png)

**Tip:** To get the AD LDS information required to connect, use the following commands:
```
C:>dsdbutil "list instances" quit 
dsdbutil: list instances 

Instance Name:         Test1 
Long Name:             Test1 
LDAP Port:             50000 
SSL Port:              50001 
Install folder:        C:\Windows 
Database file:         C:\Program Files\Microsoft ADAM\Test1\data\adamntds.dit 
Log folder:            C:\Program Files\Microsoft ADAM\Test1\data 
Service state:         Running 

dsdbutil: quit 

PS C: > (Get-ADRootDSE -Server localhost:50000).namingContexts 
CN=Configuration,CN={B7267F0E-BCDF-4757
```