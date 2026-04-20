---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Azure Firewall Web Categories"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages/Azure%20Firewall/Features%20%26%20Functions/Azure%20Firewall%20Web%20Categories"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Overview

Web categories lets administrators allow or deny user access to web site categories such as gambling websites, social media websites, and others. The categories are organized based on severity under Liability, High-Bandwidth, Business use, Productivity loss, General surfing, and Uncategorized.

# Web Category Search

You can identify what category a given FQDN or URL is by using the Web Category Check feature. To use this, select the Web Categories tab under Firewall Policy Settings.

Important Permission note: To use Web Category Check feature, user must have access of Microsoft.Network/azureWebCategories/getwebcategory/action on the subscription level.

Azure Firewall web categories: https://learn.microsoft.com/en-us/azure/firewall/web-categories

# Customer Workflow for identifying a category

1. Navigate to firewall policy
2. Go to Web Categories under settings
3. Enter the FQDN/URL in the search
4. If customer feels categorization is incorrect they can report it and make a suggestion

# Engineer category check workflow

1. Customer provides URL
2. Engineer plugs in URL to https://incompass.netstar-inc.com/urlsearch
3. Retrieves category
4. Check the isSupported parameter to see if the customer can use that web category
5. isSupported: true = customer CAN select it as a web category
6. isSupported: false = customer CANNOT select it as a web category
