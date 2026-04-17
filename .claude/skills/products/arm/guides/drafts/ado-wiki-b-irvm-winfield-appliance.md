---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Infrastructure Role Virtual Machine (IR VM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Infrastructure%20Role%20Virtual%20Machine%20(IR%20VM)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#IRVM(WinfieldAppliance)inAzureLocalDisconnectedOperations(ALDO)

##Overview
The**InfrastructureRoleVirtualMachine(IRVM)**previouslyknownasthe**Winfieldappliance**isthecorecomponentofthe**AzureLocalDisconnectedOperations(ALDO)**controlplane.Itdeliversa**customer-deployableAzureARMcontrolplane**inavirtualmachine,enablinglocalAzureArcandHCIservices**withoutanyconnectiontotheAzurepubliccloud**.

Thisapplianceisdesignedfor**air-gappedenvironments**wheresecurity,secrecy,andregulatoryconstraintsprohibitcloudconnectivity.Itprovidesa**fullylocalAzureexperience**,includingtheportal,CLI,andAPIs.

---

##KeyFunctions
-Hoststhe**localcontrolplane**forAzureLocal
-Enables**AzureArc-poweredservices**:
-AzureResourceManager(ARM)
-Role-BasedAccessControl(RBAC)
-ManagedIdentity
-Arc-enabledVMsandKubernetesclusters(AKS)
-AzureKeyVault,Policy,andContainerRegistry
-SupportsVMandcontaineroperations**offline**,withfullparitytoAzureAPIs

---

##ArchitectureNotes
-TheIRVMisdeployedasa**clusteredvirtualmachine**onaphysicalHCIcluster
-Itispackagedasa**largeVMappliance**thatincludesallbackendservices
-Theapplianceis**self-contained**and**isolated**CSSsupport**cannotaccessormodify**itsinternalsundersupportedscenarios
-Thisdesignensures**securityandintegrity**,especiallyforsovereignandclassifiedworkloads

---

##DeploymentChecklist

###HardwareRequirements
|Component|MinimumRequirement|
|--------------------|-----------------------------|
|Nodes|3physicalmachines|
|Memorypernode|64GB|
|CPUcorespernode|24physicalcores|
|Storagepernode|2TBSSD/NVME|
|Bootdrive|480GBSSD/NVME|
|Network|Switchless(3-nodeclusters)orswitched|

###IntegrationRequirements
-**ADFSonWindowsServer2022**forOpenIDConnect(OIDC)authentication
-**LDAP**forgroupmembershipandsynchronization
-**ActiveDirectory**forRBACandportalaccess

---

##OperationalNotes
-TheIRVMis**convertedtoaclusteredVM**duringdeploymentandmovedtoclusterstorage
-A**thinlyprovisioned2TBinfrastructurevolume**iscreateddonotmodifythisvolume
-**Networkswitchnamesandconfigurations**mustmatchportalentries
-**Virtualdeploymentsarenotsupported**onlyphysicalhardwareisallowed

---

##SupportabilityConstraints
-TheIRVMistreatedasa**blackbox**byCSSsupportteams
-Undersupportedscenarios,**CSScannotcrackopenorinspect**theapplianceinternals
-Alldiagnosticsandtroubleshootingmustbeperformedusing**externallogs,telemetry,andsupportedinterfaces**

>IftheWinfieldapplianceVM(`IRVM01`)isdisconnected,offlineduetofailure,orotherwisenotabletouploaddiagnosticdatadirectly,thereisafallbackloggingprocessthatcanbeused.
>Fordetails,seetheinternalwiki:https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/1623842/Fallback-Logging

---

##BestPractices
-Planfor**extracapacity**tohostworkloadsalongsidetheIRVM
-Maintain**offlinedocumentation**fortroubleshootingandrecovery
-Use**AzureCLIorportal**forVMoperationstoavoidsyncissues
-Avoidtamperingwithinfrastructurevolumesorclusterconfigurations

---

##HistoricalContext
-TheIRVMwasformerlyreferredtoasthe**Winfieldappliance**duringearlydevelopmentandpreviewphases
-Itwasalsointernallyknownas**Arc-Autonomous**,reflectingitsroleindeliveringAzureArcservicesindisconnectedenvironments