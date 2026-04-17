---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/IAPP/Re-tagging Support Cases"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FIAPP%2FRe-tagging%20Support%20Cases"
importDate: "2026-04-06"
type: process-guide
---

# Re-tagging Support Cases

## Overview
The skill re-tagging process is for SMEs and TAs with deep technical knowledge. It explains how ML skill models work and how to manage/correct predictions.

## How ML Skill Models Work
1. **Training Data**: Models trained on customer verbatims + correct skill outputs
2. **Prediction**: New cases analyzed, most relevant skill predicted
3. **Evaluation**: Separate dataset used to assess accuracy/precision/recall
4. **Improvement**: Fine-tuning/retraining based on evaluation

## Purpose of Skill Retagging
- Provides feedback to models on performance
- Re-tagged cases generate suggested training data in VDM
- SME team should review all retagged cases for accuracy

## Where to Re-tag
- Directly in CRMGlobal
- Use custom view filtering by Line of Business, Support Region, Support Pod

## Potential Issues with Predictions
- **Data Quality**: Incomplete/noisy/biased data leads to inaccurate predictions
- **Skill Model Configuration**: Incorrect SAP associations cause wrong predictions

## Process
For step-by-step instructions: see IAPP Wiki retagging process page.

## What Next
Re-tagging generates Suggested training records for CoE review and model retraining.
