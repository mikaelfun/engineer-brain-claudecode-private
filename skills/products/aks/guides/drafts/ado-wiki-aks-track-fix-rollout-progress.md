---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Track progress of a fix"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Track%20progress%20of%20a%20fix"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Tracking Rollout Progress of a Fix in AKS

## How to track the progress of a Fix ?

For those who are working on cases where the issue is caused by a bug and for which the customer is waiting for a Fix, I'm sure you've been asked for an "ETA" (Estimated Time of Arrival) on that Fix.

It's never easy to know when a Fix (or even a feature) will be deployed in Azure regions, so this TSG is made to simplify things and try to get this ETA.

But before diving into it, please keep in mind that we can never promise on an exact ETA. bug fixes are like all releases, and they are subject to changes. Our Engineering Teams are developing the fixes and testing them, so it can happen that a Fix is causing a new bug or unexpected behavior, or a breaking change, or something not wanted. In that case, they might have to cancel the rollout of the Fix and delay it, to make further tests & analysis.

So when giving an ETA to a customer, please always tell them that this is tentative date is given as an indication and can never be a committed date from Microsoft. You can ask your TA or an EEE if you need more details.

## Step 1 - get the bug reference

If you're here, that means you're working on a case with a bug. First thing is to get the bug reference. This will usually come from your TA, or an EEE, or you'll find the bug reference in a known issue or an emerging one - or even in that wiki.

For AKS, the bug reference will usually be stored in the **Azure DevOps / MSAzure / CloudNativeCompute** database.

eg. _[Bug 9927172](https://msazure.visualstudio.com/CloudNativeCompute/_workitems/edit/9927172): Cloud provider should not change VMSS capacity on updates to network._

## Step 2 - Get the PR details

Now that we have the bug details, the next step is to find which PR (_Pull Request = code change_) includes the Fix.

Usually our AKS developers will include a list of links to their development work in the right hand side of the bug item. This includes the list of builds including it, but also the Pull Request.

So clicking on the link of the PR will bring you to the details of it. Here, you can see the code changes brought by the developers, on all the files, and you can also check the validations from the bots, and the comments from the other developers to validate the changes.

The important part in the PR here is the Pull Request ID.

## Step 3 - Find the Release containing the Fix

Take the Pull Request ID and search for it directly in the Teams application. Right now, the AKS PG is using Teams to discuss about their releases, and that's how they track the PRs included in them.

Search in Teams channel: **Azure Container Compute / AKS Overlay** and **AKS Overlay Release Manager**

From the release thread, find the links to the Pipelines Releases.

## Step 4 - Check the progress in the Pipelines Releases

The Fix is included in an Official Release which typically includes multiple component releases (e.g. RPHCP, OverlayManager, CX Underlay).

Click on each component release to check the progression in different regions.

**Important notes:**
- Sometimes a release may be canceled and replaced with a new one
- "Canary" or "EUAP" refers to test regions (usually EastUSEUAP)
- It usually takes a few days to be deployed WorldWide after hitting Canary regions

**Quick ETA estimation:** ~10 days from the Sunday after the fix was made.
- If the bug was resolved on May 25th → release starts next Sunday (May 30th) → all regions ~June 10th
- These dates are tentative and given as an indication only

## Extra Step - Check the progress directly in ASI

Azure Service Insights (ASI) tool can retrieve a bug's details and track deployment containing its Fix.

Enter the Bug reference / Work Item ID at: https://azureserviceinsights.trafficmanager.net

## Owner and Contributors

**Owner:** axelg <axelg@microsoft.com>
**Contributors:** axelg, Naomi Priola
