---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/CSS General/MDC CSS: Canned responses for common scenarios"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/CSS%20General/MDC%20CSS%3A%20Canned%20responses%20for%20common%20scenarios"
importDate: "2026-04-06"
type: operational-reference
---

[Error fetching content: Expecting value: line 1 column 1 (char 0)]
[Error fetching content: Expecting value: line 1 column 1 (char 0)]
# MDC CSS: Canned responses for common scenarios

## Guidelines
Use these prepared responses for common issues. You can copy a response and paste it to the email you send to the customer.  
You can change any response to make it yours and to be precise on the specific case in hand.  
[[_TOC_]]

## Responses


### Alerts support 
---
Thank you for contacting us regarding your security alert.

While we don't offer incident response services, our support engineers can help you with any problems you may be experiencing with the security **alerts platform**. These include issues such as confirmed false positives, confirmed false negatives, or problems with the 'Dismiss' feature and missing or wrong alert details.

For investigating security incidents, we recommend that you use your own security teams, one of the services from [Microsoft Security Experts](https://www.microsoft.com/en-us/security/business/services), or a third-party IR service.  
Please let us know if there's anything else we can assist you with.

### Alert reasons and detection requests
---
Also: Why did I get this alert? What's MDC logic/heuristic/detection work?  

>Defender for Cloud does not publish any documentation on how to simulate its detections since the detection logic changes from time to time to balance the need to alert on suspicious activity which is dynamic in nature while reducing flood of alerts due to false positive activity.
We offer some methods to validate that the resource is being monitored and protected as documented in this page: [Alert validation - Microsoft Defender for Cloud | Microsoft Learn](https://learn.microsoft.com/azure/defender-for-cloud/alert-validation)


### Response for Recommendation remediation requests
---
When customer ask you to remediate their MDC recommendations

> Thanks for contacting us with this issue.  
The cloud security posture management (CSPM) features of Defender for Cloud are designed to show you which of your organization's cloud resources have misconfigurations or security issues. When a recommendation shows a resource as "unhealthy" it means the service is doing what it was designed to do: highlighting areas you need to address to improve your security posture.  
All of Defender for Cloud's recommendations contain "Remediation steps" explaining what must be done to configure the resource securely or close the vulnerability. In many cases, they also include a 'Fix' button to help you resolve these issues quickly.  <br>
In all cases, as understood by the shared responsibility model, the process of resolving the issue is the responsibility of the security professionals in your organization or the resource/workload owners.  <br>
Microsoft's support team is always here to help you when things aren't working as designed. <br><br>
For more information about resolving security recommendations, you can use the following resources:  
> - LEARN LINKS
> - DOCS LINKS
> - IN THE FIELD VIDEOS

-------

### Databricks
---
**Question:** We know Databricks are excluded from many (or all) recommendations since they cannot be remediated, as locked resource. Why are we still paying for them?  
**Answer:**  
>With Databricks, there is indeed a limitation on agent-based scenarios (and there is an open discussion with Databricks team to improve the security coverage where applicable), while other scenarios should be covering databricks resources (like network-based detections).
---------

<!--
### Activity Log alert compliance issue - Policy with parameters

We have a known issue or limitation when a policy uses parameters to evaluate different actions under same policy.  

While Azure Policy can process the parameters for evaluation, ASC uses the aggregated state. As a result, a regulatory compliant control that is based on the same policy (same policy definition and ID) but with different parameters, ASC take the worst-case result to display.

For example, these CIS controls 5.2.2 to 5.2.5 are based on the same policy ID with different operations passed as parameters (Create/Delete/Update). While Azure Policy evaluate each parameter, ASC take the negative compliance status for all.
That means that even one assessment is non-compliance, then all the same policy assessments will appear as non-compliant but in Policy some can be compliant.
 
To get “green” control customer must remediate all the assessments under this control (5.2):  
 
![image.png](/.attachments/image-d6d1ffac-ee38-4c5b-9137-150037f0e54d.png)

----
-->

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
