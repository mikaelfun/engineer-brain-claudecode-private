---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/UEBA&Notebooks/Quick Guide: Verifying UEBA Anomalies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Before concluding that UEBA (User and Entity Behavior Analytics) isn't producing any anomalies, it's essential to follow these steps to ensure everything is configured correctly and allow sufficient time for results to appear:


1. Wait for Adequate Time: After enabling UEBA and anomalies, it's important to be patient. Allow at least 2 weeks for the system to collect sufficient data and identify potential anomalies. 
2. Verify Anomaly Settings: 

* Navigate to the "Settings" blade in your Sentinel platform 

* Confirm that the �Anomalies� enabled. Refer to the image below for guidance:

  ![image.png](/.attachments/image-d9af6c44-a3a3-4f86-b6e5-4830c42131f8.png)

3. Check Analytics for Specific Rule: 

* Once you've verified the settings, go to the "Analytics" section in your UEBA platform. 

* Look for the specific rule or behavior pattern you're interested in monitoring, and verify it�s enabled. Refer to the image below: 

  ![image.png](/.attachments/image-c568fc9a-6707-4a2b-b6bf-1224b38e6b25.png)

4. Validate BehaviorAnalytics Table: 

* Ensure that the "BehaviorAnalytics" table has been created and is populating with data. This table is where UEBA stores the events and activities it analyzes, prior to anomaly detection. 

* Search for the event or behavior pattern you're concerned about within the "BehaviorAnalytics" table. This will give you insights into whether UEBA has detected any of those activities.

  ![image.png](/.attachments/image-61a162fe-3c85-46eb-abbe-654aaba3d1af.png)


5. Further Investigation: 

* If, after following the above steps, you still cannot find any anomalies or the desired results, it's time to conduct a more detailed investigation. Possible issues could include misconfiguration, inadequate data, or issues with data ingestion.  

 

Remember that UEBA is a powerful tool, but it may take time to learn and adapt to the behavior of your users and entities. Be patient, and thorough investigation will help you get the most out of your UEBA solution. 


|Contributor Name|  Details|  Date|
|--|--|--|
| Yaron Sahar| Created this section | 13/9/2023 |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

