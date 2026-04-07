---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Windows 365 Training/Endpoint Analytics/Remoting Connection Report"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FWindows%20365%20Training%2FEndpoint%20Analytics%2FRemoting%20Connection%20Report"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Remoting connection report on Endpoint Analytics

This report is available on the MEM portal for customers with Cloud PC licenses in their tenant.

Remoting connection report on Endpoint analytics helps IT monitor key performance metrics for connecting to the cloud PCs and shares insights on how it impacts user connectivity.

There are two metrics we provide in this report:
1. Cloud PC Sign in time (sec) provides the total time users take to connect to the cloud PC
2. Round Trip Time (ms) provides insights on speed and reliability of network connections from the user location

## Getting started guide

Enroll your device to Endpoint analytics Quickstart - Enroll Intune devices - https://learn.microsoft.com/en-us/mem/analytics/enroll-intune

There are four pages in Resource perf report on Endpoint analytics:
A. Landing page: Remoting connection
B. Model performance page
C. Device performance page
D. Device history page

## A. Landing page: Remoting connection

1. Average round Trip Time (ms) provides insights on speed and reliability of network connections from the user location
2. Average cloud PC Sign in time (sec) provides the total time users take to connect to the cloud PC
3. Daily metric trend (30 days) helps you get a trend of your average Cloud PC round trip time and cloud PC sign-in time. You can use the drop down to select cloud PC round trip time or sign in time
4. Insights and Recommendations provide insights on the number of devices that have above average cloud PC round trip time and cloud PC sign in time.

**Key thresholds:**
- Round trip time is characterized as high if equal to or higher than **200 ms**. Devices above the threshold are identified under insights
- Cloud PC sign-in time is characterized as high if equal to or higher than **60 sec**. Devices above the threshold are identified under insights

**Average cloud PC sign in time deep link provides** the breakdown of the time it takes users to connect to their cloud PCs. Some phases happen rarely, like Core Boot sign in time as Cloud PC is always available to users.

**Cloud PC sign in phases:**
a) **Remoting sign in time:** Time from when user clicks on cloud PC client to when cloud PC sends user login and credentials to the cloud PC machine
b) **Core Sign in time:** Average time it takes to get to a responsive desktop after a user signs in. Excludes new user sign in and first sign in after a feature update
c) **Core Boot:** Time taken to reach the sign in prompt after a device is turned on. Excludes OS update time. This phase may not occur at all times with cloud PCs

## B. Model performance page

Review the Cloud PC round trip time and Cloud PC sign in time and also get the option to include the phases:
1. Filter by device count to see how many devices you have by the SKU types.
2. Filter by Cloud PC round trip time or Cloud PC sign in time to see if a particular SKU type in your organization is facing issues.

## C. Device performance page

Get visibility to Cloud PC round trip time and Sign in time at the device level.

## D. Device history page

Click on any device to see the history of cloud PC sign in time and round trip time to see if this device has been facing issues over time.
