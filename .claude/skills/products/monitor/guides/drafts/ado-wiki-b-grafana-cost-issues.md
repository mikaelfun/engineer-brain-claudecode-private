---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/Troubleshooting Guides/TSG Azure Managed Grafana Cost Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FTroubleshooting%20Guides%2FTSG%20Azure%20Managed%20Grafana%20Cost%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
Users may submit support requests related to requests about pricing for Azure Managed Grafana or about their Azure Managed Grafana costs. This article will delve into explaining the costs associated with Azure Managed Grafana and some steps on validating the pricing info in case a customer asks. Please see the pricing article in the resources section to learn more.

# Troubleshooting
1. Verify the customer ask, if they are simply asking about the pricing, we can provide them with the link in the resources section and advise about the various sections. The basic costs have to do with the Instance itself, which is the resource which is provisioned on two VM's for redundancy for the Standard SKU [Azure Managed Grafana service reliability | Microsoft Learn](https://learn.microsoft.com/en-us/azure/managed-grafana/high-availability). Then the active users which are the unique users, Grafana service account and API keys that are used to access that instance within the month and then zone redundancy if they have that enabled which can be check in Azure Support Center under the properties page.

2. If the customer is asking about the bill they received for a particular month, we can do some investigation through the Azure Portal. From the Azure Managed Grafana page click on 'View Cost' on the right-hand side at the top of the page, this will load the cost analysis in the scope of the resource. From here you can change the view to 'InvoiceDetails' and select the proper month and it'll show what types of cost were attributed to that month. For example in the below screenshot it shows my cost for the instance and then the $6 cost which is the cost per user:
![image.png](/.attachments/image-c2ea33ca-a17f-41c8-8df4-f9c86e4a2002.png)

3. The view above will give a holistic view, but if we need to dig deeper, we will have to do so via Kusto.

Execute [[Web](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod?query=H4sIAAAAAAAAA21SwW6bQBC9%2BytGnBLJBNvKqVUOqLVSH%2BxULj1H62WAjZddMjsYUfXjOwbboWolI5k3b948Zl6SZJUJ8N4i9dAZa6EhfzI5Qq5YAaFVjDmwh8p3UCvXQxuQwswiCxR4j6XxDp4gSrfP%2B%2FXz5mUXfYYkgT02VmkUUa5E58wamtqgSsz6Bs89tWpH9vAPCk%2BQajYnhJ8yZQ6RcQWpsXCqQVeKSoRBx7jAymncqRov43fpdj3K7TwDVygmgm9JXGy%2BzuGtDQxO6DNrCqb0GNKmAZglydUrmxplngge0Mr3Dt4LQ4GTgNq7HHwhXqzUjCuh9k7qAnWVYugQFMnjlO1%2FSXkuDm6rHVEM8KLZH5Bg9ThsePZbmlHass12%2FSNLt99BZnOH6OBOCHi2dLdarB7j5TJeLLPF4tPwu4eHB%2FiXsPog3MNN%2FIsYVcYhjcuSbQ0biEtShTiLD3J4cRx3no5Isb7So5vCt8mpn6aHvzHqUIJchDgMW4tCqzWGULTW9hDaQ234nCQ1BkASoT3l0V%2Ftl7lhkpH%2F16e3F4ZE9g01T0zOR4nXRvwYFuCI%2FRV7b5UTUN7pko5Xk%2F8B3O4JWQgDAAA%3D)] [[Desktop](https://azuregrafana.westus2.kusto.windows.net/rpprod?query=H4sIAAAAAAAAA21SwW6bQBC9%2BytGnBLJBNvKqVUOqLVSH%2BxULj1H62WAjZddMjsYUfXjOwbboWolI5k3b948Zl6SZJUJ8N4i9dAZa6EhfzI5Qq5YAaFVjDmwh8p3UCvXQxuQwswiCxR4j6XxDp4gSrfP%2B%2FXz5mUXfYYkgT02VmkUUa5E58wamtqgSsz6Bs89tWpH9vAPCk%2BQajYnhJ8yZQ6RcQWpsXCqQVeKSoRBx7jAymncqRov43fpdj3K7TwDVygmgm9JXGy%2BzuGtDQxO6DNrCqb0GNKmAZglydUrmxplngge0Mr3Dt4LQ4GTgNq7HHwhXqzUjCuh9k7qAnWVYugQFMnjlO1%2FSXkuDm6rHVEM8KLZH5Bg9ThsePZbmlHass12%2FSNLt99BZnOH6OBOCHi2dLdarB7j5TJeLLPF4tPwu4eHB%2FiXsPog3MNN%2FIsYVcYhjcuSbQ0biEtShTiLD3J4cRx3no5Isb7So5vCt8mpn6aHvzHqUIJchDgMW4tCqzWGULTW9hDaQ234nCQ1BkASoT3l0V%2Ftl7lhkpH%2F16e3F4ZE9g01T0zOR4nXRvwYFuCI%2FRV7b5UTUN7pko5Xk%2F8B3O4JWQgDAAA%3D&web=0)] [[Real-Time Intelligence](https://app.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://azuregrafana.westus2.kusto.windows.net/&database=rpprod&query=H4sIAAAAAAAAA21SwW6bQBC9%2BytGnBLJBNvKqVUOqLVSH%2BxULj1H62WAjZddMjsYUfXjOwbboWolI5k3b948Zl6SZJUJ8N4i9dAZa6EhfzI5Qq5YAaFVjDmwh8p3UCvXQxuQwswiCxR4j6XxDp4gSrfP%2B%2FXz5mUXfYYkgT02VmkUUa5E58wamtqgSsz6Bs89tWpH9vAPCk%2BQajYnhJ8yZQ6RcQWpsXCqQVeKSoRBx7jAymncqRov43fpdj3K7TwDVygmgm9JXGy%2BzuGtDQxO6DNrCqb0GNKmAZglydUrmxplngge0Mr3Dt4LQ4GTgNq7HHwhXqzUjCuh9k7qAnWVYugQFMnjlO1%2FSXkuDm6rHVEM8KLZH5Bg9ThsePZbmlHass12%2FSNLt99BZnOH6OBOCHi2dLdarB7j5TJeLLPF4tPwu4eHB%2FiXsPog3MNN%2FIsYVcYhjcuSbQ0biEtShTiLD3J4cRx3no5Isb7So5vCt8mpn6aHvzHqUIJchDgMW4tCqzWGULTW9hDaQ234nCQ1BkASoT3l0V%2Ftl7lhkpH%2F16e3F4ZE9g01T0zOR4nXRvwYFuCI%2FRV7b5UTUN7pko5Xk%2F8B3O4JWQgDAAA%3D)] [[cluster('azuregrafana.westus2.kusto.windows.net').database('rpprod')](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod)]
```
//This query will provide data related to how many users were registered for the month
let hostRegion = "AMGREGION"; // Replace with region  
let usageType = "mau"; // "mau" for Active User, "infra" for vm charge   
let instanceName = "AMGNAME"; // Not the Resource ID, just name  
liftrAksApp    
//Replace timeframe below with first/second of following month of what we are analyzing, this query analyzes October 24 data  
| where TIMESTAMP  between (datetime(2024-11-01T00:00:00) .. datetime(2024-11-02T00:00:00))   
| where ContainerName == "liftr-grafana-billing-worker-container"  
| where HostRegion == hostRegion   
| where msg startswith "successfully submitted a usage record"  
| where msg contains usageType   
| where msg contains instanceName  
| project HostRegion, usage_partitionkey, usage_quantity, resource_id
```

Execute [[Web](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod?query=H4sIAAAAAAAAA2VSy27bMBC8%2ByumOtlAFDluTgl6EAojNQo7ge0foKmVRJgPlaTiqij67V0xjusigA4UOTs7M7tFsW9VwI%2Be%2FICT0hoNRcSWEDqSqlYScegIrkYfyN9gcD2ksOMfw7g0ulTyDhdaDyhfVnAeO%2FKvShJKKV1vmdYdyQacWiVbCE84cEOqIAJ6q1hD6hEmmvlaF%2BKWGuUsviAr10%2Fb5dPqeZM9pldlQxRW0kYYOr9vyvVyfFV19OUxlF0HTIpiS50WrCEqQ1xjOlQiCrYaW9Q9%2BzXO8vFAyjYQVujhF1U3qFk%2B%2FWS4PtuU7pWl4VlGdyCPxf3kNxshNrFfrZe7fbl%2BAbPEE5HFlHvQ2HG6mC%2Fu87t5Pr%2Fbz%2BcP6Zvh9hYfAJ%2BvALML91cWJ5Ql%2F2aUnSZ%2FeeNFzWLzqssbZjqJIZfv0OxS%2Fe0qwz9XiV4AJjTgUHwMKY%2Bs7GO7pdDr%2BIDx7LziNFIYIs0m5ZZxTlWq%2FdTy6DLvNP1ruusPlTOsBGdF4b9pMa5SISorI0SnvtNwvg29MWLsh7Qs0xmKgo%2FGEG9OmpRmd%2BO6yZbkMe0oE%2BBIAyxT%2FAU9L6LMygIAAA%3D%3D)] [[Desktop](https://azuregrafana.westus2.kusto.windows.net/rpprod?query=H4sIAAAAAAAAA2VSy27bMBC8%2ByumOtlAFDluTgl6EAojNQo7ge0foKmVRJgPlaTiqij67V0xjusigA4UOTs7M7tFsW9VwI%2Be%2FICT0hoNRcSWEDqSqlYScegIrkYfyN9gcD2ksOMfw7g0ulTyDhdaDyhfVnAeO%2FKvShJKKV1vmdYdyQacWiVbCE84cEOqIAJ6q1hD6hEmmvlaF%2BKWGuUsviAr10%2Fb5dPqeZM9pldlQxRW0kYYOr9vyvVyfFV19OUxlF0HTIpiS50WrCEqQ1xjOlQiCrYaW9Q9%2BzXO8vFAyjYQVujhF1U3qFk%2B%2FWS4PtuU7pWl4VlGdyCPxf3kNxshNrFfrZe7fbl%2BAbPEE5HFlHvQ2HG6mC%2Fu87t5Pr%2Fbz%2BcP6Zvh9hYfAJ%2BvALML91cWJ5Ql%2F2aUnSZ%2FeeNFzWLzqssbZjqJIZfv0OxS%2Fe0qwz9XiV4AJjTgUHwMKY%2Bs7GO7pdDr%2BIDx7LziNFIYIs0m5ZZxTlWq%2FdTy6DLvNP1ruusPlTOsBGdF4b9pMa5SISorI0SnvtNwvg29MWLsh7Qs0xmKgo%2FGEG9OmpRmd%2BO6yZbkMe0oE%2BBIAyxT%2FAU9L6LMygIAAA%3D%3D&web=0)] [[Real-Time Intelligence](https://app.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://azuregrafana.westus2.kusto.windows.net/&database=rpprod&query=H4sIAAAAAAAAA2VSy27bMBC8%2ByumOtlAFDluTgl6EAojNQo7ge0foKmVRJgPlaTiqij67V0xjusigA4UOTs7M7tFsW9VwI%2Be%2FICT0hoNRcSWEDqSqlYScegIrkYfyN9gcD2ksOMfw7g0ulTyDhdaDyhfVnAeO%2FKvShJKKV1vmdYdyQacWiVbCE84cEOqIAJ6q1hD6hEmmvlaF%2BKWGuUsviAr10%2Fb5dPqeZM9pldlQxRW0kYYOr9vyvVyfFV19OUxlF0HTIpiS50WrCEqQ1xjOlQiCrYaW9Q9%2BzXO8vFAyjYQVujhF1U3qFk%2B%2FWS4PtuU7pWl4VlGdyCPxf3kNxshNrFfrZe7fbl%2BAbPEE5HFlHvQ2HG6mC%2Fu87t5Pr%2Fbz%2BcP6Zvh9hYfAJ%2BvALML91cWJ5Ql%2F2aUnSZ%2FeeNFzWLzqssbZjqJIZfv0OxS%2Fe0qwz9XiV4AJjTgUHwMKY%2Bs7GO7pdDr%2BIDx7LziNFIYIs0m5ZZxTlWq%2FdTy6DLvNP1ruusPlTOsBGdF4b9pMa5SISorI0SnvtNwvg29MWLsh7Qs0xmKgo%2FGEG9OmpRmd%2BO6yZbkMe0oE%2BBIAyxT%2FAU9L6LMygIAAA%3D%3D)] [[cluster('azuregrafana.westus2.kusto.windows.net').database('rpprod')](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod)]
```
//This query will get the specific type of user, you can use this to get specifically API or Service Account tokens which are billed as unique users  
let hostRegion = "AMGREGION";  
let instanceName = "AMGNAME";  
liftrAksApp    
//Replace timestamp data with full month being analyzed, for example this covers October 24  
| where TIMESTAMP  between (datetime(2024-10-01T00:00:00) .. datetime(2024-10-31T00:00:00))  
| where ContainerName == "liftr-grafana-dp-gateway-container"  
| where HostRegion =~ hostRegion  
| where msg startswith "AuthResult: Authorized for a user with" and msg !has "role"  
| where Subdomain contains instanceName  
| distinct apiKeyName  
| summarize count() // comment full line to check the api key name
```

Execute [[Web](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod?query=H4sIAAAAAAAAA2VSy07DMBC89yuGnFqJ0BQ4gThEqCoVakGlP%2BDGm8QisYMfVEGIb2cdoBQh%2BbDSzO7OzHo6xbZWDi%2BBbI%2B9ahpU6pXQmwABb0lLmBJBK2YgOLIOHVlI0Y8a8qiN8xuqlNG4QZKvFpv5YvmwTq4HVGnnhS5oLVr6xtf5ah5RVXqbP7u864DRdIoNdY0oCF61xE1tx2J8jTKwotZoLnekdAWhRdO%2FkRy9Y1%2BTJWyXq%2FnTNl89ghl%2BT6QxlsJTHDQ%2Bz84v01mWZrNtll0Nb4KzM%2FwjXBwRJofZt7xYKE32ywA7GHSnlRUlC0lll1Y8aS%2F6tPihJofuu6NsPo6SOhBaV4G9Wu8Gr0kefL0hFxp%2FhVgbq9gpSmP5FjH7IZOEM5BD70ktHBJrGvpd%2BhR20rSsBN%2BK3J8rMM%2BFthVxMiALE7Qfi07dUx%2FhCXY9dkqPD6meYiZjIPEnsIAYWlGz5E9%2FRr7UOQIAAA%3D%3D)] [[Desktop](https://azuregrafana.westus2.kusto.windows.net/rpprod?query=H4sIAAAAAAAAA2VSy07DMBC89yuGnFqJ0BQ4gThEqCoVakGlP%2BDGm8QisYMfVEGIb2cdoBQh%2BbDSzO7OzHo6xbZWDi%2BBbI%2B9ahpU6pXQmwABb0lLmBJBK2YgOLIOHVlI0Y8a8qiN8xuqlNG4QZKvFpv5YvmwTq4HVGnnhS5oLVr6xtf5ah5RVXqbP7u864DRdIoNdY0oCF61xE1tx2J8jTKwotZoLnekdAWhRdO%2FkRy9Y1%2BTJWyXq%2FnTNl89ghl%2BT6QxlsJTHDQ%2Bz84v01mWZrNtll0Nb4KzM%2FwjXBwRJofZt7xYKE32ywA7GHSnlRUlC0lll1Y8aS%2F6tPihJofuu6NsPo6SOhBaV4G9Wu8Gr0kefL0hFxp%2FhVgbq9gpSmP5FjH7IZOEM5BD70ktHBJrGvpd%2BhR20rSsBN%2BK3J8rMM%2BFthVxMiALE7Qfi07dUx%2FhCXY9dkqPD6meYiZjIPEnsIAYWlGz5E9%2FRr7UOQIAAA%3D%3D&web=0)] [[Real-Time Intelligence](https://app.fabric.microsoft.com/groups/me/queryworkbenches/querydeeplink?cluster=https://azuregrafana.westus2.kusto.windows.net/&database=rpprod&query=H4sIAAAAAAAAA2VSy07DMBC89yuGnFqJ0BQ4gThEqCoVakGlP%2BDGm8QisYMfVEGIb2cdoBQh%2BbDSzO7OzHo6xbZWDi%2BBbI%2B9ahpU6pXQmwABb0lLmBJBK2YgOLIOHVlI0Y8a8qiN8xuqlNG4QZKvFpv5YvmwTq4HVGnnhS5oLVr6xtf5ah5RVXqbP7u864DRdIoNdY0oCF61xE1tx2J8jTKwotZoLnekdAWhRdO%2FkRy9Y1%2BTJWyXq%2FnTNl89ghl%2BT6QxlsJTHDQ%2Bz84v01mWZrNtll0Nb4KzM%2FwjXBwRJofZt7xYKE32ywA7GHSnlRUlC0lll1Y8aS%2F6tPihJofuu6NsPo6SOhBaV4G9Wu8Gr0kefL0hFxp%2FhVgbq9gpSmP5FjH7IZOEM5BD70ktHBJrGvpd%2BhR20rSsBN%2BK3J8rMM%2BFthVxMiALE7Qfi07dUx%2FhCXY9dkqPD6meYiZjIPEnsIAYWlGz5E9%2FRr7UOQIAAA%3D%3D)] [[cluster('azuregrafana.westus2.kusto.windows.net').database('rpprod')](https://dataexplorer.azure.com/clusters/azuregrafana.westus2/databases/rpprod)]
```
// This query will give you a trend of unique users per day  
let hostRegion = "AMGREGION";  
let instanceName = "AMGNAME";  
liftrAksApp    
// Replace timestamp with full month being analyzed  
| where TIMESTAMP  between (datetime(2024-10-01T00:00:00) .. datetime(2024-10-31T00:00:00))  
| where ContainerName == "liftr-grafana-dp-gateway-container"  
| where HostRegion =~ hostRegion  
| where msg startswith "AuthResult: Authorized for a user with" and msg !has "role"  
| where Subdomain contains instanceName  
| summarize  dcount(apiKeyName) by bin(TIMESTAMP, 1d)  
| render timechart
```
4. With the above queries we can reduce the number and type of users and then inform the customer as such. From here we can ask if they were using either API Keys or Service Account Tokens for interacting with Azure Managed Grafana. To reduce cost, they can use a longer lasting token, so it'll only be one unique user ([How to use service accounts in Azure Managed Grafana | Microsoft Learn](https://learn.microsoft.com/en-us/azure/managed-grafana/how-to-service-accounts?tabs=azure-portal%2Cgrafana-ui) depending on how long they allow the token to remain valid for.

5. For future occurrences, customers can also setup Diagnostic settings ([Monitor an Azure Managed Grafana instance with logs | Microsoft Learn](https://learn.microsoft.com/en-us/azure/managed-grafana/how-to-monitor-managed-grafana-workspace)) on the resource and see the login events.

6. If after explanation customer is not accepting, please file an ICM to Azure Managed Grafana PG with the investigation done so far and ask from the customer.

# Resources
---
[Pricing  Azure Managed Grafana](https://azure.microsoft.com/en-us/pricing/details/managed-grafana/?msockid=332396f32e6d6cc50b1e839a2fbb6db3)