---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Provisioning Overview"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Provisioning%20Overview"
importDate: "2026-04-21"
type: guide-draft
---

[[_TOC_]]

# Provisioning Workflow
Basically, assignment is a 3-tuple of (user Id, policy id, license type). 

For a given user, policy change or license change may trigger different types of provision requests, according to the device’s provisioning states.  

![Provisioning Workflow](/.attachments/image-466383f9-04b7-4642-a3d6-1135ba94ab11.png)

# Provisioning State Transition 

![Provisioning State](/.attachments/image-f46d0869-2e3b-4826-9d94-fc71bdbb8ede.png)

## CPC provisioning states: 

`None`: no record in DB or it’s deleted. 

`Licensed`: the user is licensed but no policy assigned. 

`Provisioned`: the device is provisioned and is available to use. 

`InGracePeriod Reprovision`: the device is in provisioned state but will be reprovisioned after grace period expiry. 

`InGracePeriod Deprovision`: the device is in provisioned state but will be deprovisioned after grace period expiry. 

`InGracePeriod Delete`: the device is in provisioned state but will be deleted after grace period expiry. 

`Pending`: the workspace will go to Provisioning State when quota is available 

## Equivalent states: 

`Deprovisioned`: Licensed, the last state is Deprovisioning 

`DeprovisionFailed`: Provisioned, the last state is Deprovisioned, not consistent with License Policy configuration 

`Upgraded`: Provisioned, the last state is Upgrading  

`UpgradeFailed`: Provisioned, the last state is Upgrading, not consistent with License Policy configuration 

`ProvisionFailed`: Licensed, the last state is Provisioning, not consistent with License Policy configuration 

`ReprovisionFailed`: Provisioned, the last two states are Reprovsion and Provisioning, last action is failed but consistent with License Policy configuration 

`Restored`: Provisioned, the last state is Restoring 

`RestoreFailed`: Provisioned, the last state is Restoring, last action is failed but consistent with License Policy configuration 

## Transient states: 

`Provisioning`:  From Licensed to Provisioned 

`Upgrading`: From Provisioned to Provisioned triggered by upgrade process 

`Deprovisioning`: From InGracePeroid Deprovision to Deprovisioned or From InGracePeroid Delete to None 

`Restoring`: From Provisioned to Provisioned triggered by restore action 

# Grace Period 

[Grace Period Matrix ](https://microsoft.sharepoint-df.com/teams/IntuneSuzhouTeamDiscussion/_layouts/15/Doc.aspx?sourcedoc={eebcede3-8656-43a4-8fec-d41054184a7e}&action=edit&wd=target%28Chunyuan%27s%20Team%2FRMS.one%7Cc29c74df-57f3-42f1-8a1e-ec36da6e041e%2FGrace%20Period%20Matrix%7Cd772e800-5240-47a4-8f75-e85644609ffb%2F%29&wdorigin=703)

|Scenario|Length|
| ------------ | ------------ |
|Grace Period for Reprovision | Enterprise(7d), VSB(1d)|
|Grace Period for Deprovision |Enterprise(7d), VSB(1d) |
|Grace Period for Delete |Enterprise(7d), VSB(1d) |
|Grace Period for Fraud Block |Enterprise(7d), VSB(3d if used, 1d never used) |
|Grace Period for Guard Rail  |15d (in don’t touch list)| 

# Resize (Upgrade/Downgrade) 

Resize Workflow

![Resize Workflow](/.attachments/image-d6350f9a-7c57-4990-9664-6ea95063164b.png)



