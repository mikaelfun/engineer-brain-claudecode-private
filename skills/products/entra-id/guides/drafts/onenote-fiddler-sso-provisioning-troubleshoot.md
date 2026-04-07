# Using Fiddler to Troubleshoot SSO Application User Provisioning

> Source: OneNote case sharing | Quality: draft

## When to Use

When troubleshooting user provisioning issues for SSO-integrated enterprise applications in Azure AD.

## Steps

1. Open Fiddler trace
2. Sign in to Azure AD → Enterprise Applications
3. Select the target application → click **Provisioning**
4. Click **Clear current state and restart synchronization**
5. Let Fiddler capture all sessions for approximately 20 minutes
6. Stop the Fiddler trace
7. Filter and check endpoint: `main.iamadext.azure.com`
8. Analyze the captured requests/responses for provisioning errors

## Analysis Tips

- Look for HTTP 4xx/5xx responses in the provisioning API calls
- Check request/response payloads for error details
- Compare working vs non-working provisioning cycles
- Pay attention to SCIM endpoint responses if the app uses SCIM provisioning

## Key Endpoint

- `main.iamadext.azure.com` — The backend endpoint for Azure AD provisioning operations

## Notes

- Ensure Fiddler is configured to decrypt HTTPS traffic
- 20 minutes capture window is recommended to cover a full provisioning sync cycle
