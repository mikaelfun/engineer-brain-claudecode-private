---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Database and DC Boot Failures/Workflow: AD Database: Growth/DB Growth: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414748"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414748&Instance=414748&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414748&Instance=414748&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

# Scoping
## Typical Scenario's and customer cases ask the following
There are 4 common scenario's when you might get a customer SR on this topic.

- Why is my DIT Big / what is contributing to size?
- Why is DC1 DIT bigger than others? (comparison scenario)
- Why is my DIT growing so fast?
- Predicting growth / e.g. how much will my DIT grow if I enable Recycle bin?

Use the following scoping questions to understand the issue:


## What
- What is the OS of the DC? (See known issue with 2008 R2 and earlier systems) # would we want to mention WS08 R2 RTM at all? #
- What is the approximate object count per domain?
- What is the size of the DB? What are the sizes of similar DCs database?
- What problem is the growth causing?

## When
- Is the growth in size unexpected /recent?
- If recent: What AD related changes have occurred recently?
- Is it still growing regularly? What is the rate of growth per day / week?
- Or did the increase in size occur over time?

## Where 
- Are the size concerns for one DC or do all have large databases?

##Extent
- Does Credential Roaming Group Policy setting is enabled? (The vast majority of the cases, last years are related to "Credential Roaming" known issue. See below known issue )
- How many other domains are in the environment?
- Is the DC a DNS server?

## Is AD Recycle Bin enabled?
- AD Recycle bin effectively doubles how long deleted objects will be retained in the database
  - The garbage collection process will remove them after deleted object lifetime + tombstone lifetime expires
  - The space freed up by the garbage collection process is not reclaimed by the file system until you perform an offline defrag.

## What is the Tombstone Lifetime of the forest?
- Tombstoned objects will be retained for the lifetime of TSL --meaning if a large amount of objects are deleted and the TSL is 180 days, the objects will persist in the database for 180 days. (without Recycle Bin enabled, 360 days with recycle bin enabled)
  - TSL of 180 without Recycle bin: objects persist in DB for 180 days
  - TSL of 180 with Recycle bin: objects persist in DB for 180*2 = 360 days