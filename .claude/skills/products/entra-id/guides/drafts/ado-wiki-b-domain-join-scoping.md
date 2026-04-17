---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Join/Workflow: Domain Join: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Join%2FWorkflow%3A%20Domain%20Join%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Join: Scoping Questions

**Summary**: Scoping framework for domain join failure cases. Use these questions to identify the specific issue and narrow down troubleshooting.

## What

- Are you getting a specific error message when the domain join fails?
- Are you able to join any client to the domain?
- Does the computer account of the computer to join exist in the domain already?
- Are you trying this domain join after a recent unjoin operation from the same host?
- What account are you using to join the machine? How about another account? Is it a domain admin account?
- Operating System:
  - What is the operating system of the client that is failing to join the domain?
  - What is the operating system of the domain controller?
- Are you using the DNS (Domain Name System) domain name or the NetBIOS domain name of the domain?
- Is the name resolution working fine for the domain name?

## Where

- Active Directory (AD) Site-related:
  - Where are the affected machines located? In a specific site/subnet, or across multiple sites/subnets?
  - Is there at least one Domain Controller (DC) in the same site as the clients attempting to join the domain? How many?
  - Is there any firewall between the affected machines and the DCs?
- Are you using a Read-Only Domain Controller (RODC) to process the domain join?
  - Is this RODC placed in a DMZ (Demilitarized Zone) environment?

## When

- When did the problem start?
- Was there any change prior to the problem beginning?
