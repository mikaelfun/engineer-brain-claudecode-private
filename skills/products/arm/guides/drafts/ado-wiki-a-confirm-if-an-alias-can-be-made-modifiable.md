---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Confirm if an alias can be made modifiable"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FConfirm%20if%20an%20alias%20can%20be%20made%20modifiable"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Confirm if an alias can be made modifiable

Based on how modifiable aliases work, not every alias can be used in a modify policy. PG has only enabled aliases for modify after they have confirmed they indeed support modify functionality.

In order for CSS to request that an alias is made modifiable, we need to run the below steps to confirm before we make the ask.

> The below steps can either be done in Postman or using the "Try it" option in the Azure REST API reference docs.

1. Identify the property in the resource payload that matches the alias that needs to be made modifiable.
2. Create a resource, set any value to that property (this step can be done from the Azure Portal or any other client).
3. Run a **GET call** on the resource and copy the response body.
4. In the response body, change the value of the property that requires modify to any other valid value.
5. Run a **PUT call** on the **same** resource from step 3. Use the modified response body from step 4 as the request body of the PUT.
6. Run a **GET call** on the resource, confirm the property has the new value. If it does, the property supports modify.

In summary, the confirmation requires takes the GET response body, merges the changes and uses that in a PUT request. That is what modify effect does behind the scenes.

Once the above confirmation is done, open a SME request or reach out to a TA to verify the information before opening an IcM.
