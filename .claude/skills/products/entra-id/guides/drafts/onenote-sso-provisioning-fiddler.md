# SSO Application User Provisioning - Fiddler Troubleshooting

> Source: OneNote case sharing
> Status: draft (pending SYNTHESIZE)

## When to Use

When troubleshooting SSO application user provisioning issues in Azure AD enterprise applications and need to capture detailed HTTP traffic.

## Steps

1. Open Fiddler trace
2. Sign in to Azure AD, navigate to **Enterprise Applications**
3. Select the target application and click **Provisioning**
4. Click **Clear current state and restart synchronization**
5. Let Fiddler capture all sessions for approximately 20 minutes
6. Stop the Fiddler trace
7. Filter for endpoint: `main.iamadext.azure.com`
8. Analyze the provisioning API calls for errors (HTTP 4xx/5xx, SCIM error responses)

## Key Endpoints to Watch

- `main.iamadext.azure.com` — Azure AD provisioning backend
- SCIM endpoints of the target application

## Notes

- This technique applies to both gallery and non-gallery apps using SCIM provisioning
- For 21V (Mooncake), the endpoint domain may differ
