# 21V SCC/IDO BC Escalation Process

> Source: OneNote — 21V team SCC/IDO BC escalation process
> Status: draft (pending SYNTHESIZE review)

## Overview

Starting from 5/6/2024, SCC/IDO topics transferred to 21V VM+SCIM team from 21V MW team.

## Customer Case Creation

- Portal: https://portal.partner.microsoftonline.cn/Support/SupportOverviewStatic.aspx
- Redirects to: https://officesupport.azure.cn/en-US/support/support-o365
- Select O365 IDO or SCC topic

## SAP Configuration

| Topic | SAP Path |
|-------|----------|
| SCC (Purview Compliance) | Security > China 21Vianet > China 21Vianet Office 365 Microsoft Purview Compliance |
| IDO (Identity) | Microsoft 365 > China 21Vianet Microsoft 365 Identity |

**Critical**: Always change SAP before transferring case between MW and Mooncake queues. Direct transfer without SAP change causes VDM profile to become inactive.

## Escalation Flow

1. 21V SE checks with CSS in chat group "21V Escalation Review - SCC/IDO"
2. 21V case reviewed by 21V SME first, tracked in tracking table
3. Regularly shared with CSS TA in weekly meeting
4. Once CSS approves, raise case using escalation template

## Escalation Template

**Case Title Format**: Company name + 21V Case ID + Customer type + Topic + Title

**Issue Description must include**:
- Issue description (orgid, subid, tenant ID)
- Logs collected (if any)
- Troubleshooting done
- Why escalation needed
- Working hour + Escalation reviewed by

**Additional for Sev A**:
- Business Impact
- Number of impacted tenants/users
- VIP users impacted?
- New project/deployment blocked?
- Business Justification (CFL/PSI qualification required)

## 21V Ops Team Escalation

For certain operations that go through 21V Ops Team:
1. 21V SE collects related info
2. Escalate case to CSS
3. CSS raises ICM to 21V Ops team

**Applicable scenarios**: Sign-in log/audit log, Domain removal, Quota increase

## Contacts

- 21V SME handling SCC/IDO: lv.lei@oe.21vianet.com
- BC Escalation TA: Chuchu Lin
