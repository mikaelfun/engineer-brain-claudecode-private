---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Availability/Availability Tests/Availability Test Location Recommendation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAvailability%2FAvailability%20Tests%2FAvailability%20Test%20Location%20Recommendation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


[[_TOC_]]


# Overview
---
During the web test configuration, you have the option to choose several locations from which you want the test to be conducted against your website. You can choose a maximum of 16 locations, and the default value is usually 5.


# Workflow
---

<details closed>
<summary><b>Why 5 locations?</b></summary>
<br>

The public documentation states [here](https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests#create-a-standard-test) the minimum recommendation when it comes to locations of the test is 5.

![image.png](/.attachments/image-729b77b4-f371-4a06-912c-13e74445d32f.png)

The reason for this is to deal with random internet connectivity issues that can and will occur. This value in conjunction with the default alert setting is a ratio that effectively is a sensitivity control for these random connectivity issues.

Looking at the [Alerts section of the docs](https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests#alerts) and the "Alert location threshold" the following is documented: **Alert location threshold** : *We recommend a minimum of 3/5 locations. The optimal relationship between alert location threshold and the number of test locations is alert location threshold = number of test locations - 2, with a minimum of five test locations.*

This means a set of users will be notified by alert every time a prescribed threshold of failures is breached. Failures of a test means that it did not meet the Success criteria documented in the prior section. However random, transient failures can be expected so the threshold is defined as the number of test locations is alert location threshold = number of test locations - 2, with a minimum of five test locations. This effectively means that a set of repeated failures from 2 locations is required to be a concern to generate an alert being sent. This is to safeguard from noisy alerting due to the site actually being available generally and only a random location is experiencing a random, transient issue.

Given the above information even 2 or 3 sites reporting failures needs to be understood. Are there failures every single attempt from all impacted locations? The fact that other locations are working implies the site is NOT down. Testing access to the endpoint being used is crucial and doing this test from the public side important because doing the test within the same network as then endpoint is not very accurate to what the availability test is doing.

Another important thing to understand is the web site getting reports from users actually using it that mimic the response the response to the web test? If so, it shows the web test is working as it get a response back from the site and the failure is effectively a false positive in that the response gotten is not the expected response defined within test. 


</br>
</details>


<details closed>
<summary><b>Scenarios to consider</b></summary>
<br>

There are a few situations that can cause a test to fail (assuming the URL provided is accessible and showing proper results), one of the most common situations is that the tests are working fine with an exception of one or two regions either sporadically or consistently failing:

1 - The VM's running behind the scenes responsible for generating the web requests, can be experiencing connectivity issues (example: West Europe VM's might be failing to establish a proper connection or failing to resolve the URL DNS, making the West Europe location showcase failed test runs). For information on Web Test design check [here](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1521288/Objective-Availability-Test-Architecture-and-Creation)

2 - Cloud environments can be really complex, applications can be behind firewalls, load balancers, CDN's among other network / security features, there might be blocked traffic incoming from specific regions and that can cause the web tests on those same regions to fail.

3 - The scenarios above can imply a consistent failure for a single region, other times these could be transient or sporadic, as an example let's say there's an environment with a failover configuration where traffic incoming from a specific region should be routed to Server B when Server A is down, if the failover process has an hiccup for a couple milliseconds that translates into a failure for people from certain regions accessing their website, web tests will pick up the failure but right after it recovers web tests will continue to show success results

</br>
</details>

<details closed>
<summary><b>Conclusion</b></summary>
<br>

Remember to always consider the cause of the failure. If the failure was due to a particular response code was received in response from the site, then the availability test worked, and the issue is not with the Availability test itself rather the responses being returned from the site. 

What is to say there are few locations used than 5 meaning the default threshold would be encountered a lot easier, higher sensitivity. ASC will expose this scenario and changes will need to be made, either increase the number of locations or adjust the alert to be less sensitive.

What is to say it was a one-off occurrence? If so, expectations should be tempered, is this something worthy of hours and dollars. Again, there is a lot that can go wrong going across the internet to reach a managed web site.

As you can see there are a lot of variables to take in consideration, it is always important to configure web tests for at least these 5 regions and then we need to understand what's the pattern of potential failures.

Leverage the troubleshooting steps in the following [article](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1540090/Objective-ASC-Features-for-Availability-Tests), to help determined if the problem sits on the availability test backend machines running the web tests or if it's a transient issue.
</br>
</details>

# Public Documentation
---
- [Application Insights availability tests](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard)

# Internal References
---
[WIKI HoWTo Concepts : Availability Tests](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579971/Availability-Tests)
[WIKI Support Topics - Availability Tests](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605334/Availability-Tests)

---
Last Modified date: 18/06/2024
Last Modified by: brafonso

