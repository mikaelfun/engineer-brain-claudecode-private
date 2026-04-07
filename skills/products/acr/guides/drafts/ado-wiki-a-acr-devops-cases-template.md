---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Case Flow/ACR -DevOps Cases template To request data"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Case%20Flow%2FACR%20-DevOps%20Cases%20template%20To%20request%20data"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR DevOps Case Template — Data Collection

Use this template when Azure DevOps (as the main product) interacts with ACR for images used in pipelines and the pipeline is failing.

## Data to Collect from Customer

1. **What are the DevOps organization and Project** where the pipeline is failing? Is this failing in other organizations or projects?

2. **Webhook configuration** — If possible, attach screenshots of the Trigger and Action tabs and advise when the pipeline will trigger.

3. **Pipeline run data** — Collect information from:
   1. A **successful** run of the pipeline
   2. The run containing the **first instance of the problem** (if possible)
   3. One run demonstrating the problem with **`system.debug` set to true**

      > To run a pipeline with system.debug: [Review logs to diagnose pipeline issues](https://docs.microsoft.com/en-us/azure/devops/pipelines/troubleshooting/review-logs?view=azure-devops#:~:text=Pipeline%20logs%20provide%20a%20powerful,the%20logs%20for%20that%20task.)

   4. How many times has this failed? Is it sporadic, or all runs?

   **For each of those runs, collect:**

   * URL of pipeline results: `https://dev.azure.com/<org>/<project>/_build/results?buildId=<id>&view=results`
     If URL is unavailable, provide:
     - Project name
     - Pipeline name
     - Run / Build / Release ID

   * Screenshots of the recent pipeline runs

   * Zip file containing any downloadable pipeline logs from the run

4. **Pipeline definition logs:**
   * If using **YAML pipelines**: attach the final YAML by clicking "Download full YAML" in the "..." menu of the pipeline editor view
   * If using **designer (non-YAML) pipelines**: export the JSON for the failing pipeline definition (at the version active at first failure) and attach to the case
