---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/[Procedure] - MDC SME & PG (Engineering) lookup escalation path"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/[Procedure]%20-%20MDC%20SME%20%26%20PG%20(Engineering)%20lookup%20escalation%20path"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**MDC SME & PG (Engineering) lookup escalation path**

**Section/ Landing Page Description**
[[_TOC_]]

# IcM paths
---
Refer to [MDC Area of Ownership](/Defender-for-Cloud/MDC-Escalations-and-procedures/MDC-Area-of-Ownership) for updated CRIs queuest.

# Microsoft Defender for Cloud feature SME and PG (Engineering) teams contacts
---
##Maintaining their own list

| Team | Link | Features |Default IcM|
| ---  | ---- | ----    | ---|
| PM wiki |[Who owns what?](https://msazure.visualstudio.com/One/_wiki/wikis/MDC%20PM%20Wiki/629077/Who-owns-what-)| horizontal | -|
| **Defenders**| - [Defender for CSPM on Eng Hub - Areas of ownership](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/cloud-and-enterprise-security-cesec/microsoft-defender-for-cloud/defender-for-cspm/mdc-defenders-wiki/livesite/defenders-areas-of-ownership/defenders-areas-of-ownership-for-icm-copilot-automation) <br> <br>- More relevant list for the Automatic triage: [Defender for CSPM/Defenders - CRIs](https://microsofteur.sharepoint.com/teams/Defenders-customercases/Lists/Defender%20for%20CSPMDefenders%20%20CRIs/AllItems.aspx?web=1) |Multi-cloud, Workflow automation, Billing & Pricing, Inventory, Secure Score, Governance, Regulatory compliance, Environment Settings (UI), Recommendations (+ Nested) lifecycle, Background jobs (Policy)| Microsoft Defender for Cloud/Defenders - CRIs|
| **Detection** | [Detection areas of ownership](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Detection/524189/Detection-areas-of-ownership)| Security alerts infrastructure, Containers (AKS, ACR) for all clouds | Microsoft Defender for Cloud/RomeDetection|
| **Guardians** | [Horizontals + Areas ownership](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Guardians%20Wiki/206768/Horizontals-Areas-ownership)| Servers plan features|Microsoft Defender for Cloud/Guardians|
| **CESEC platforms**|[CESEC platforms](https://msazure.visualstudio.com/One/_wiki/wikis/CESEC%20Wiki/496955/CESEC-platforms)| General Cloud and Enterprise Security (CESEC) MDC platforms owners| Follow the Integration instructions|
| **Alerts Providers** | [List Of Registered Providers](https://dev.azure.com/msazure/One/_wiki/wikis/Rome%20Detection/37941/List-Of-Registered-Providers)| Security Alerts|According to the list|
| **Container VA** | [Phoenix](https://dev.azure.com/msazure/One/_wiki/wikis/Rome%20Detection/440942/Phoenix) | Container Vulnerability scanning | Microsoft Defender for Cloud/Protectors - Shilo's Team

<br>

## Defender for CSPM  
---
| Area | PM | Dev|
|--- | --- | --- |
| [M65D and SCC migration](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D5f94b733-e059-40f0-82fc-e17c08e4f37d%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301356405%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=1JelVqqbjIsXJW0wyxmbpyyMs4taT0ARf5VcbTOqVKs%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=5f94b733-e059-40f0-82fc-e17c08e4f37d&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")             | @Lior Arviv      | @Arik Noyman     |
| [Applications](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D5b38ef96-2596-414b-bbeb-b63763f9aec2%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301370920%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=ijySYV62aSPRZ99rGifPqg8FJun3k1YTHf9Dgh%2BeRx0%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=5b38ef96-2596-414b-bbeb-b63763f9aec2&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                     | @Amit Biton      | @Aviram Adiri    |
| [Attack Paths](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D7bb8de09-83be-415a-9455-16e5b13390f3%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301385077%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=22RHPh2IsFQ5tim3njspMy3uQXzdMpi6YbQ%2Fu6Og8co%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=7bb8de09-83be-415a-9455-16e5b13390f3&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                     | @Yael Genut      | @Bar Brownshtein |
| [CIEM](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D51a833ff-ade2-41fb-953d-53fd6e6d4786%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301399073%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=4W7KDptfX3tEOGCyxtddxLSRfcSLQ5rHyNkwqfyOizk%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=51a833ff-ade2-41fb-953d-53fd6e6d4786&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                               | @Tal Rosler      | @Aviram Adiri    |
| [Governance](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D23c88a1b-7cad-43b2-aeb3-fbd1c0c09804%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301414128%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=yMHPnPEHL0XzVTrfFL4CuH1DJmG9SkpLEE9e%2BYQWvak%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=23c88a1b-7cad-43b2-aeb3-fbd1c0c09804&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                       | @Tal Rosler      | @Bar Brownshtein |
| [Internet exposure](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D6adff123-0de1-46eb-ab80-15ef01d4fd2e%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301428924%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=iNOb7PYa0Sx9Pa0xtsBRP8FG9nNAA9x6zQcF7Qpsz%2BY%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=6adff123-0de1-46eb-ab80-15ef01d4fd2e&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                | @Tal Rosler      | @Bar Brownshtein |
| [Management and Security Policies](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D12fbc03d-9cf6-40ff-ab0d-9e4c92a79d02%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301442925%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=HiGI%2BubE9TSBfQFmEtMUJGYrMUShGa0iVAWueqDCBSU%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=12fbc03d-9cf6-40ff-ab0d-9e4c92a79d02&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.") | @Lior Arviv      | @Aviram Adiri    |
| [Recommendations](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D6d50e1ae-042f-483f-9635-be07055ca062%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301457140%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=99%2BVFTuG5O%2B4OOnyalUxf3VY4773gcRWOqqP0IJArCQ%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=6d50e1ae-042f-483f-9635-be07055ca062&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                | @Yael Genut      | @Bar Brownshtein |
| [Regulatory Compliance](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D419e632e-1016-427b-b1cd-3dd5de5ab26b%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301478785%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=mCE5wQYYUDtTfimnCkwVEy7B%2BPGkFrLqMYnNhBKPhoA%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=419e632e-1016-427b-b1cd-3dd5de5ab26b&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")            | @Melvyn Mildiner | @Aviram Adiri    |
| [Secure Score](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3Df57ada77-4dc9-43d3-a639-313b555dfc94%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301493574%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=hF4SpxvXtuhgO2tYnFi47pOF1qIVjtFedqQnGthGVmA%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=f57ada77-4dc9-43d3-a639-313b555dfc94&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                       | @Yael Genut      | @<429BC820-A163-60AD-9C35-F88834B25C12>      |
| [Security Explorer](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3Dad5c09b3-b945-4917-b2bd-73a8fd5b1947%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301507752%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=GcgwxjEubDC2Uy0p1NnyhJ%2FCsliTjt%2BEAPLIdcdsnt4%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=ad5c09b3-b945-4917-b2bd-73a8fd5b1947&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")              | @Or Rapoport     | @Aviram Adiri    |
| [Billing](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D576ff7c2-4e79-406a-ba9d-abe2ea093093%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301521735%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=5Ihi8HP9jarC3fWlPy4y6zCaOyDQiDmPnfJyZUKha8A%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=576ff7c2-4e79-406a-ba9d-abe2ea093093&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                            | @Yotam Atad      | @Daniel Dahan    |
| [Discovery](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3De996d606-3201-4541-8fc3-82ff13236f6b%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301536049%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=a4if8de9C9P4Ei4ZFxTnTQ3O%2BwdEb2lD%2B%2FmU3Ii3PGw%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=e996d606-3201-4541-8fc3-82ff13236f6b&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                    | @Lior Arviv      | @Daniel Dahan    |
| [Environment Health](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D5151b985-2ad5-49bc-9b3d-087c64bd0531%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301550700%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=Rfnf7pYzyo6YfdnKHH2N%2Fb6BAXprwXkuevcWpmTND8s%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=5151b985-2ad5-49bc-9b3d-087c64bd0531&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")               | @Or Rapoport     | @Daniel Dahan    |
| [Integrations](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D2dba21b9-6e52-43c4-9875-825122f677db%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301565089%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=ZhJFg0gOYScDqdN4lWLGvLAoY9w83mGmUF5SEvmzUUI%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=2dba21b9-6e52-43c4-9875-825122f677db&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                       | @Or Rapoport     | @Bar Brownshtein |
| [Ibiza Inventory](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D1980fbbf-77ea-46f4-a45d-f0cf51b8e3b2%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301579487%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=QbByYFxSxq4n0eDrYhLo7ZYpOerFZ2PdKKW7Yx2Clok%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=1980fbbf-77ea-46f4-a45d-f0cf51b8e3b2&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                    | @Or Rapoport     | @Aviram Adiri    |
| [Environment Settings](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D424e9a31-1c52-4b7d-b546-89c726fd5384%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301593578%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=3n1D%2B27ttZ80t78irCiS0sDl3iYjpa9Cw%2BknYO5yBsM%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=424e9a31-1c52-4b7d-b546-89c726fd5384&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")           | @Lior Arviv      | @Nir Sela        |
| [Onboarding and Pricing](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D90e0f64b-94f6-4697-848f-91e15f57bc4a%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301607693%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=0mT1cPfFGlZEvMbK8ZHgG5Eia8aeP1jIQf9oKgUfAQE%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=90e0f64b-94f6-4697-848f-91e15f57bc4a&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")             | @Lior Arviv      | @Nir Sela        |
| [Continus export](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3Dcabae509-9d24-45fd-9b6f-5f7765bfeef9%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301625002%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=ER%2BStEhVhGd87zDkt98FlORJuP4Su5ulEyqHhwwIOak%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=cabae509-9d24-45fd-9b6f-5f7765bfeef9&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")                  | @Or Rapoport     | @Nir Sela        |
| [Workflow automation](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D1c1de124-0152-4822-8b1b-398de1076a0f%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301645578%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=241XbK6r5VioraUXU%2BWzOktC96F2GNbsz4em8hy0ISo%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=1c1de124-0152-4822-8b1b-398de1076a0f&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")              | @Or Rapoport     | @Nir Sela        |
| [Security Contact](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FOne%2F_workitems%2Fcreate%2FEpic%3FtemplateId%3D701ab42f-e958-437f-97ee-f08f789769b5%26ownerId%3D110ff73f-222a-441b-86fc-636517e6a85b&data=05%7C02%7CEli.Sagie%40microsoft.com%7Cdd5480c9d49443efeb5608dcd016f384%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638614044301666180%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&sdata=2xVzN8Uqu91xc6Whtvhg0jM1EIm7r2JD%2B1cUMZuKI%2FM%3D&reserved=0 "Original URL: https://msazure.visualstudio.com/One/_workitems/create/Epic?templateId=701ab42f-e958-437f-97ee-f08f789769b5&ownerId=110ff73f-222a-441b-86fc-636517e6a85b. Click or tap if you trust this link.")               | @Tal Rosler      | @Nir Sela        |


-------------------------
<!--

## Protectors 
| Feature| Documentation|  Feature PM | Feature Dev| IcM Team |
|--------|--------------|------------|------------|----------|
| **Sensitivity discovery** | | Maayan Naaman Rand | Moran Polak | Microsoft Defender for Cloud/Protectors - CRIs |

-------------------------

## Azure Defender for Data (Storage ATP and Databases)
| **Feature**| **Documentation**| **Feature PM** | **Feature Dev**| **IcM Team** |
|--------|--------------|--------|------------|------------|
| **Defender for Storage** |[Storage ATP Alerts](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2220/-TSG-Storage-ATP-Alerts)|    Eitan Bremler | Haim Bendanan| Microsoft Defender for Cloud/Azure Storage Threat Detection|
| **Defender for Cosmos DB** | |  Eitan Bremler | Haim Bendanan |Microsoft Defender for Cloud/CosmosDB Threat Detection 
| **Anti Malware for Storage** | | Eitan Bremler, Lior Tsalovich | Noam Hershtig, Arieh Bibliowitz, Yoav Frandzel |
| **SQL ATP** |[Engineering Hub](https://aka.ms/sql-atp)|  Ido Keshet | Tomer Rotstein | [Azure SQL DB\SQL ATP](https://portal.microsofticm.com/imp/v3/oncall/current?serviceId=10040&teamIds=44908&scheduleType=current&shiftType=current&viewType=1) |
| **SQL Vulnerability Assessment** || Catalin Esanu| Assaf Akrabi | Azure SQL DB\Vulnerability Assessment |
| **Alerts Experience** |  Michael Makhlevich | Shai Blum | Microsoft Defender for Cloud/AscAccelerator| ASC Accelerator
| **Sensitivity classifications (Purview)** | | ~~David Trigano~~ | Shai Blum | Microsoft Defender for Cloud/AscAccelerator|

---

## Under Haim Bendanan team
- Microsoft Defender for Cloud/Defender for Storage - ATP
- Microsoft Defender for Cloud/Microsoft Defender for Key Vault
- Microsoft Defender for Cloud/Microsoft Defender for Cosmos DB
- Microsoft Defender for Cloud/Defender for ARM and DNS


<br>
   July 2022 [Data Security re-org update](onenote:https://microsoft.sharepoint.com/teams/Azure_Cyber_Security/Shared%20Documents/Support/Microsoft%20Defender%20for%20Cloud%20(MDC)%20CSS/MDC%20PG%20Updates.one#Reorg%20Data%20Security%20updates&section-id={A69035F5-43B0-4F9B-ACB7-6A6D6EB6BCE3}&page-id={47E89AEF-46DE-475E-9A9B-E21910DA8FC1}&end):

:::mermaid
flowchart LR
subgraph Microsoft Defender for Data
        subgraph Yoav Frandzel
            direction LR
            Antimalware_for_Azure_Storage[Antimalware for Azure Storage]
            Antimalware_for_AWS_S3[Antimalware for AWS S3]
        end
        subgraph Haim Bendanan
            direction LR
            Defender_for_Azure_Storage[Defender for Azure Storage]
            Defender_for_Azure_CosmosDB[Defender for Azure CosmosDB]
        end
        subgraph Shai Blum
            direction LR
            Defender_for_AWS_S3[Defender for AWS S3]
        end
        subgraph Tomer Rotstein - Assaf Akrabi
            direction LR
            Defender_for_Azure_SQL[Defender for Azure SQL]
            Defender_for_AWS_RDS[Defender for AWS RDS]
        end
end
:::

![TSG-Image-22.png](/.attachments/TSG-Image-22-ddc06460-7b79-4b82-8a34-f1d966022066.png =x320)

## **ASM**
| **Feature**| **Documentation**| **Feature PM**| **Feature Dev**| **IcM Team** |
|---|---|---|---|---|
| **AUOMS Linux agent** |[AUOMS Workflow](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Security%20Center%20CSS%20wiki/1938/AUOMS-Workflow)| Michael Romanchuk | Tad Glines | Azure Security Monitoring (Engineering)\ASM-Dev |
| **Endpoint Protection / AM solution (Dev)**| [ASM Support Request Workflow](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FASMDocs%2F_wiki%2Fwikis%2FASMDocs.wiki%2F65129%2FExternal-Customer-Support-Request-Workflow&data=04%7C01%7CEli.Sagie%40microsoft.com%7Caaa3b3ba30b54a7b9c9108d879e1b619%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637393357630478419%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=XMKDYMSepvHRB8J1Ge947%2BLbuq7vJNM2Bf8GKvR2NLU%3D&reserved=0)�  |Rakesh Narayan| Phil Lang| Azure Security Monitoring (Engineering)\ASM-Dev�<br>[ICM template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j1yZS2) |  
| **Window Baseline**| [ASM Support Request Workflow](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FASMDocs%2F_wiki%2Fwikis%2FASMDocs.wiki%2F65129%2FExternal-Customer-Support-Request-Workflow&data=04%7C01%7CEli.Sagie%40microsoft.com%7Caaa3b3ba30b54a7b9c9108d879e1b619%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637393357630478419%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=XMKDYMSepvHRB8J1Ge947%2BLbuq7vJNM2Bf8GKvR2NLU%3D&reserved=0)�|  Guruprasad Venkatesha | Ben Schwarz      | AzSec SLAM Reporting/ASC Baseline Content Customer Support <br> [ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T1I121) |  
| **Linux Baseline**| �[ASM Support Request Workflow](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FASMDocs%2F_wiki%2Fwikis%2FASMDocs.wiki%2F65129%2FExternal-Customer-Support-Request-Workflow&data=04%7C01%7CEli.Sagie%40microsoft.com%7Caaa3b3ba30b54a7b9c9108d879e1b619%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637393357630478419%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=XMKDYMSepvHRB8J1Ge947%2BLbuq7vJNM2Bf8GKvR2NLU%3D&reserved=0)�|  Guruprasad Venkatesha | Tad Glines , Seth Rait| AzSec SLAM Reporting/ASC Baseline Content Customer Support <br> [ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T1I121)|  
| **Docker Baseline**| [ASM Support Request Workflow](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmsazure.visualstudio.com%2FASMDocs%2F_wiki%2Fwikis%2FASMDocs.wiki%2F65129%2FExternal-Customer-Support-Request-Workflow&data=04%7C01%7CEli.Sagie%40microsoft.com%7Caaa3b3ba30b54a7b9c9108d879e1b619%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637393357630478419%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=XMKDYMSepvHRB8J1Ge947%2BLbuq7vJNM2Bf8GKvR2NLU%3D&reserved=0)�|  Guruprasad Venkatesha | Tad Glines ,Seth Rait   | AzSec SLAM Reporting/ASC Baseline Content Customer Support�<br>[ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T1I121)|  


<br>
-->

-------------------------

## Other ownership tables
| Team/Area | Link | Comments|
| ---- | ---- | ---- |
|Multi-Cloud| [Scenario & Platform ownership](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Shared%20Wiki/171019/Scenario-Platform-ownership)| Contacts only, not for escalations|
| **API** | [ASC API Ownership](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Shared%20Wiki/167195/ASC-API-Ownership)
| **Sentinel** | [Sentinel SME & Dev Lookup and escalation path](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Sentinel%20CSS%20wiki/2014/Sentinel-SME-Dev-lookup-escalation-path)|

<br>


-------------------------
## Partners
| Feature| Notes| EEE| Feature PM | Feature Dev| Escalation Path |
|--------|--------------|----|------------|------------|-----------------|
|**ACR VA Findings investigation**|By **SHA Intel**|Raj Jhanwar |Swati Kulkarni|Vulnerability Scanning and Analytics/SHA Intel|
| **IoT** | | Yair Abelson| Kineret Lowy, Dolev Zemer| Idan Perkal | Azure Security for IoT/ARIoT - Azure IoT Security |
|**Log Analytics**||Tzachi Elkabatz ; Jose Constantino  |||[Escalating to Azure Log Analytics](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/23949/Escalating-to-the-Azure-Log-Analytics-product-group)|
|**Key vault**| |||azurekeyvault@microsoft.com|[SIPS ML Detections/SIPS ML (IDML) CRIs](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w3E2o3) (No on-call!) <br> SIPS ML Detections/SIPS ML Dev Team (including on-call)
|**Azure Automation**|[Automation Escalation](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/23864/Product-Team-Escalation)||||[Automation Escalation](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/23864/Product-Team-Escalation)|
|**MDE**  (Microsoft Defender for Endpoint, aka MDATP)||Amir Schindler, Alon Sharvit|Yaniv Kravitz||Microsoft Defender for Endpoint - Shared/WCDPRDCSS|
| **Azure Advisor**| |||Mudit Maheshwari <mmahesh@microsoft.com>| Azure Advisor/Azure Advisor |
| **MEO**|MDC Email engine||||Microsoft Email Orchestrator (formerly AEO)/MEO Triage|

<br>

--------------------------
## MDC CSS contacts

|**Role**|**Name**|**Comment**|**Backup**|
|--|--|--|--|
|**EEE**|Eli Sagie| Global MDC Embedded Escalations Engineer | below TA's |
|**EEE**|Francisco Prelhaz| EMEA Regions | TAs |
|**EEE**| Oscar Avila Madriz | US Regions | TAs |
|**TA**| Steve Poe | US Regions ||
|**Service TA**| Eddie Lourinho | EMEA Regions ||
|**TA**| Hekmat Abuzahrah | EMEA Regions ||
|**TA**| Naser Mohammed | IST Regions ||
|**TA**| Yohei Ichimura | Japan ||
|**PTA**| Pedro Manso | EMEA Regions ||

<br>

-------------------------

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
