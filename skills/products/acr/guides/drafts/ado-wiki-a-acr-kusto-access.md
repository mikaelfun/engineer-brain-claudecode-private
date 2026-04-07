---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Kusto/ACR Kusto Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FKusto%2FACR%20Kusto%20Access"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Kusto Access

[[_TOC_]]

The Azure Container Registry team is changing how you get access to our Kusto cluster at `acr.kusto.windows.net`. Your access may be impacted.

## Background

The Azure Container Registry team currently maintains an idweb group, ôACR Kusto Readersö, which provides access to our Kusto clusters. As the product and our extended team has grown, it has gotten harder for us to maintain this group to both allow access to those who need it, yet limiting access to those who no longer need such access

We will migrate everyone to a MyAccess group, ôACR Kusto Accessö, which provide us the ability to more closely review who has access and expire users out over time as access is no longer needed

## When will this happen?

For any new people that need access, as of today, please advise them to gain access by joining ôACR Kusto Accessö in MyAccess

The access switchover is scheduled to happen on Wednesday October 14, 14:00 PDT / 21:00 UTC

We do not expect there to be any interruptions to your access, but as with any migration, there may be some unforeseen things that can happen. If you find your access interrupted, please reach out to us through your usual channels, or IM jasonpa directly

## Action required

If you donÆt know what ACR is / you donÆt know why you had access in the first place / you no longer need access, you can safely ignore this and any future emails asking you to renew access. Your access will automatically expire after a couple of months

### ACR dev team

No action is required. Your access will be maintained through the team standard access groups

### ACR CSS team, partner teams, and other stakeholders

Check that you recently got an email from MyAccess Notifications looking like the following. You will be on the Cc: line

If you received this email, it means that your access will not be interrupted. Over the next few months, your access will come up for renewal, and you will receive an email asking you to renew your access in <https://myaccess>

Please note: a number of emails stated ôAccess request failedö. I (Jason Pang) have manually reviewed all of those, and they were, in fact, successful

![Access request email header](/.attachments/access_request-4f42a65e-c864-46bc-bba9-9987fa0ab907.png)

![Example access request completed email](/.attachments/access_request_complete-b248ecd1-cee0-4f3b-a09e-4dd59e1a3d16.png)

If you did not receive such an email, please go to <https://myaccess> and request access to project ôACR Kusto Accessö today.

![Access requet flow in MyAccess](/.attachments/request_access-8be71c6f-e048-465a-a9aa-e60c4b96e764.png)

## Fairfax Access

* Kusto Cluster Connection : `<https://acrff.kusto.usgovcloudapi.net>`

## Mooncake Access

* Kusto Cluster Connection : `<https://acrmc2.chinaeast2.kusto.chinacloudapi.cn>`

### Note: ItÆs important that Security is set to: Client Security: dSTS-Federated

## Questions?

Please reach out to <jasonpa@microsoft.com> or <Krater-Admins@microsoft.com>

## Owner and Contributors

**Owner:** Fabian Gonzalez Carrillo <Fabian.Gonzalez@microsoft.com>
**Contributors:**

- Fabian Gonzalez Carrillo <Fabian.Gonzalez@microsoft.com>
