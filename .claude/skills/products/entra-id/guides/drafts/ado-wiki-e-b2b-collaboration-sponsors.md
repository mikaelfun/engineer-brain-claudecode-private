---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/B2B Collaboration Sponsors"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2B%2FB2B%20Collaboration%20Sponsors"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# B2B Collaboration Sponsors

## Feature overview

Organizations need a way to keep track of who is responsible for a B2B user in their directory and until now we did not have a method to track it in AAD. Guests require someone to ensure that the guest's information is accurate and to remove the user once they no longer need access to the tenant. Having a sponsor allows the admin to find a responsible individual for the guest and verify whether the guest still needs to be in the directory providing improved governance capabilities.

## Case handling

This feature is supported by the [External Identity Management](mailto:azidcomm-extidmgmt@microsoft.com) community.

## Licensing

This feature requires an Microsoft Entra ID Premium P2 license for the access review function.

## How to configure and manage

See [Add sponsors to a guest user in the Microsoft Entra admin center](https://learn.microsoft.com/entra/external-id/b2b-sponsors)

## Troubleshooting

Using Graph Explorer in ASC we can determine the list of sponsors:

```msgraph
GET https://graph.microsoft.com/beta/users/b3ec96ea-####-####-####-############/sponsors/
```

Example of 3 sponsors: 2 users and 1 group. Expand #microsoft.graph.user or #microsoft.graph.group to see more details about the sponsor.

## ICM escalations

Service: Invitation Manager. Team: Triage

## External documentation

- Sponsors API: [Add sponsor - Microsoft Graph beta](https://learn.microsoft.com/graph/api/user-post-sponsors?view=graph-rest-beta&tabs=http)
- Invite API: [invitation resource type - Microsoft Graph beta](https://learn.microsoft.com/graph/api/resources/invitation?view=graph-rest-beta)
- ELM: [Working with the Microsoft Entra entitlement management API](https://learn.microsoft.com/graph/api/resources/entitlementmanagement-overview?view=graph-rest-beta)
- Feature Page: [Add sponsors to a guest user](https://learn.microsoft.com/entra/external-id/b2b-sponsors)
- EM: [Create an access package in entitlement management](https://learn.microsoft.com/entra/id-governance/entitlement-management-access-package-create)
