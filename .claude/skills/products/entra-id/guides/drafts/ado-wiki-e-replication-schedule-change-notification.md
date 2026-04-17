---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: AD Replication appears slow or is delayed/Replication Schedule"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20AD%20Replication%20appears%20slow%20or%20is%20delayed%2FReplication%20Schedule"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423208&Instance=423208&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423208&Instance=423208&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Domain controller notification of changes

Replication within a site occurs as a response to changes. The source domain controller stores a `repsTo` attribute on its NTDS Settings object, listing all servers in the same site that pull replication from it. When a change occurs, the source domain controller notifies its destination replication partner, prompting it to request changes. The source domain controller either responds with a replication operation or places the request in a queue if requests are pending. Replication occurs one request at a time until all requests in the queue are processed.

**Note:**  
Replication between sites occurs according to a schedule, where the destination requests changes at the specified time. By default, change notification is not enabled on site links.

## Notification delay values

When a change occurs on a domain controller within a site, two configurable intervals determine the delay between the change and subsequent events:
- **Initial notification delay:** The delay between the change to an attribute and notification of the first partner. This interval staggers network traffic caused by intrasite replication. When a domain controller makes a change (originating or replicated) to a directory partition, it starts the timer for the interval. When the timer expires, the domain controller begins to notify its replication partners (for that directory partition and within its site) that it has changes.
- **Subsequent notification delay:** The delay between notification of the first partner and notification of each subsequent partner. A domain controller does not notify all of its replication partners at one time. By delaying between notifications, the domain controller distributes the load of responding to replication requests from its partners.

The storage location and default values for the initial and subsequent notification delay intervals vary depending on the version of the operating system (Windows Server 2003 or Windows 2000 Server) running on the domain controller and whether the domain controller has been upgraded. Application of notification delay values is also potentially affected by their default status and by the forest functional level.

## Storage of intrasite notification delay values

On a domain controller running Windows Server 2003, intrasite notification delay values are specific to each directory partition and are stored in two attributes of the cross-reference object for each directory partition.

### Windows Server 2003 storage of notification delay values

On domain controllers running Windows Server 2003, the attributes that store the change notification values are located on each cross-reference object in the Partitions container within the configuration directory partition:
- The value for initial change notification delay is stored in the `msDS-Replication-Notify-First-DSA-Delay` attribute.
  - The default value is 15 seconds.
- The value for subsequent notification delay is stored in the `msDS-Replication-Notify-Subsequent-DSA-Delay` attribute.
  - The default value is 3 seconds.

These attributes do not exist in Windows 2000 Server.

Although the attribute values are present on all domain controllers running Windows Server 2003, the default values of 15 seconds for initial notification delay and 3 seconds for subsequent notification delay are in effect only under the conditions described in Application of notification delay values by domain controllers later in this section.

### Windows 2000 Server storage of notification delay values

On domain controllers running Windows 2000 Server, intrasite notification delay values affect all directory partitions and are stored in registry entries on each domain controller. The registry entries are as follows:
- The value for the delay before the first change notification is stored in the `Replicator notify pause after modify (secs)` entry in `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters`.
  - The default value is 300 seconds.
- The value for the delay before each subsequent change notification is stored in the `Replicator notify pause between DSAs (secs)` entry in `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters`.
  - The default value is 30 seconds.

## Effect of upgrade and forest functional level on registry notification delay values

Notification delay values for first and subsequent change notification are preserved as registry settings during upgrades from Windows 2000 Server to Windows Server 2003.

Raising the forest functional level to Windows Server 2003 Interim or Windows Server 2003 affects notification delay values for first and subsequent change notification, as follows:
- If a registry entry has the Windows 2000 Server default value of 300 seconds for initial notification delay or 30 seconds for subsequent notification delay at the time the forest functional level is raised, the registry entry that has the default value is removed and the Windows Server 2003 default value takes effect on the respective attribute of each cross-reference object.
- If a registry entry has a nondefault value, the registry value is preserved.

**Note:**  
One or both notification delay registry entries can be added to the registry to override the cross-reference values if needed to control notification by a specific domain controller running Windows Server 2003.

## Application of notification delay values by domain controllers

To accommodate both the registry and cross-reference object locations of notification delay information, the process that is used to determine which change notification delay values to apply favors the settings in the registry if any exist. When replication partners send notification of changes, notification delay values are checked according to the operating systems running on the partners, as follows:
- **Windows Server 2003 only:**
  - Check the registry for the presence of initial and subsequent notification delay values and use those values if they exist.
  - If no registry values exist, check the cross-reference object for the directory partition to which the change has occurred. If values are set, use those values.
  - Otherwise, use the default values of 15 seconds for initial notification delay and 3 seconds for subsequent notification delay.
- **Windows Server 2003 and Windows 2000 Server:**
  - Check the registry for the presence of registry values. If a value is set for an entry, use the value that is set for all relevant directory partitions.
  - If no value is set on a registry entry (the default is in effect), use the respective default values of 300 seconds for initial notification delay and 30 seconds for subsequent notification delay.

From:  
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc772726(v=ws.10)?redirectedfrom=MSDN

# Enable change notifications between sites  how and why?

Hello all, hope you are doing great. Today, I wanted to write a little about change notification. Why, you ask? Simply because one of my customers had a number of questions on what it is, why its there, and what can be done to enable it for site links.

So, I will try to answer the three questions here.

First, what is change notification? Change notification is the interval between an originating update on a domain controller and notification of this change to its partners. When this interval elapses, the domain controller initiates a notification to each intrasite replication partner that it has changes that need to be propagated. Another configurable parameter determines the number of seconds to pause between notifications to other partners if any. This parameter prevents simultaneous replies by the replication partners.

There are two values for the interval  one for the first partner and another for the subsequent partners. When a change is made on a domain controllers Active Directory database, before the change is replicated, the domain controller waits for a specific period before sending the change notification to its first partner and then waits for another period before sending the change notification to another partner. This process continues until all partners are notified.

For intrasite replication partners, a domain controller waits 15 seconds (300 in Windows 2000) before notifying its first replication partner and then another 3 seconds (30 in Windows 2000) before sending this change notification to subsequent partners. These intervals can be modified by the below DWORD values in the registry key:

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\NTDS\Parameters
Replicator notify pause after modify (secs)
Replicator notify pause between DSAs (secs)
```

These DWORD values control how long to wait before sending the change notification after a modify operation on a domain controller to its first partner and then all subsequent partners in the same site. But what about my domain controllers in other sites? We know that replication honors replication intervals set on the site link between two sites, and the minimum interval that can be set via the AD Sites and Services snap-in is 15 minutes. What if your environment can afford to enable these change notifications between your sites or specific sites because you have a large amount of bandwidth? For this, you can enable change notifications between sites as well. To do this:

1. Open ADSIEdit.msc.
2. In ADSI Edit, expand the Configuration container.
3. Expand Sites, navigate to the Inter-Site Transports container, and select `CN=IP`.

**Note:** You cannot enable change notification for SMTP links.

4. Right-click the site link object for the sites where you want to enable change notification, such as `CN=DEFAULTSITELINK`, and click Properties.
5. In the Attribute Editor tab, double-click on options.
   - If the Value(s) box shows `<not set>`, type 1.
   - If the Value(s) box contains a value, you must derive the new value by using a Boolean BITWISE-OR calculation on the old value, as follows: `old_value BITWISE-OR 1`. For example, if the value in the Value(s) box is 2, calculate `0010 OR 0001` to equal `0011`. Type the integer value of the result in the Edit Attribute box; for this example, the value is 3.
6. Click OK.

With change notification enabled between sites, changes propagate to the remote site with the same frequency that they are propagated within a site. The advantage of enabling change notification between sites is little to no conflicts. As a matter of fact, I have yet to see a conflict object (will discuss some other time) between domain controllers in different sites if change notification is enabled between those sites. Plus, if there are a lot of changes being made, these changes will not be queued up as they will be replicated with the same frequency as the domain controllers in the domain controllers own site. What about disadvantages? Is there one? Well sure, its a possible and potential replication storm as all the domain controllers are part of the change notification intervals.

But what about compression? Replication within a site for Active Directory is not compressed, while in remote sites, replication data is always compressed to take advantage of the low-speed links and intervals set between them. So if you are one of those environments that are enjoying the benefits of enabling change notification between sites and would like to replicate data uncompressed vs. compressed, then here is another tip.

The value of the Options attribute that we modified above, if the value is 1, then change notification is enabled with compression; and if you change the value to 5, then change notification is enabled without compression.