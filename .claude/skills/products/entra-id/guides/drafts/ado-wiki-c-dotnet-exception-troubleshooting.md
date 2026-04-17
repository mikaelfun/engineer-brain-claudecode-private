---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet Exception Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20Exception%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# .NET Exception Troubleshooting

When exceptions from MSAL/Graph SDK don't provide enough information, flatten inner exceptions:

## FlattenException helper

```csharp
public static string FlattenException(Exception exception)
{
    var stringBuilder = new StringBuilder();
    while (exception != null)
    {
        stringBuilder.AppendLine(exception.Message);
        stringBuilder.AppendLine(exception.StackTrace);
        exception = exception.InnerException;
    }
    return stringBuilder.ToString();
}
```

## Usage in try/catch

```csharp
StringBuilder message = new StringBuilder();
try {
    var graphResult = client.Me.GetAsync();
}
catch (Exception e)
{
    message.AppendLine($"ExceptionType: {e.GetType().ToString()}");
    message.Append(FlattenException(e));
}
Console.WriteLine(message);
```

Output contains all inner exceptions with stack traces for complete diagnostic information.
