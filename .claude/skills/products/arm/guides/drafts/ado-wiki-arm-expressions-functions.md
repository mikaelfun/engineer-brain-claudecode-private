---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/ARM templates expressions and functions"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20(ARM)%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FARM%20templates%20expressions%20and%20functions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Overview
ARM templates provide support to execute expressions into the property values. These expressions allow the ARM template engine to execute logic to calculate a result, as opposed to having a hardcoded value in the template.

Expressions start and end with brackets: `[` and `]`, respectively. The brackets indicate to the ARM template engine that the content inside the brackets needs to be processed as an expression, and not be taken as a literal value. The value of the expression is evaluated when the template is deployed. An expression can return a string, integer, boolean, array, or object.

Expressions can also include different functions that are provided by the ARM template engine. Documentation about these functions can be found in [ARM template functions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions).

## Functions architecture details
### guid()
GUIDs are calculated using **UUID version 5** of the [RFC 4122 standard, section 4.3](https://www.rfc-editor.org/rfc/rfc4122#section-4.3).

UUID version 5 requires a namespace and a value to generate a GUID based on the value provided.

If a customer needs to generate a GUID with the same logic as the ARM template engine, they can use any UUID v5 library or tool, with the current values:

- **Namespace**: `11fb06fb-712d-4ddd-98c7-e71bbd588830`
  This value is specific to ARM but can be shared with customers if they are looking to generate GUIDs in the same way the ARM template engine does.
- **Value**: This is what the user wants to generate a GUID for, basically the value that is passed in the parenthesis of the ARM template guid() function.

> The **guid()** ARM template function allows the user to pass multiple string values as parameters. The ARM template engine will join these strings together using the `-` character before executing the logic to create the GUID. Customers would also require joining multiple values the same way to get consistent results between their code and the ARM template engine.

#### Sample code for C#
```csharp
using System;
using Azure.Deployments.Expression.Utility;

public class Program
{
    public static void Main()
    {
        var myGuid = GetDeploymentsGuid("abc", "def");
        Console.WriteLine($"Guid: {myGuid}");
    }

    private static Guid GetDeploymentsGuid(params string[] input)
    {
        return GuidUtility.Create(
            namespaceId: new Guid("11fb06fb-712d-4ddd-98c7-e71bbd588830"),
            name: string.Join('-', input),
            version: 5);
    }
}
```
