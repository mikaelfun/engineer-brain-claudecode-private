---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Test Lab & Subscriptions/W365 Lab using Visual Studio (FTE) Benefit Subscription"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FTest%20Lab%20%26%20Subscriptions%2FW365%20Lab%20using%20Visual%20Studio%20(FTE)%20Benefit%20Subscription"
importDate: "2026-04-05"
type: setup-guide
---

# W365 Lab using Visual Studio (FTE) Benefit Subscription

Guide for setting up a Windows 365 test lab using Microsoft FTE Visual Studio Enterprise subscription ($150/month Azure credit).

## High Level Steps
1. Setup EMS Trial Tenant
2. Get Cloud PC License
3. Bring your own Azure Subscription (Visual Studio Benefit)
4. Networking Setup
5. Domain Controller / DNS / Azure AD Connect
6. Configure On-Premises network connection in MEM
7. Provision a Cloud PC
8. Create Provisioning Policy
9. Access your Cloud PC

## Microsoft E5 Test Tenant
- Navigate to: https://cdx.transform.microsoft.com/my-tenants
- Sign in with MSFT Account (Segment: Enterprise, Role: Specialist Modern Workplace)
- Create Tenant → Microsoft 365 Enterprise Demo Content (1 year)

## Microsoft E3 Trial (alternative)
- https://go.microsoft.com/fwlink/?linkid=2249967

## Windows 365 Trial License
- Follow steps in W365 wiki trial subscription guide

## Visual Studio (FTE) Benefit Subscription Setup
1. Activate at https://my.visualstudio.com/Benefits
2. Invite your MSA (with VS subscription) as guest user to test tenant
3. Accept invitation from email
4. In Azure Portal (as guest user): Subscriptions → Visual Studio Enterprise → Change directory to test tenant
5. Assign test tenant admin as Owner of the subscription
6. Switch to admin account → verify subscription visible

## Notes
- Visual Studio subscription provides $150 monthly Azure Credit
- Costs: Domain Controller VM + network egress
- May need to wait a few minutes after directory change for subscription to appear
