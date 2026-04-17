---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/Repadmin | showobjmeta"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/Repadmin%20%7C%20showobjmeta"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419701&Instance=419701&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419701&Instance=419701&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** Repadmin is a powerful tool for troubleshooting Active Directory related issues. This guide provides an overview of using Repadmin to show an object's replication metadata on domain controllers in the environment. This is useful for identifying where changes were made and determining the version of the object and attribute each domain controller has. It is especially helpful in finding domain controllers with outdated information.


## Usage

The most common syntax for this is the following:
```
Repadmin.exe /showobjmeta * CN=UserAccount,OU=OU1,DC=contoso,DC=com
```

This can be broken down as follows:

| **Parameter** | **Meaning** |
|---------------|-------------|
| **/showobjmeta** | This is the flag for Repadmin to start this processing mode. |
| **\*** | Run this command against every domain controller in the forest. |
| **CN=UserAccount,OU=OU1,DC=contoso,DC=com** | The distinguished name of the object you are running this command against. |

If you want to run this command against only a single domain controller, you would use the following:
```
Repadmin /showobjmeta Contoso-DC01 CN=UserAccount,OU=OU1,DC=Contoso,DC=com
```

It is recommended that you output this command to a text file for easier review. This is done by adding `> OutputFile.txt` to the end of the command.

## Example results

Below is an example of results from one section of the output for a user account run against a domain controller named: Contoso-dc02.contoso.com:

 ![Example of Repadmin showobjmeta command output]( /.attachments/UserComputerGroupObjectMgmt/Repadmin_showobjmeta.png)

**Note:** The GUID in the "Originating DSA" column represents that the attribute was last changed on a domain controller that is no longer part of the domain. When a domain controller is removed, the DSA GUID is not removed from the metadata.