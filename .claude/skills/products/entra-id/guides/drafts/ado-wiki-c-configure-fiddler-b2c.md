---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Configure Fiddler to show column values for troubleshooting B2C tickets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Configure%20Fiddler%20to%20show%20column%20values%20for%20troubleshooting%20B2C%20tickets"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configure Fiddler Custom Columns for B2C Troubleshooting

## Custom Columns Added
- **B2C_Trans**: Decodes x-ms-cpim-trans cookie to show correlation ID, domain, policy. Auto-generates 2 Kusto queries.
- **Method**: HTTP method (GET/POST/etc.)
- **Id_Token**: Decoded id_token from request/response
- **Access_Token**: Decoded access_token from request/response

## Setup
1. Open Fiddler > Rules > Customize Rules
2. Paste FiddlerScript code after opening bracket of Handlers class
3. Close and reopen Fiddler to see new columns
4. B2C_Trans column: right-click value > Copy > This Column to get correlation ID and Kusto queries
