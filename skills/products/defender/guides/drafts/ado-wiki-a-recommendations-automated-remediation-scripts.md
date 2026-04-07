---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/[TSG] - Recommendations automated remediation scripts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2F%5BTSG%5D%20-%20Recommendations%20automated%20remediation%20scripts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Guide for Recommendations automated remediation scripts 
---
<!--  Required: Table of Contents -->
[[_TOC_]] 

## Supported recommendations
---
| AssessmentDisplayName | AssessmentKey | ReleaseState |
|--|--|--|
| Amazon Elasticsearch Service domains should encrypt data sent between nodes | 9b63a099-6c0c-4354-848b-17de1f3c8ae3 | GA |
| Amazon Elasticsearch Service domains should have encryption at rest enabled | cf747c91-14f3-4b30-aafe-eb12c18fd030 | GA |
| Amazon RDS instance should be configured with automatic backup settings | 894259c2-c1d5-47dc-b5c6-b242d5c76fdf | Preview |
| Amazon Redshift clusters should have audit logging enabled | e2a0ec17-447b-44b6-8646-c0b5584b6b0a | GA |
| Amazon Redshift clusters should have automatic snapshots enabled | 7a152832-6600-49d1-89be-82e474190e13 | GA |
| Amazon Redshift clusters should prohibit public access | 7f5ac036-11e1-4cda-89b5-a115b9ae4f72 | GA |
| Amazon Redshift clusters should use enhanced VPC routing | 1ee72ceb-2cb7-4686-84e6-0e1ac1c27241 | GA |
| Amazon Redshift should have automatic upgrades to major versions enabled | 176f9062-64d0-4edd-bb0f-915012a6ef16 | GA |
| Attached EBS volumes should be encrypted at-rest | 0bde343a-0681-4ee2-883a-027cc1e655b8 | GA |
| AWS KMS key automatic rotation is not enabled | 5e4503df-e4f7-4055-a38e-ff8ae44dfd1e | Preview |
| AWS KMS keys should not be unintentionally deleted | 10c59743-84c4-4711-adb7-ba895dc57339 | GA |
| CloudFront distributions should have a default root object configured | 186509dc-f326-415f-b085-4d27f1342849 | GA |
| EBS default encryption should be enabled | 56406d4c-87b4-4aeb-b1cc-7f6312d78e0a | GA |
| EC2 instances should use IMDSv2 | 5ea3248a-8af5-4df3-8e08-f7d1925ea147 | GA |
| EC2 subnets should not automatically assign public IP addresses | ace790eb-39b9-4b4f-b53d-26d0f77d4ab8 | GA |
| Ensure '3625 (trace flag)' database flag for Cloud SQL SQL Server instance is set to 'off' | 631246fb-7192-4709-a0b3-b83e65e6b550 | GA |
| Ensure 'Block Project-wide SSH keys' is enabled for VM instances | 00f8a6a6-cf69-4c11-822e-3ebf4910e545 | GA |
| Ensure 'Enable connecting to serial ports' is not enabled for VM Instance | 7e060336-2c9e-4289-a2a6-8d301bad47bb | GA |
| Ensure 'external scripts enabled' database flag for Cloud SQL SQL Server instance is set to 'off' | 98b8908a-18b9-46ea-8c52-3f8db1da996f | GA |
| Ensure 'log_duration' database flag for Cloud SQL PostgreSQL instance is set to 'on' | 272820a7-06ce-44b3-8318-4ec1f82237dc | GA |
| Ensure 'log_executor_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off' | 19711549-76eb-4f1f-b43b-b1048e66c1f0 | GA |
| Ensure 'log_hostname' database flag for Cloud SQL PostgreSQL instance is set appropriately | 989db7d6-71d5-4928-a9a6-c9ab7b8044e9 | GA |
| Ensure 'log_min_error_statement' database flag for Cloud SQL PostgreSQL instance is set to 'Error' or stricter | 50a1058e-925b-4998-9d93-5eaa8f7021a3 | GA |
| Ensure 'log_parser_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off' | a6efc275-b1c1-4003-8e85-2f30b2eb56e6 | GA |
| Ensure 'log_planner_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off' | 7d87879a-d498-4e61-b552-b34463f87f83 | GA |
| Ensure 'log_statement_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off' | c36e73b7-ee30-4684-a1ad-2b878d2b10bf | GA |
| Ensure 'remote access' database flag for Cloud SQL SQL Server instance is set to 'off' | dddbbe7d-7e32-47d8-b319-39cbb70b8f88 | GA |
| Ensure 'skip_show_database' database flag for Cloud SQL Mysql instance is set to 'on' | 9e5b33de-bcfa-4044-93ce-4937bf8f0bbd | GA |
| Ensure 'user connections' database flag for Cloud SQL SQL Server instance is set as appropriate | 91f55b07-083c-4ec5-a2be-4b52bbc2e2df | GA |
| Ensure API keys are not created for a project | 29ed3416-2035-4d44-986e-0bcbb7de172e | GA |
| Ensure API keys are restricted to only APIs that application needs access | 54d3b0ae-67b3-4fee-9ac4-f6c784b9d16b | GA |
| Ensure API keys are restricted to use by only specified Hosts and Apps | 63e0e2db-70c3-4edc-becf-93961d3156ed | GA |
| Ensure CloudTrail is enabled in all regions | b3d8e09b-83a6-417a-ae1e-3f5b54576965 | GA |
| Ensure Compute instances are launched with Shielded VM enabled  | 1a4b3b3a-7de9-4aa4-a29b-580d59b43f79 | GA |
| Ensure Firewall Rules for instances behind Identity Aware Proxy (IAP) only allow the traffic from Google Cloud Loadbalancer (GCLB) Health Check and Proxy Addresses | 814c3346-91c9-4e70-90b6-985cfd3e0478 | GA |
| Ensure KMS encryption keys are rotated within a period of 90 days | f756937d-b790-4718-8dd7-fa995930c4a1 | GA |
| Ensure legacy networks do not exist for a project | 44995f9b-5963-4a92-8e99-6d68acbc187c | GA |
| Ensure log metric filter and alerts exist for project ownership assignments/changes | f42c20a6-8012-4e1e-bf4d-19b977e8c8d7 | GA |
| Ensure no security groups allow ingress from 0.0.0.0/0 to port 3389 | 79082bbe-34fc-480a-a7fc-3aad94954609 | GA |
| Ensure oslogin is enabled for a Project | 49cb12f0-3dd3-4220-9cfb-5c3fd514a6d8 | GA |
| Ensure oslogin is enabled for all instances | 569ef64e-d7aa-4d7e-aa0b-5b3e045ca2c3 | GA |
| Ensure that Cloud DNS logging is enabled for all VPC networks | c10bad5f-cd86-4ea0-a40c-5d31510da525 | GA |
| Ensure that the Cloud SQL database instance requires all incoming connections to use SSL | 13872d43-aac6-4018-9c89-507b8fe9be54 | GA |
| Ensure that Cloud SQL database instances do not have public IPs | 1658239d-caf7-471d-83c5-2e4c44afdcff | GA |
| Ensure that Cloud Storage bucket is not anonymously or publicly accessible | d8305d96-2aa5-458d-92b7-f8418f5f3328 | GA |
| Ensure that Cloud Storage buckets have uniform bucket-level access enabled | 64b5cdbc-0633-49af-b63d-a9dc90560196 | GA |
| Ensure that instances are not configured to use the default service account | a107c44c-75e4-4607-b1b0-cd5cfcf249e0 | GA |
| Ensure that IP forwarding is not enabled on Instances | 0ba588a6-4539-4e67-bc62-d7b2b51300fb | GA |
| Ensure that Service Account has no Admin privileges | ae77cb8b-0b43-4e86-8b5c-f5afcf95766a | GA |
| Ensure that SSH access is restricted from the internet | 9f88a5b8-2853-4b3f-a4c7-33f225cae99a | GA |
| Ensure that the 'contained database authentication' database flag for Cloud SQL on the SQL Server instance is set to 'off' | 658ce98f-ecf1-4c14-967f-3c4faf130fbf | GA |
| Ensure that the 'cross db ownership chaining' database flag for Cloud SQL SQL Server instance is set to 'off' | 26973a34-79a6-46a0-874f-358c8c00af05 | GA |
| Ensure that the 'local_infile' database flag for a Cloud SQL Mysql instance is set to 'off' | 633a87f4-bd71-45ce-9eca-c6bb8cbe8b21 | GA |
| Ensure that the 'log_checkpoints' database flag for Cloud SQL PostgreSQL instance is set to 'on' | a2404629-0132-4ab3-839e-8389dbe9fe98 | GA |
| Ensure that the 'log_connections' database flag for Cloud SQL PostgreSQL instance is set to 'on' | 4016e27f-a451-4e24-9222-39d7d107ad74 | GA |
| Ensure that the 'log_disconnections' database flag for Cloud SQL PostgreSQL instance is set to 'on' | a86f62be-7402-4797-91dc-8ba2b976cb74 | GA |
| Ensure that the 'log_min_duration_statement' database flag for Cloud SQL PostgreSQL instance is set to '-1' | 1c9e237b-419f-4e73-b43a-94b5863dd73e | GA |
| Ensure that the 'log_min_messages' database flag for Cloud SQL PostgreSQL instance is set appropriately | 492fed4e-1871-4c12-948d-074ee0f07559 | GA |
| Ensure that the 'log_temp_files' database flag for Cloud SQL PostgreSQL instance is set to '0' | 29622fc0-14dc-4d65-a5a8-e9a39ffc4b62 | GA |
| Ensure that the default network does not exist in a project | ea1989f3-de6c-4389-8b6c-c8b9a3df1595 | GA |
| Ensure that the log metric filter and alerts exist for Audit Configuration changes | 34ed4dfb-fc6d-498f-b2b0-d1099704775d | GA |
| Ensure that the log metric filter and alerts exist for Custom Role changes | ba27e90d-311d-409d-8c69-7dfac0a1351c | GA |
| Ensure that the log metric filter and alerts exist for VPC network changes | 59aef38a-19c2-4663-97a7-4c82a98dbab5 | GA |
| Ensure that VPC Flow Logs is enabled for every subnet in a VPC Network | 25631aaa-3866-43ac-860f-22c12bff1a4b | GA |
| Ensure user-managed/external keys for service accounts are rotated every 90 days or less | 0007dd31-9e95-460d-82bd-ae3e9e623161 | GA |
| GuardDuty should be enabled | 4b32e0a4-44a7-4f18-ad92-549f7d219061 | GA |
| Internet-facing virtual machines should be protected with network security groups | 483f12ed-ae23-447e-a2de-a67a10db4353 | GA |
| Management ports should be closed on your virtual machines | bc303248-3d14-44c2-96a0-55f5c326b5fe | GA |
| RDS automatic minor version upgrades should be enabled | d352afac-cebc-4e02-b474-7ef402fb1d65 | GA |
| RDS clusters should have deletion protection enabled | 9e769650-868c-46f5-b8c0-1a8ba12a4c92 | GA |
| RDS databases and clusters should not use a database engine default port | f1736090-65fc-454f-a437-af58fd91ad1e | GA |
| RDS DB clusters should be configured for multiple Availability Zones | cdf441dd-0ab7-4ef2-a643-de12725e5d5d | GA |
| RDS DB Instances should prohibit public access | 72f3b7f1-76b8-4cf5-8da5-4ba5745b512c | GA |
| RDS DB instances should be configured to copy tags to snapshots | fcd891e5-c6a2-41ce-bca6-f49ec582f3ce | GA |
| RDS DB instances should have deletion protection enabled | 8e1f7933-faa9-4379-a9bd-697740dedac8 | GA |
| RDS DB instances should have encryption at rest enabled | bfa7d2aa-f362-11eb-9a03-0242ac130003 | GA |
| RDS snapshots should prohibit public access | f64521fc-a9f1-4d43-b667-8d94b4a202af | GA |
| S3 Block Public Access setting should be enabled at the bucket level | 83f16376-e2dd-487d-b5ee-ba67fef4c5c0 | GA |
| Security groups should not allow ingress from 0.0.0.0/0 to port 22 | e1f4bba6-5f43-4dc5-ab15-f2a9f5807fea | GA |
| Security groups should not allow unrestricted access to ports with high risk | 194fd099-90fa-43e1-8d06-6b4f5138e952 | GA |
| Security groups should only allow unrestricted incoming traffic for authorized ports | 8b328664-f3f1-45ab-976d-f6c66647b3b8 | GA |
| SNS topics should be encrypted at rest using AWS KMS | 90917e06-2781-4857-9d74-9043c6475d03 | GA |
| Unused EC2 EIPs should be removed | 601406b5-110c-41be-ad69-9c5661ba5f7c | GA |
| Unused EC2 security groups should be removed | f065cc7b-f63b-4865-b8ff-4a1292e1a5cb | GA |
| VPC enpoint should not be configured with policy overly permissive to any principal | 0ca6e24c-b113-429c-83e1-38e8c4b91396 | Preview |
| VPC flow logging should be enabled in all VPCs | 3428e584-0fa6-48c0-817e-6d689d7bb879 | GA |
| VPC's default security group should restricts all traffic | 500c4d2e-9baf-4081-b8a8-936ac85771a5 | GA |

## How to use the automated remediation scripts
---

There is no single script that fixes all recommendations. Each recommendation listed in the table above has its own unique remediation script with its own set of remediation steps. The scripts are generated per recommendation and are accessed directly from the Defender for Cloud portal.

If a customer reports that recommendations have been actioned but still reflect in the portal, they likely have not executed the specific remediation script for that recommendation.

### Steps to remediate a recommendation

1. **Navigate to the recommendation** in the Defender for Cloud portal.
2. **Click the "Fix" button** — this generates the automated remediation script specific to that recommendation.
3. **Copy the generated script(s)**.
4. **Follow the remediation steps** provided in the recommendation and execute the script in the appropriate environment.
5. **Repeat for each recommendation** — every recommendation will have its own script and steps.

### Example: "Ensure that Cloud Storage bucket is not anonymously or publicly accessible"

This is just one example. The script and steps will differ for every recommendation.

Clicking **Fix** on this recommendation provides the following script:

```bash
# Remove all the public ACLs
gsutil iam ch -d allUsers:objectViewer gs://<bucket-name>
gsutil iam ch -d allUsers:objectAdmin  gs://<bucket-name>
```

**Breakdown:**

| Command / Parameter | Description |
|--|--|
| `gsutil` | Google Cloud Storage tool |
| `iam ch` | Change permissions |
| `-d` | Delete (remove) a permission |
| `allUsers:objectViewer` | Anyone on the internet can view files |
| `allUsers:objectAdmin` | Anyone on the internet has full control over objects |
| `gs://<bucket-name>` | The target storage bucket |

**Desired outcome:** The bucket is no longer publicly accessible. Only explicitly granted users or service accounts can access it.

> **Important:** There is no universal fix script. Each recommendation in the [supported recommendations table](#supported-recommendations) generates its own script tailored to the specific resource and issue. The customer must click **Fix** on each individual recommendation and follow the remediation steps provided.

<!-- Required: Details required to escalate issues to the Product Group-->
## Additional Information
---

  - **Public Documentation**
    - [Remediate Recommendations - Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/implement-security-recommendations#use-the-automated-remediation-scripts)

---
| Contributor Name | Details | Date(DD/MM/YYYY) |
|--|--|--|
| Eli Sagie | Creator | 20/03/2024|
| Eddie Lourinho | Added guidance on how to use automated remediation scripts | 01/04/2026|

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
