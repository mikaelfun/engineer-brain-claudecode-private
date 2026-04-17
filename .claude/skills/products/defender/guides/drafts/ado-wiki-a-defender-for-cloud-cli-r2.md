---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for DevOps/[TSG] - Defender for Cloud CLI"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Defender%20for%20DevOps/%5BTSG%5D%20-%20Defender%20for%20Cloud%20CLI"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Guide
---------------------
### Owners

Dfd Core Team - [msdo-dev-team@microsoft.com](mailto:msdo-dev-team@microsoft.com)

# Overview

The MSDO CLI enables users to perform security scans (currently, only Trivy is supported) within popular CI/CD tools. Once the scans are completed, the results are automatically pushed to Microsoft Defender for Cloud (MDC). Within MDC, users can review the security results for each pipeline and see how they correlate with runtime containers. Key features include:

*   Authentication with MDC Backend: Securely authenticate with MDC using application registration in Microsoft Entra ID.
*   CLI Integration for Popular CI/CD Tools: Seamlessly integrate the CLI with tools like Jenkins, Bitbucket, and more.
*   Container Security Scans: Run Trivy-based container security scans directly from the command line, with results displayed in the terminal and pushed to MDC.
*   Review Results in MDC: Access detailed security scan results within MDC.
*   Correlation with Runtime Containers: View the correlation between security scan results and runtime containers within MDC.

# Authentication

The MSDO CLI feature enables authentication with Microsoft Defender for Cloud (MDC) by creating an application registration in Microsoft Entra ID. This integration allows programmatic authentication to Defender for Cloud from CI/CD pipelines. Users need to provide the directory (tenant) ID, application (client) ID, and authentication key within their pipeline configuration to authenticate successfully. The CLI reads environment variables to pass this to the backend of MDC.

# Trivy

Trivy is an open-source security scanner developed by Aqua Security. Trivy is a powerful and versatile security scanner that provides comprehensive vulnerability detection and reporting. Its ease of use and integration capabilities make it a popular choice among developers and security teams, despite some of its limitations. It is designed to detect vulnerabilities in containers and other artifacts such as file systems and Git repositories. Trivy uses an internal database called trivy-db, which contains information about various vulnerabilities sourced from multiple vulnerability databases, including the National Vulnerability Database (NVD), Red Hat Security Data, and Alpine SecDB

Users utilize Trivy for several reasons:

1.  Vulnerability Detection: Trivy scans for vulnerabilities within software packages, container images, and other artifacts. It identifies security issues and provides detailed information about the severity, affected versions, and potential fixes
2.  Comprehensive Scanning: Trivy not only scans for vulnerabilities but also detects misconfigurations, hard-coded secrets, and license compliance issues.
3.  SBOM Generation: Trivy can generate Software Bill of Materials (SBOM), providing a detailed inventory of all components used in software, including open-source and third-party libraries
4.  Reliability and Speed: Trivy is reliable and fast, making it suitable for use in various environments, including CI/CD pipelines
5.  Wide Range of Vulnerability Databases: Trivy accesses multiple vulnerability databases, ensuring comprehensive coverage of potential security issues
6.  Automatic Database Updates: Trivy updates its vulnerability database every six hours, ensuring that users always have the latest information without manual intervention
7.  Detailed Reporting: Trivy provides detailed reports on vulnerabilities, including severity levels, affected versions, and remediation suggestions
  

## Disadvantages of Trivy

1.  Resource Intensive: Trivy can be resource-intensive, especially when scanning large container images or complex environments
2.  Limited In-Cluster Detection: The Trivy CLI cannot detect changes in in-cluster, running resources. For this reason, the Trivy operator is often recommended for more comprehensive cluster scanning
3.  Potential for Too Many Requests: Users may encounter issues with too many requests when using Trivy, which can impact the scanning process
4.  Dependency on External Databases: Trivy relies on external vulnerability databases, which means that any issues with these databases can affect the accuracy and completeness of the scans
  

# MSDO CLI Key logging signs
--------------------------

Note: all of these appear in the build logs outputted by MSDO on the agent.

*   `MDC: Authenticated to Microsoft Defender for Cloud.` - if you see this, the authentication has worked, and MSDO should be ready to work with the auth push flow
*   `Missing token fetch permission to send results to Microsoft Defender for Cloud` - on Github, the repository is probably not onboarded properly. Look into whether or not connector onboarding completed properly
*   `DfdPublisherController.Initialization - Blob upload credential url not valid` - the returned SAS URI from global router wasn't valid. Continue to investigate into global router logs
*   `Remote policy file contents not returned from get context - either it was disabled or the fetch failed` - if this repository is setup to also fetch policy from global router, look into global router logs because something failed on that end
*   `Sarif path or ResultUploader not valid` - validate the logs outputted from the MSDO agent when MSDO was launched, since it's likely that the correct CLI option wasn't set. Specifically, `--publish-file-folder-path` is likely to be missing or mangled
*   `MDC: Security findings pushed to Microsoft Defender for Cloud successfully.` - This means that the results were successfully pushed to MDC.
  

# Reviewing Results

Once the pipeline runs successfully as indicated in the MSDO CLI key logging signs section above, the results will be pushed to Cloud Map and can be accessed with the below query on the scope the data was pushed to.

Note: It could take up to 12 hours before this data is available, the CI/CD pipeline (group) query is available almost immediately

![==image_0==.png](/.attachments/==image_0==-19e0abc1-9643-4cff-88c3-87f0a13b4c3f.png) 

*   To see the CVE mapping, you can extend the query to look like below

![==image_1==.png](/.attachments/==image_1==-b9b83667-5529-42e1-9fab-c2bd186a6b7a.png) 

### Correlating with Monitored Containers

If you want to correlate the published results with monitored container, the query needs to be modified to below

![==image_2==.png](/.attachments/==image_2==-4100723a-a890-47d5-a180-32b840e8c4e9.png) 

# Troubleshooting

*   Unable to create Integration: Verify that user has Security Admin permission on the subscription, you need this permission to perform any write action in the Microsoft.Security RP.
*   Invalid Credentials: If you do not see this log line in the pipeline run `MDC: Authenticated to Microsoft Defender for Cloud.`, it indicates some authentication issue. That could mean that the environment variables have not been configured correctly. Ensure that the Tenant ID, Client ID, and Client Secret are correctly entered in the pipeline configuration with the names GDN_MDC_CLI_TENANT_ID, GDN_MDC_CLI_CLIENT_ID, GDN_MDC_CLI_CLIENT_SECRET respectively.
*   Environment Variables: Ensure that the correct names are being used and set in the CI/CD pipeline.
*   Permission Issues: Verify that the application registration has the necessary permissions & their role hasn't changed to access Defender for Cloud. The application registration can be found in the Entra ID page using the Client ID provided during integration creation.
*   Network Connectivity: Ensure that the CI/CD environment has network access to the Microsoft Entra ID and Defender for Cloud endpoints.
*   CI/CD support. Ensure that the CLI is supported by the CI/CD tool that the user is executing from.
*   Results not Showing. There can be up to a 24-hour delay for results to be correlated with monitored containers. If no data is shown after this time, please ask customers to share the Client ID, Subscription ID, and UTC time pipeline was run for further investigation using the application logs.

The Client ID as well as Time will be used to investigate if any message was received in the backend from any pipeline configured with it

![==image_3==.png](/.attachments/==image_3==-5634176d-565b-4ac8-9168-7b01023ac19d.png) 

Once the message is confirmed to be received, the E2E flow of the ingestion can be validated from the performance tab of app insights, using the BlobReplicator

![==image_4==.png](/.attachments/==image_4==-f5664e9e-f2eb-4036-bc5e-2fec231d626f.png) 

The E2E trace should indicate that data was sent to map V2 and ths resource ID should also be validated to contain the right subscription ID

![==image_5==.png](/.attachments/==image_5==-4e4d6efa-c4f1-4b99-a323-295c8964138a.png) 

### Coming Soon to Help

--debug flag to help diagnosis any issues within the CLI

### References

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
