---
source: onenote
sourceRef: "MCVKB/wiki_migration/=======Web=======/3.2 如何定制Application Insights监控自定义得资源.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Insights — Custom Availability Test for Mooncake

## Background

Built-in Application Insights availability test (URL ping, multi-step test) is **not available in Mooncake**. However, you can implement custom availability testing using Azure Function + Application Insights SDK.

## Architecture

1. Create a **TimeTrigger Azure Function** (runs on schedule, e.g., every 5 minutes)
2. Use **HttpClient** to test target URLs
3. Send results as **AvailabilityTelemetry** to Application Insights

## Key Configuration for Mooncake

- Configure `TelemetryConfiguration` with correct Mooncake endpoint:
  ```csharp
  new ServerTelemetryChannel() { EndpointAddress = "<Mooncake-EndpointAddress>" }
  ```
- Set `APPINSIGHTS_INSTRUMENTATIONKEY` in Function App settings

## Implementation (.NET)

```csharp
private static readonly HttpClient HttpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
private static readonly string InstrumentationKey = Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY");
private static readonly TelemetryConfiguration TelemetryConfiguration =
    new TelemetryConfiguration(InstrumentationKey, new ServerTelemetryChannel() { EndpointAddress = "<EndpointAddress>" });
private static readonly TelemetryClient TelemetryClient = new TelemetryClient(TelemetryConfiguration);

[FunctionName("AvailabilityTest")]
public static async void Run([TimerTrigger("0 */5 * * * *")]TimerInfo myTimer, ILogger log)
{
    string testName = "AvailabilityTestFunction";
    string location = Environment.GetEnvironmentVariable("REGION_NAME");

    await AvailabilityTestRun(
        name: testName,
        location: location,
        uri: "<target-url>",
        contentMatch: "<expected-content>",
        log: log
    );
}
```

### AvailabilityTestRun Method

1. Create `AvailabilityTelemetry` object
2. Use `HttpClient.GetAsync(uri)` to test URL
3. Check `httpResponse.IsSuccessStatusCode` and content match
4. Track result via `TelemetryClient.TrackAvailability(availability)`
5. Always call `TelemetryClient.Flush()` in finally block

### Error Handling

- **TaskCanceledException** — test timed out
- **Other exceptions** — track as `ExceptionTelemetry`, mark as monitoring failure (don't send availability telemetry to avoid false negatives)

## Availability Test Types

| Type | Description | Mooncake Support |
|------|-------------|-----------------|
| URL Ping | Periodic URL check | Custom implementation only |
| Multi-step | Recorded step playback | Not available |
| Custom Track | Code-based testing | Supported via above pattern |
