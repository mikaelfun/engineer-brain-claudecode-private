---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLs Setup Guide - Hub and Spoke Networks Private Link Design/What is Hub and Spoke?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/AMPLS%20(Azure%20Monitor%20Private%20Link%20Scope)/Learning%20Resources/Training/Course%20Materials/AMPLs%20Setup%20Guide%20-%20Hub%20and%20Spoke%20Networks%20Private%20Link%20Design/What%20is%20Hub%20and%20Spoke%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Overview

How to set up a basic Hub and Spoke network. Hub and Spoke design is probably the most common design used by customers. Understanding what the design is and how it is properly configured will help in troubleshooting issues involving it.

## What is Hub and Spoke Network topology?

The **Hub** network contains the Azure Monitor Private Link Scope (AMPLs) connection, which centralizes access to Azure Monitor resources for all connected **Spoke** Virtual Networks (VNETs).

By centralizing the Azure Monitor Private Link Scope (AMPLs) connection in the hub, you reduce the need for multiple Private Link Scope configurations in each spoke. This minimizes redundancy and simplifies the overall network architecture.

## How it varies from the Standard (Decentralized) Setup?

The Hub and Spoke model centralizes access control and resource management, while the Standard Setup is more decentralized.

- **Standard Setup**: Each VNET (Spoke) has its own Azure Monitor Private Link Scope (AMPLs) configuration, leading to decentralized access control. Multiple AMPLs configurations can increase costs due to additional management overhead.
- **Hub and Spoke**: Centralized AMPLs configuration in the Hub VNET, shared across all Spokes via VNET Peering. Reduces redundancy and simplifies management.

## Public Documentation

- [Hub and Spoke Private Link Design](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/private-link-design#hub-and-spoke-networks)
