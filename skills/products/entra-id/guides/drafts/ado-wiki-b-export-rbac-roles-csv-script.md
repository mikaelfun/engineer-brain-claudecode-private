---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/UI Export Azure RBAC Roles for Resources to CSV powershell script"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FUI%20Export%20Azure%20RBAC%20Roles%20for%20Resources%20to%20CSV%20powershell%20script"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.Managed-Identities
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
This script is for exporting all, all users, all groups, all SPNs, Identity Unknowns or select Users/Groups/SPN RBAC assignments.  

This script can be used together with the AAD Roles Export and Group/Group Membership and Group Attribute export scripts for rebuilding deleted security groups, or dynamic security groups.  These can also be used if a customer accidentally moves or deletes a subscription and needs this information when the subscription is moved back to confirm any AAD or RBAC roles that were established are correct or need rebuilt.

Links to the other 2 scripts will are at the bottom of this page.

1: Get all RBAC Role Assignments (this one)

2: Get All Groups, Group Memberships, Group Assignments (and all attributes to recreate them, displaynames, email address, proxies, etc)

3: Get All AAD Role Assignments

(4. soon to be uploaded (PIM assigned roles, having to convert to Graph))

Additionally:
Using these scripts to export all of a tenants information for "restoring" a User, Group, SPN RBAC Active Roles (Not PIM Eligible) can:
Rebuild quickly an assignment if needed (beyond 30 days type of issue or perm deleted)

Rebuild a user/group/spn quickly with all RBAC and AAD role assignments
Audit Roles: Who has what where: Yes, the portal has this but this give a report that can be compared from the last running or last week, month, year(s)
Audit Groups: Who was in this group last week, month, year (should they be)
Audit Users: (yes PIM has this) but this is an extension to quickly bring up in excel

For this script:
You will need the Powershell Az Module (most of us probably already do)
If not
Open a new powershell window in admin mode:
Install-module -name Az -Force
If you get any errors about install nuget because of TLS run this:  Typically we don�t have that issue: customers may.
PS C:\Users\Administrator>[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 
PS C:\Users\Administrator> install-module powershellget -force


When running from powershell you will need AzureADPreview module installed.
To start these from powershell command prompt you will need to put an **&<space>** before the .\ 

ex: �& ".\UI Export RBAC V6.ps1" or it will not start.

From Explorer, ISE or Visual Studio it will run without needing the &<space>

This was made in the hopes customers will use the script to backup the RBAC assignments (weekly, monthly, etc) and have something to be able to review this information.
It can also be used for customers to quickly review a users, groups, and/or SPN/apps role assignments (possible now via the portal however this is easier)

Running from the directory the file is saved:

**PS C:\users\me\downloads> & ".\UI Export RBAC V6.ps1"**

(or from ISE or explorer right clicking and selecting to open w powershell.)
From Explorer (right click) Run with Powershell

![rbac 1.png](/.attachments/rbac%201-2e408e68-598c-4160-8ca0-0b6262525ca9.png)

UI User and Group RBAC assignments
The script will log the user into Az
Then give them a list of the tenants they can choose to export RBAC Roles.



You will be prompted to sign in
Sign into your account:

![rbac signin.png](/.attachments/rbac%20signin-29426ce4-ce1b-4402-addf-2c70f0999ffa.png)

or get a list of current az domains, you can select 1 or more tenants


![image.png](/.attachments/image-2ea768cb-d324-4c2f-800f-6890ea3acc6b.png)

If you select more than 1 tenant, you will be prompted as each tenant is added (add-azaccount)

![rbac signin.png](/.attachments/rbac%20signin-29426ce4-ce1b-4402-addf-2c70f0999ffa.png)
You will then be prompted which Subscriptions to be scanned.

![image.png](/.attachments/image-ff04376e-793b-41e9-88d0-efdef3a6b355.png)

Next you will be prompted to select a folder to save the files.

Files are saved automatically by "Selection_role_subscription_subid_datetime.csv" so there is no reason to ever worry about overwriting a file as they are timestamped.

![image.png](/.attachments/image-5107cae2-1be5-4a7c-bd5f-38fa71e277a0.png)

You are then given the options to export
 
**All RBAC** � this will export All RBAC assignments in the currently selected Tenant

**All Users** � All User assignments for the tenant are exported

**All Groups** � All Group assignments for the tenant are exported

**All SPN/apps** � All SPN/App assignments for the tenant are exported

**All Unknowns** � All �Identity Unknowns� for the tenant are exported � very useful if a security group is deleted or if a customer deletes/moves a tenant.

Select an Option and hit OK ( Cancel from Any option will exit the script)

![image.png](/.attachments/image-32134916-cbc5-44f1-91d0-420902716bfd.png)



You are then prompted how you want the data sorted (whichever makes viewing easier) by DisplayName, Scope, or RoleDefinitionName.


Select an Option on sort method and hit OK

![rbac sort.png](/.attachments/rbac%20sort-fb1c19ab-7547-4268-a24c-586995b9bc72.png)

Select an Option on sort method and hit OK

For users/groups/SPNs that were deleted they will see the Identity Unknown in the Portal or Unknown ObjectType

This option will give an export of all Unknowns with the Object ID.

Using this export along with any previous exports they admin can find the original ObjectID to determine who that user/groups/spn was to rebuild/recreate it.

**(Identity Unknown/Object was deleted without removing the Role Assignment)** 
Who/what was it:  
Grabbing the Unknown Identity, and a previous exports object ID they can now find everything about that object by searching previous exports and finding the object ID.

![image.png](/.attachments/image-fb2a7f49-011d-4b39-bddb-d204a6e28fde.png)

While scanning the Subscriptions the display will show the progress of which subscription is being scanned at the time
![image.png](/.attachments/image-60881a5b-06ce-49cd-bc2c-a6426754324e.png)

The report can be brought up in Excel and getting the objectID below, and a previous report they can then see (User � 0c33� was john doe and was an owner over these 2 scopes)

The All RBAC and Unknown will show the displayname **_Blank_**

How this can help is if a customer keeps a regular export then can find the object id from a previous report and see who was deleted and what roles they had looking for the object id of the unknown.

Using Excel a customer can quickly see who has what permissions at a specific scope by using the filter in excel 
![image.png](/.attachments/image-f0bd65b2-99f3-46b0-b5bf-c02873441a97.png)



Save the file and remove the .txt extension to run in powershell


[UI Export RBAC V6.ps1.txt](/.attachments/UI%20Export%20RBAC%20V6.ps1-faee2a1b-497d-436a-a764-bb83bd831e26.txt)

Additional Scripts which can be used together to help save needed Azure AD information
Groups/Group Membership/Group Attributes Script
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/471455/Group(s)-Group-Memberships-and-Group-Attributes-CSV-Export

AAD Roles Export to CSV

<A  href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/471461/AAD-Roles-CSV-Export-(All-Groups-Users-Service-Principals)-powershell-script">AAD Roles CSV Export (All, Groups, Users, Service Principals) powershell script - Overview (visualstudio.com)</A>
