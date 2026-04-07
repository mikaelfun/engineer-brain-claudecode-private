---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Availability/Availability Tests/ASC Features for Availability Tests"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAvailability%2FAvailability%20Tests%2FASC%20Features%20for%20Availability%20Tests"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ASC Features for Availability Tests

During the troubleshooting process for availability test issues, several ASC tabs provide visibility into test execution details.

**Tip**: You can add your own Azure subscription to a case in ASC to perform validations using your own environment. A good FQR provides clarity based on data already known by Microsoft Support.

## ASC Tabs Reference

### 1. Web Tests Tab (on Application Insight Component)
- Quick access to "Web Test Executions" for all webtests associated with the Component
- Same functionality as the individual webtest "Executions" tab but aggregated across all tests
- See: [Use a Component's Web Tests tab](/Application-Insights/How-To/Azure-Support-Center/Use-a-Component's-Web-Tests-tab)

### 2. Properties Tab (on Webtest resource)
- **Best starting point** for all Availability test issues
- Shows metadata: kind (ping/standard), locations, URL, etc.
- URL can be quickly tested from a browser
- See: [Use the webtests' Properties tab](/Application-Insights/How-To/Azure-Support-Center/Use-the-webtests'-Properties-tab)

### 3. Executions Tab (on Webtest resource)
- Graph and tabular output of test results
- **Tabular output** provides exact timestamp + locale for use in Results tab
- See: [Use webtest's Executions tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Executions-tab)

### 4. Results Tab (on Webtest resource)
- Details of specific webtest execution, including **specific reason for failure**
- Same information users can access from portal
- See: [Use webtest's Results tab](/Application-Insights/How-To/Azure-Support-Center/Use-webtest's-Results-tab)

### 5. Associated Metric Alert
- Availability tests automatically get a metric alert with threshold **>= 2 locales failing** (40% sensitivity with recommended 5 locations)
- See: [Find metricalert associated with an Availability Test](/Application-Insights/How-To/Azure-Support-Center/Find-metricalert-associated-with-an-Availability-Test)

## Common Failure Scenarios
- Web tests displaying failed status while the web page was actually up
- Web tests not reporting failure when an app was actually down
- Failures from specific regions only

## Related Internal References
- [Use metricalerts Properties tab for AI Availability Test](/Application-Insights/How-To/Azure-Support-Center/Use-metricalerts-Properties-tab-for-Application-Insights-Availability-Test)
- [Use metricalerts Fired Alerts tab for AI Availability Test](/Application-Insights/How-To/Azure-Support-Center/Use-metricalerts-Fired-Alerts-tab-for-Application-Insights-Availability-Test)
- [Use Azure Monitor Metrics](/Application-Insights/How-To/Azure-Support-Center/Use-Azure-Monitor-Metrics)

## Public Documentation
- [Application Insights availability tests](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard)
- [Diagnose ping test failure](https://docs.microsoft.com/azure/azure-monitor/app/troubleshoot-availability)
