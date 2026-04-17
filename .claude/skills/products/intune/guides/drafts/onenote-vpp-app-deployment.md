# iOS VPP App Deployment Steps

> Source: OneNote Case 2308160010000983
> Status: draft

## Steps

1. **Download VPP token** from Apple Business Manager: https://business.apple.com/#/main/preferences/myprofile
2. **Upload token to Intune portal** (Tenant administration > Connectors and tokens > Apple VPP tokens)
3. **Add VPP apps** to the specified location in Apple Business Manager website
4. **Sync VPP token** in Intune portal to trigger app catalog refresh
5. Apps will appear in the Intune App list after sync completes

## Notes

- VPP token must be renewed before expiry (1-year validity)
- Each VPP token is tied to a specific Apple Business Manager location
- 21Vianet: Same workflow applies, ensure Intune China endpoints are used
