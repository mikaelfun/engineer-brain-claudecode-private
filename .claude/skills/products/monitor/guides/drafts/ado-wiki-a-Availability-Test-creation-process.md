---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Availability/Availability Tests/Availability Test creation process"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAvailability%2FAvailability%20Tests%2FAvailability%20Test%20creation%20process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Overview
---
Availability tests are web requests created to test a website's availability (to determine if the application is accessible or experiencing downtime).

These are synthetic transactions that are automated at specific intervals, sending constant requests to the application. If the correct threshold of failures occurs an alert can be sent to individuals to bring awareness of the situation.



# Workflow
---

<details closed>
<summary><b>1. Overview of Web Test Creation</b></summary>
<br>

Below we showcase the steps to create the available test types, but before let's run through the available options of configuration (**the below is specific to Standard Web Tests which is the most common type and recommended test**):

<details closed>
<summary><b>General Configuration</b></summary>
<br>
**General Configuration**

|Setting|Description|
|--|--|
| URL | The URL can be any webpage you want to test, but it must be visible from the public internet. The URL can include a query string. So, for example, you can exercise your database a little. If the URL resolves to a redirect, we follow it up to 10 redirects. |
| Parse dependent requests | Test requests images, scripts, style files, and other files that are part of the webpage under test. The recorded response time includes the time taken to get these files. The test fails if any of these resources can't be successfully downloaded within the timeout for the whole test. If the option isn't selected, the test only requests the file at the URL you specified. Enabling this option results in a stricter check. The test could fail for cases, which might not be noticeable when you manually browse the site. Please note, we parse only up to 15 dependent requests. |
| Enable retries | When the test fails, it's retried after a short interval. A failure is reported only if three successive attempts fail. Subsequent tests are then performed at the usual test frequency. Retry is temporarily suspended until the next success. This rule is applied independently at each test location. We recommend this option. On average, about 80% of failures disappear on retry |
| SSL certificate validation test | You can verify the SSL certificate on your website to make sure it's correctly installed, valid, trusted, and doesn't give any errors to any of your users. |
| Proactive lifetime check | This setting enables you to define a set time period before your SSL certificate expires. After it expires, your test will fail. |
| Test frequency | Sets how often the test is run from each test location. With a default frequency of five minutes and five test locations, your site is tested on average every minute. |
| Test locations | Our servers send web requests to your URL from these locations. Our minimum number of recommended test locations is five to ensure that you can distinguish problems in your website from network issues. You can select up to 16 locations. More information on locations [here](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1524203/Objective-Availability-Test-Location-Recommendation) |
| Custom headers | Key value pairs that define the operating parameters. |
| HTTP request verb | Indicate what action you want to take with your request. |
| Request body | Custom data associated with your HTTP request. You can upload your own files, enter your content, or disable this feature. |

</br>
</details>

<details closed>
<summary><b>Success Criteria</b></summary>
<br>

|Setting|Description|
|--|--|
| Test timeout | Decrease this value to be alerted about slow responses. The test is counted as a failure if the responses from your site haven't been received within this period. If you selected Parse dependent requests, all the images, style files, scripts, and other dependent resources must have been received within this period. |
| HTTP response | The returned status code that's counted as a success. The number 200 is the code that indicates that a normal webpage has been returned. |
| Content match |A string, like "Welcome!" We test that an exact case-sensitive match occurs in every response. It must be a plain string, without wildcards. Don't forget that if your page content changes, you might have to update it. Only English characters are supported with content match. |

</br>
</details>

<details closed>

<summary><b>Alerts</b></summary>
<br>


|Setting|Description|
|--|--|
| Near real time | We recommend using near real time alerts (Metric Alert). Configuring this type of alert is done after your availability test is created and can just be turned on / enabled. |
| Alert location threshold | We recommend a minimum of 3/5 locations. The optimal relationship between alert location threshold and the number of test locations is alert location threshold = number of test locations - 2, with a minimum of five test locations. |

</br>
</details>

<br>

There are currently **4 types of tests**:
- Standard Web Tests
- Custom Web Tests
- URL Ping Test (classic - deprecated)
- Multi-step web test (deprecated)

<details closed>
<summary><b>Standard Test</b></summary>
<br>

A Standard test checks the availability of a website by sending a single request. In addition to validating whether an endpoint is responding and measuring performance, Standard tests also include SSL certificate validity, proactive lifetime checks, HTTP request verbs (for example, GET, HEAD, and POST), custom headers, and custom data associated with your HTTP request. 
These tests are the easiest and most recommended to create as of the date this article was last updated. You can use the portal UI to create them, and the several features described above give them a slight advantage compared to URL ping tests.

Further down on this article we show the entire process of creation and test result validation for Standard Tests.
</br>
</details>

<details closed>
<summary><b>Custom Web Tests</b></summary>
<br>

There is also some flexibility during test creation, custom web tests allow to use the trackAvailability method to fully customize a web test. This is done outside of the portal's UI. Our public documentation provides guidance with a basic sample of such a test.

https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions#basic-code-sample

This allows them to have full control of the test creation and its properties, usually targeted for users with very specific needs for the tests.

A few examples that make sense to go with this option:
- If authentication is required for a specific URL, out of the box our web tests do not support it, a custom option needs to be put in place.
- Run a web test from a region that is not currently supported by the existing options.
- Use availability tests on an internal server behind a firewall ([public doc](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/availability/internal-server-availability-tests-firewall))
</br>
</details>

<details closed>
<summary><b>URL Ping Test (classic - deprecated)</b></summary>
<br>

These were the original web request tests that could be configured within AI. The goal moving forward is to fully transition from these to Standard web tests.

They are very similar to Standard tests but lack some of the features mentioned earlier under the Standard Test paragraph. The plan as of now is to fully retire the URL ping tests by late 2026.

There's a process that allow to easily migrate from URL ping tests to Standard ones by following the article below:
https://learn.microsoft.com/azure/azure-monitor/app/availability-test-migration
</br>
</details>
<details closed>
<summary><b>Multi-step web test (deprecated)</b></summary>
<br>

- This form of web tests has been deprecated the longest.
- It is officially retired this August 31st, 2024.
- It required Visual Studio to create a series of steps with actions around each.
- see: [Multistep web tests - legacy documentation](https://learn.microsoft.com/previous-versions/azure/azure-monitor/app/availability-multistep)
- see: [Types of availability tests - current Learn documentation](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard#types-of-availability-tests)

</br>
</details>


</br>
</details>

<details closed>
<summary><b>2. Create Your Own Test</b></summary>
<br>

--

Follow the public documentation which shows how to create a web test, standard ones are a good way to start, the only mandatory fields are the name to give to the test, and the URL of the application to be tested:

https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests#create-a-standard-test

##Steps for the Standard Test

1. Head to the Azure Portal and choose your application insights resource, expand the 'Investigate' section and click on "Availability":
   - ![image.png](/.attachments/image-d61fae16-e280-4651-a107-55596d19a398.png)

1. Click "Add Standard Test" on the top" and a pop-up window on the right should appear for you to start the configuration as shown in the images below. Do not chose "Add Classic test" as this is a deprecated featured and there should be an effort to educate users to migrate off of these as they will eventually be retired.
   - ![image.png](/.attachments/image-9513b24c-7372-4a4e-bf43-5b87521d41dd.png)
   - ![image.png](/.attachments/image-2ed4c6f5-e668-45cd-9fa6-5c533aabe4da.png)

1. An overview of what each of these values means is in the table shown prior section of this article under "Overview of Web Test Creation", for the sake of this example give a name and a dummy URL (the URL is where the actual application URL is added) and leave the other values at the defaults
   - ![image.png](/.attachments/image-71f9e750-bf50-47be-95e9-65b3068f5e06.png)
   - ![image.png](/.attachments/image-214db9e3-28fd-4f8c-933a-ffa92c667b83.png)

1. At this point a standard web test has been defined with these noted properties
   - Using 5 different locations to test its availability of the site (URL used)
   - Using a frequency of every 5 minutes to hit the URL
   - The test in case of failure result, will retry at least three times before logging it as a failed test 
   - It will check for SSL certificate validity.
   - Alerts are enabled by default
      - meaning a set of users will be notified by alert every time a prescribed threshold of failures is breached. Failures of a test means that it did not meet the *Success criteria* documented in the prior section. However random, transient failures can be expected so the threshold is defined as the number of test locations is **alert location threshold = number of test locations - 2, with a minimum of five test locations**. This effectively means that a set of repeated failures from 1 location is not a concern so no alert will be sent. This is to safeguard from noisy alerting due to the site actually being available generally and only one location is experiencing a random, transient like issue. 

1. Click create, to actually create the alert. It will be enabled by default. 
1. If an Availability test needs to be disabled or edited after it is created, use the appropriate icons found on the test, see the red box:
   - ![image.png](/.attachments/image-f30afbc4-cd88-4cd4-8930-591612959dec.png)


</br>
</details>

<details closed>
<summary><b>3. Test Result Validation</b></summary>
<br>

1. Once the test is created and enabled, the results of the tests will start to be collected in the Application Insight Component, head to the Availability main page and to see the recent test listed there and its results:
   - ![image.png](/.attachments/image-935a7c38-3967-4d49-9f16-8f7ec2a2fb04.png)

1. The information show in this experience is derived from the underlying logs, specifically the *availabilityResults* table. Use the "View in Logs" to go to the Logs experience, a predefined query is used against the same data the portal experience above provided. Commenting or removing the "render" and or "summarize" clauses will provide a more full view of the raw underlying log data responsible for the visuals in the portal experience, as seen below.
   - ![image.png](/.attachments/image-460e0632-ad6c-4ce0-bde5-ca0b9f6ea4f3.png)

1. Click the 'back' button in the browser to return to 'Availability portal experience.
1. Now back in the Availability portal experience, click on a failed tests and drill down by clicking on the bottom right:
   - ![image.png](/.attachments/image-999d35fa-f346-4727-9ee1-f3da7416f9ca.png)

1. Samples will be generated according to the failures, choose one that matches the appropriate time frame:
   - ![image.png](/.attachments/image-53aee53c-5e9b-4b44-9ce5-d117bf4042e3.png)

1. After clicking a specific result, the portal will redirect to the E2E transaction view that allows for a more in-depth analysis of the test result, in this case a 500 was encountered which doesn't match the expected 200:
   - ![image.png](/.attachments/image-6c2c8295-2389-4b9f-9dd8-49ed7493edf1.png)

1. Later sections of this material, it will be shown how CSS can access this same information on a failed execution without asking a user.

</br>
</details>

# Public Documentation
---
- [Application Insights availability tests](https://learn.microsoft.com/azure/azure-monitor/app/availability-overview)
- [Standard test](https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests)
- [TelemetryClient.TrackAvailability Method](https://learn.microsoft.com/dotnet/api/microsoft.applicationinsights.telemetryclient.trackavailability?view=azure-dotnet)

Custom web test:
- [https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions#basic-code-sample](https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions)

Deprecated:
- [Types of availability tests - current Learn documentation](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard#types-of-availability-tests)
- [Monitor availability with URL ping tests](https://learn.microsoft.com/previous-versions/azure/azure-monitor/app/monitor-web-app-availability)
- [Migrate availability tests](https://learn.microsoft.com/azure/azure-monitor/app/availability-test-migration)
- [Multistep web tests - legacy documentation](https://learn.microsoft.com/previous-versions/azure/azure-monitor/app/availability-multistep)

# Internal References
---
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579971/Availability-Tests


---
Last Modified date: 05/07/2024
Last Modified by: brafonso

