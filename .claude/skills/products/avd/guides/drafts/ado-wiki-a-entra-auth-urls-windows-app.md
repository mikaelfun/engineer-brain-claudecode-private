---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Entra Authentication discovered URLs for Windows App"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Entra%20Authentication%20discovered%20URLs%20for%20Windows%20App"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra Authentication Discovered URLs for Windows App

The following URLs/endpoints are used during Windows App authentication flow. These are important for network allowlisting and proxy configuration.

## Authentication Flow URLs

- **odc.officeapps.live.com** - Hosting the first Auth prompt screen - directing to login.microsoftonline.com or login.live.com depending on the type of account.

- **login.microsoftonline.com** (and 302 office.com) - Requesting auth: pass or passwordless for Enterprise accounts

- **aadcdn.msauth.net** - Referred by login.microsoftonline.com - doing auth

- **aadcdn.msftauth.net** - Doing auth

- **\*.cdn.office.net** - CDN resources

- **ecs.office.com** - Getting tenant features and flights

- **ctldl.windowsupdate.com** - Certificate trust list downloads

## Certificate Checks

See [Azure Certificate Authority details | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-CA-details?tabs=root-and-subordinate-cas-list#certificate-downloads-and-revocation-lists)

## Viewing Tenant Flights

View Tenant Flights in trace for the GET ecs API call (requires a Wireshark trace to view extended call details and response). Response type is JSON.
