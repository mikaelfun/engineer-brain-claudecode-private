---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/Salesforce Service Cloud data connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FSalesforce%20Service%20Cloud%20data%20connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Salesforce Service Cloud Data Connector - Setup and Troubleshooting

## About
Salesforce Service Cloud is a CRM platform for customer service and support. This guide covers account setup and common connector errors.

## Account Setup

Required parameters for the Salesforce Service Cloud data connector:
- **SalesforceUser** - Salesforce username (name@company.com)
- **SalesforcePass** - Salesforce password
- **SalesforceConsumerKey** - Connected App consumer key
- **SalesforceConsumerSecret** - Connected App consumer secret
- **SalesforceTokenUri** - https://login.salesforce.com/services/oauth2/token
- **SalesforceSecurityToken** - Security token from email

### Setup Salesforce Developer Account
1. Sign up at https://developer.salesforce.com/signup (use personal email)
2. Note the username (SalesforceUser)
3. Verify account via email
4. Set password (SalesforcePass)

### Confirm API Enabled
- Setup > Users > check Profile > Administrative Permissions > API Enabled should be checked

### Create Connected App
- Setup > App Setup > Create > Apps > Connected Apps > New
- Enable OAuth Settings with callback URL and "Access and manage your data (api)" scope
- After save: Manage > Edit > OAuth policies: "All users may self-authorize"

### Get Consumer Key and Secret
- App Manager > find app > View > Click to reveal Consumer Key and Consumer Secret

### Generate Security Token
- Profile > Settings > My Personal Information > Reset My Security Token > check email

## Credential Validation

### Via REST API
POST to `https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id={key}&client_secret={secret}&username={user}&password={pass+token}`
- 200 status = success

### Via curl (Azure Cloud Shell)
```
curl -i -X POST https://<instance>.my.salesforce.com/services/oauth2/token \
  -d 'grant_type=password' \
  -d 'client_id=<ConsumerKey>' \
  -d 'client_secret=<ConsumerSecret>' \
  -d 'username=<Username>' \
  -d 'password=<Password+SecurityToken>'
```

## Additional Notes
- If you don't want to use security token, change "IP Restrictions" to "Relax IP restrictions" for Connected App (not recommended)
- Request developer edition: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart_dev_org.htm (use personal email)

## Documentation
- [Salesforce connector docs](https://docs.microsoft.com/en-us/azure/sentinel/connect-salesforce-service-cloud)
- [REST API Connectors TSG](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Sentinel%20CSS%20wiki/3452/REST-API-Connectors-(Poll-Azure-Functions))
- [Function-Type Data Connectors](https://dev.azure.com/SupportabilityWork/Azure%20Security/_wiki/wikis/Azure%20Sentinel%20CSS%20wiki/3659/Sentinel-Function-Type-Data-Connectors-information-(Beginning))
