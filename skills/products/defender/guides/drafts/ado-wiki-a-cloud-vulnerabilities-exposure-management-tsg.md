---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/VA Platform/[TSG] - Cloud Vulnerabilities in Exposure Management"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FNext-Gen%20-%20Defender%20for%20Cloud%2FVA%20Platform%2F%5BTSG%5D%20-%20Cloud%20Vulnerabilities%20in%20Exposure%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cloud Vulnerabilities in Exposure Management

## Overview

The **Cloud Vulnerabilities in Exposure Management** experience is part of the broader initiative to bring **Defender for Cloud** into the **Microsoft Defender portal**. This transition introduces:
- **Unified VA recommendations model** across all resource types and clouds.
- **Flattened recommendation structure**: multiple VA recommendations per resource based on vulnerable software.
- **New experiences in Defender portal**: CVE inventory, VA dashboard, and vulnerabilities/recommendations tabs.

### Key Changes

- **Old VA recommendations model**: Separate recommendation concept per resource type, cloud and scanning engine. One recommendation per resource.
- **New VA recommendations model**: Unified format for all VA recommendations. Each vulnerable software generates its own recommendation. Applies to both Azure and Defender portals.

### Defender Portal Tabs
- **Devices tab**: Machines covered by the M365 suite (Defender for Endpoint, MDVM etc).
- **Cloud tab**: All cloud resources (including cloud machines).
  > Machines may appear in both tabs with slight result differences due to different scanner engines and separate pricing & coverage models.

## Troubleshooting Scenarios

### 1. Devices tab vs Cloud tab misalignment
**Symptom:** Customer reports missing resource in one tab / Different results in each tab.
**Investigation:**
- Check coverage differences (MDE vs cloud VA)
- Windows workstations are not fully covered in MDC
- Agentless vs agent results might differ
**Resolution:** Usually by design. Explain design differences.

### 2. Numbers dont align (Same experience)
**Symptom:** Misaligned counts across different views of the same experience, or Azure portal vs Defender portal.
**Investigation:** Confirm which experience shows discrepancy to identify correct Eng. team.
**Escalation:** VA platform team / Recommendations platform team

### 3. CVEs visible but no VA recommendations
**Symptom:** Missing VA recommendations on asset while there are CVEs (or vice versa).
**Investigation:**
- Use VA investigation dashboard
- Verify actual amount of sent VA recommendations (0 = resource truly non-vulnerable)
- If recommendations sent but not visible -> Recommendations platform team
- If not sent/incomplete -> VA platform team

### 4. UI component not working (filters, sorting etc.)
**Symptom:** Broken UI behavior.
**Escalation:**
- Recommendations general UI -> Recommendations platform team
- VA extensions -> VA platform team
- Asset development phase extensions -> Kubernetes Containers team
- CVE inventory UI, VA dashboard -> VA platform team

### 5. Experience fails to load in Defender portal
**Symptom:** Page not loading.
**Investigation:**
- Check user permissions for scope (cloud scopes filter)
- Check whether other cloud experiences show similar issues (possible Data Store/Authorization outage)
**Escalation:** General outage -> Data Store/Authorization team; Recommendations grid -> Recommendations platform; CVE/VA dashboard -> VA platform team

### 6. Resource missing VA results entirely
**Symptom:** No VA results at all for the resource.
**Investigation:**
- Use VA investigation dashboard
- Check incoming VA scans; some scan types don't create recommendations by design
- Verify sent recommendations count (0 = truly non-vulnerable)
- Check applied CVE exemptions
**Escalation:** Relevant Eng. team or scanner-specific TSG

### 7. Missing CVEs compared to other tools
**Symptom:** CVE gap vs external tools.
**Investigation:**
- Check MDVM DB for unrecognized CVE (known gap)
- Check customer exemptions
- Most common cause: source VA scanner didn't identify that CVE by design
**Escalation:** VA platform team if data sent but CVE not visible

### 8. VA value still exists on a deleted resource
**Symptom:** VA Recommendations/CVEs remain on deleted resource.
**Investigation:**
- Defender portal: Check cloud asset inventory, escalate with discovery team or VA platform/recommendations team
- Azure portal: Cleanup flow runs every 24 hours; if >2 days since deletion and results persist, escalate

### 9. Special instructions for Kubernetes containers investigation
TBD

## Troubleshooting Dashboard
- [Vulnerabilities experience - CSS investigation](https://dataexplorer.azure.com/dashboards/24216409-65ad-444a-9c73-24b13484128a)
- Cluster: `https://mdcprd.centralus.kusto.windows.net`
- Permissions: MDC-Kusto-Telemetry entitlement

### Resource ID Formats for Dashboard
| Resource type | Cloud | ID type | Format |
|---|---|---|---|
| Servers | Azure | Azure resource id | /subscriptions/{sub}/resourcegroups/{rg}/providers/microsoft.compute/virtualmachines/{vm} |
| Servers | AWS | ARN | arn:aws:ec2:{region}:{accountId}:instance/{instanceId} |
| Servers | GCP | GCP compute instance | //compute.googleapis.com/projects/{proj}/zones/{zone}/instances/{instance} |
| Container Image | Any | Image URI | {registry}/{repo}@sha256:{digest} |
| DevOps | AzureDevOps | Security connector repo id | /subscriptions/{sub}/.../securityConnectors/{conn}/devops/default/azureDevOpsOrgs/{org}/projects/{proj}/repos/{repo} |
| Serverless | Azure | Azure resource id | /subscriptions/{sub}/.../microsoft.web/sites/{name} |
| Serverless | AWS | ARN | arn:aws:lambda:{region}:{accountID}:function:{name} |
| K8s container | Azure | AKS cluster id | /subscriptions/{sub}/.../managedclusters/{cluster} |

## Escalation Matrix
| Team | IcM path | Dedicated TSG |
|---|---|---|
| VA platform team | Defender for CSPM/Defenders - CRIs | Current TSG |
| Servers team | Defender for CSPM/Defenders - CRIs | Agentless scanning VM VA, MDVM TSG |
| Recommendations platform team | Defender for CSPM/Defenders - CRIs | - |
| Kubernetes Containers team | MDC/Protectors-Moran's Team | - |
| Container Images team | MDC/Protectors - Shilo's Team | Containers VA powered by MDVM |
| Data store team | Defender for CSPM/Defenders - CRIs | - |
| MDC Authorization team | Defender for CSPM/Defenders - CRIs | - |

## FAQ
**Is SQL VA part of the new unified VA experience?**
No. VA platform is CVE-based software vulnerabilities. SQL VA has its own type of DB security findings, not CVEs.
