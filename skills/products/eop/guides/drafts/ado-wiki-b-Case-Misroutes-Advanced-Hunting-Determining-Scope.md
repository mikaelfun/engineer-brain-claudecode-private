---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Advanced Hunting: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Advanced%20Hunting%3A%20Determining%20Scope"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Case Misroutes: Advanced Hunting — Determining Scope

**SAP:** Multiple

## Source team owns the case

The source team must own the case if data is missing or incorrect.

## How to determine the source team

Figure out what table name is being used — you can see this in some queries on the first line where the table is called.

**General MDO Scope:**
Anything regarding threat hunting along emails. You can see the table list on the right-hand side when in Advanced Hunting. Check the internal documentation below.

## Internal Documentation / Resource

Once you have the table name or even just some hints about what the customer wants to find using threat hunting, consult the internal article below to find out what team needs to have ownership over the case:

[Support Boundaries — Advanced Hunting](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/11532/-Support-Boundaries-Advanced-Hunting)

## Contributors

**Tara Doherty** — taradohery@microsoft.com  
**Sandra Ugwu** — sandraugwu@microsoft.com
