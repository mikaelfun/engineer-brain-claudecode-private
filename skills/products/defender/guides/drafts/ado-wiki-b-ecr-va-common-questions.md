---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Training] - Amazon Elastic Container Registry (ECR) VA/[Product Knowledge] - Common Questions"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTraining%5D%20-%20Amazon%20Elastic%20Container%20Registry%20(ECR)%20VA%2F%5BProduct%20Knowledge%5D%20-%20Common%20Questions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ECR VA - Common Questions

## What about scan-on-push?

This capability will be added at a later stage, by streaming ECR/GCR events into our pipeline as another data source to act on. If needed, a priority-queue pattern will be implemented to give precedence to pushed images over existing ones. Although we don't scan directly on push, please note that the official docs say Scan on push exists within 2 hours (since we trigger scans for all images hourly).

## Why are you running workload on customers environment?

To align with customer feedback and following analysis on compete solutions, we've designed a solution that runs a slim and temporal code inside the customer environment that scrapes images, without extracting them out of customers environment. We're pulling only software inventory data back to Azure, which is small and doesn't contain sensitive data.

## Which vulnerability scanner are you using?

Trivy, which is an open-source scanner widely used by the cloud-native community.

Trivy was originally developed by Aqua but is now open-source software licensed under Apache 2.0 which permits commercial use. Trivy uses vulnerability feeds that are also under various licenses that allow commercial use.

## Which scenarios aren't supported?

1. Images that have at least one layer over 2GB are not scanned.
2. Public repositories and manifest lists are not supported.

## How long does it take to see scan results?

1. Provisioning can take up to 30 min
2. Image scans are triggered every 1 hour

**Exceptions can occur for large amounts of images per account (we have throttling to avoid flooding customer side with too many fargate tasks)**

## Are there any current known issues?
1. Error handling - reason of not applicable image does not show
2. Exemption does not work yet

## How are you using Trivy?
- Trivy is a modular scanner written in Go. It can run in two modes: standalone and client-server.
- The standalone mode scrapes the container image (for its software inventory) and generates vulnerability report against a downloaded vulnerability DB. The client-server mode allows separation of concerns in which the client scrapes the image, and the server generates the vulnerability report out of that scrape.
- In our solution architecture, we're taking a similar approach to the client-server mode. Inside the customers environment we're wrapping Trivy-client components with our own code and running it as an ECS Fargate task. This task will scrape an image and save its results to a storage account from which we will consume the results.
- On the backend side, we're leveraging Trivy-server components to generate the vulnerability report out of the image scrape. After scraping an image once, we can save this data on our side and use it to frequently calculate its vulnerability report, without having to scrape it again in the customers account.
