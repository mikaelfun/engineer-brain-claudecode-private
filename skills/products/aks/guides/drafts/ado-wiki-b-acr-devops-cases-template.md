---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Case Flow/ACR -DevOps Cases template To request data"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Case%20Flow%2FACR%20-DevOps%20Cases%20template%20To%20request%20data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACR DevOps Case Template

Here is a template sample to request information in those cases where Azure DevOps as main product interacts with ACR for images to be used in the pipelines.

1. What are the DevOps organization and Project where the pipeline is failing? Is this failing in other organizations or projects?

2. Can you provide us the configuration of the webhook? If possible, attach screenshots of the Trigger and Action tab and advise when the pipeline will trigger.

3. Collect information from a few pipeline runs and provide information where applicable:
   1. A successful run of the Pipeline
   2. The run containing the first instance of the problem (if possible)
   3. One run demonstrating the problem with `system.debug` set to `true`

      To run a pipeline with system.debug please follow our documentation here: [Review logs to diagnose pipeline issues - Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/troubleshooting/review-logs?view=azure-devops)

   4. How many times has this failed? Is it sporadic, or all runs?

      **For each of those runs, collect:**

      * URL of pipeline results: `https://dev.azure.com/<org>/<project>/_build/results?buildId=<id>&view=results`

        If you cannot get the URL, please provide:
        - Project name:
        - Pipeline name:
        - Run / Build / Release Id:

      * Screenshots of the recent pipeline runs
      * Zip file containing any downloadable pipeline logs from the run

4. Pipeline definition logs:

   * If using **yaml pipelines**: attach final yaml by clicking "Download full yaml" in the `...` menu of the pipeline editor view.
   * If using **designer (non-yaml) pipelines**: please export the JSON for the failing definition (at the version active at first failure) and attach to the issue.

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
