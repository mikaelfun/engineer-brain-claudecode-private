---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Build a simple load test to validate Sampling"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FSampling%2FBuild%20a%20simple%20load%20test%20to%20validate%20Sampling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Build a simple load test to validate Sampling

## Scenario

Sampling scenarios are amongst the most common in support cases. It is beneficial for Support Engineers to configure and test different Sampling configurations for different reproduction environments.

The challenge is that test applications typically don't process enough traffic to trigger Sampling thresholds in the SDK.

## Sample Code

The console application below simulates heavy web requests against a test application URL to trigger Sampling:

```csharp
using System.Net;
internal class Program
{
    static void Main(string[] args)
    {
        while (true) // never-ending loop, stop manually after done
        {
            var url = ""; // Replace with your application's URL, example: https://bing.com
            var httpRequest = (HttpWebRequest)WebRequest.Create(url);
            httpRequest.Accept = "*/*";
            var response = httpRequest.GetResponse();
        }
    }
}
```

## Results

After running this script for roughly 5-10 minutes, run a query in the Application Insights resource to verify Adaptive Sampling kicked in. Check if `RetainedPercentage` drops below 100%.

---
_Provided by: Nicolas Zamora (nzamoralopez@microsoft.com)_
