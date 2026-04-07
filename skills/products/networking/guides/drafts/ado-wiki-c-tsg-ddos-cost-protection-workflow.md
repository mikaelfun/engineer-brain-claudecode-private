---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/TSG: DDoS Cost Protection workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20DDoS%20Cost%20Protection%20workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

As part of the guarantee for DDoS **Network** protection plans, Microsoft offers a guarantee to cover costs of resources impacted by a DDoS attack that the platform could not mitigate.

> As defined in [public documentation](https://learn.microsoft.com/azure/ddos-protection/ddos-protection-overview): 
> "Receive data-transfer and application scale-out service credit for resource costs incurred as a result of documented DDoS attacks."

**Prerequisites**:
- Customer had **DDoS Network Protection** at the time of the attack (DDoS IP Protection does **not** have cost protection guarantee)
- Confirmed DDoS attack occurred

# Workflow

## Step 1: Customer experiences a DDoS attack
Prerequisite: DDoS Network Protection was configured and linked at time of attack. If not configured at time of attack → does **not** qualify for cost protection.

## Step 2: Customer opens SR
Support topic: **Azure\DDOS Protection\Cost protection verification and refund** (or via Billing team collaboration). Treat incoming collabs the same as direct SRs.

## Step 3: VNET SE validates DDoS attack
1. Validate the PIP(s) were under attack using [TSG: DDoS Attack Post-Mortem](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/690195/TSG-DDoS-Attack-Post-Mortem).
2. Verify datapath from impacted PIP(s) to identify affected resources:
   - **Same subscription as SR**: Use [Vulcan](https://aka.ms/VulcanForNetworking) → DDoS Network Plan → Protected Resources sub-blade.
   - **Different subscription**: Ask customer for screenshare to confirm all resources.

## Step 4: VNET SE collabs to Billing team
Engage Billing via collaboration with:
- Impacted resource list with timestamps
- Ask: "Customer experienced DDoS attack and seeking refund under Cost Protection guarantee. Please calculate the refund amount."

Support Topic for Billing: **Azure / Billing / Refund request**

## Step 5: VNET SE engages DDoS PM
Provide: impacted resources list, timeframes, calculated refund amount → DDoS PM via email. Forward approval (with any revisions) back to Billing SE and upload to DTM internal.

## Step 6: Billing SE processes refund
Billing SE processes refund via their process and updates VNET SE.

## Step 7: Update customer and send LQR
Update customer that Cost Protection request has been processed. Send LQR.
Consider connecting with CSAM if there were unprotected resources to minimize future impact (proactive hours evaluation).

# Contributors

* ANP DDoS Team
