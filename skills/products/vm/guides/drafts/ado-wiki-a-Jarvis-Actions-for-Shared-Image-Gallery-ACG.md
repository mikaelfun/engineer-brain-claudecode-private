---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Jarvis Actions for Shared Image Gallery_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FJarvis%20Actions%20for%20Shared%20Image%20Gallery_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.ACG
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Summary

This article gives you details about the Jarvis Logs/Geneva actions for Shared Image Gallery

## Video Walkthrough

[Geneva Actions Video](https://microsoft.sharepoint.com/:v:/t/VMHub/EdabuTPNy5BCgOOtvgCs3jYBFunu-AubRLJ4xGnpzAa6tQ?e=5YqrdV)

## Where do I find Geneva actions/ Jarivs actions for Shared Image Gallery

Go to [Geneva actions](https://jarvis-west.dc.ad.msft.net/)

PIR -> Shared Image Gallery Operations

## List all Galleries in a RG (or) get details of a specific Gallery

You need to have the Region, Sub ID, RG Name & Gallery Name to get details about the gallery. Without the Gallery Name, It will list all galleries in a Resource group

## List Galleries in a Subscription

This will list all the galleries in a subscription, You will need the Region and Subscription

## List details of a Specific Gallery Image (or) list all Gallery images

You will need Region, Subscription, RG Name, Gallery Name, Gallery Image Name.
You cannot get gallery image details without providing the RG, RG is mandatory in this case. If you need to get the details of a specific image, Image name is necessary. But if you need the list of images in a specific gallery, you can ignore Gallery Image Name field

## List Gallery Image Versions and verify Replication Status

You can get gallery image versions from this endpoint and also check replication status
