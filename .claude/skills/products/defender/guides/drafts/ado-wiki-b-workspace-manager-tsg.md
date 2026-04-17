---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Workspace Manager/[TSG] - Workspace Manager"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Workspace%20Manager/%5BTSG%5D%20-%20Workspace%20Manager"
importDate: "2026-04-07"
type: troubleshooting-guide
---


[[_TOC_]]

# Introduction

Up to date workspace manager TSWGs can be found in [TSG for Sentinel Workspace Manager](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/usx-core/sentinel-us/tsg-for-sentinel-workspace-manager)
The content of the TSGs is reported here below so they can be searched in this wiki (24/01/2025).

#FAQ

##WorkspaceManagersetupandarchitecture

**1.CanaMicrosoftSentinelworkspace(Member)belinkedtomultipleWorkspaceManagers?**
>Yes,thisisintendedtosupportflexibleco/multi-managementscenarios(eg.CompanyXhasworkspaces1-5,theygetacquiredandtheGlobalCompanyYSOCwhichnowmanagesworkspaces1-10,andworkspaces8-10aremanagedbyanMSSP)

**2.CanaWorkspaceManagerbeaMemberofanotherWorkspaceManager?**
>Yes,thisisintendedtosupportanN-tiermodelofmanagement(Member->Central/parent->grandparent->greatgrandparent->->great-Ngrandparent)

**3.DoesaWorkspaceManagerneedtobeinthesametenantastheMicrosoftSentinelMemberworkspaces?**
>No,youcanprovisionaWorkspaceManagerMicrosoftSentinelinstanceinTenantAthatmanagesMemberMicrosoftSentinelworkspacesinTenantsB,C,D,

**4.WhathappensifaMemberworkspacegetsentirelydeleted?**
>Whetherit'sahardorsoftdelete,thedeletedMemberworkspacewillshowupundertheWorkspaceManager<Members>tabwithawarning''toindicatetheunderlyingMemberworkspacehasbeendeleted(weintentionallydidn'twanttoauto-remove),theuserwillneedtoselectthedeletedworkspacesandclick"remove".

AsimilarwarningwillappearinaGroupdefinitionthatreferencesadeleted/removedMemberworkspace.

##Pre-requisitesandPermissions

**5.DoIstillneedAzureLighthouseforcross-tenantcapabilities?**
>Yes,AzureLighthouseisstillourconduitforcross-tenantaccess,WorkspaceManagerprovidesadditionalMicrosoftSentinelmanagementcapabilitiesontopofAzureLighthouseforcross-tenantscenarios.

**6.Whatpermissions(ontheCentral/Parentworkspace)arerequired?**
>AMicrosoftSentinelContributorwillbeabletoenable/disableanduseWorkspaceManageronaMicrosoftSentinelworkspace.Wehavetheexplicitaction/permissionpreparedandwillreviewwithcustomers(anddiscusswithRBACPM)onhowtheBuiltInrolesshouldbeadjusted.

**7.Whatpermissions(ontheMemberworkspaces)arerequired?**
>AllactionsarevalidatedinUser/SP/Callercontext,inordertoPublishcontentitemstoaMemberworkspace,MicrosoftSentinelContributor(ortheequivalentpermissionsandactionsinacustomrole)rightsontheMemberworkspacewillberequired.

##DefiningGroups

**8.WithinaWorkspaceManager,canaMemberWorkspacebelongtomultipleGroups?**
>Yes,thisistoenableflexiblemanagementpermutations.

**9.MustaGrouphavemultipleMemberWorkspaces?**
>No,aGroupcanconsistofzero,oneormoreMemberWorkspaces.

**10.MustaGrouphavecontentitemsassigned?**
>No,aGroupcanbedefinedwithoutanycontentitemsassigned.

##ContentItemStagingandPreparation

**11.MustacontentitembedeployedintheCentral/ParentworkspaceforittobepublishabletotheMemberworkspace(s)?WouldthiscreatenoiseintheCentral/Parentworkspace?**
>Yes,acontentitemmustbedeployed(enabled/disabled)intheCentral/Parentworkspaceforittobepublishable.Ifthecontentitemisdisabledandpublished,itwillbedeployedintheMemberworkspace(s)asdisabled.WedonotanticipatethistobenoisyasaCentral/Parentworkspacecanbeacompletelyemptyone(nodata,justacontainerholdingcontentitems)oronethatisusedfordev/staging(ie.minimaldataingestedjustforpre-prodtesting).

**12.HowcanIcustomizerulesperMemberworkspace?**
>Parameterizationisaroadmapitem.

##DeletionBehavior

**13.CancontentitemdeletioninMemberworkspacesbedone?**
>ThisissupportedviaAPIbutnotbytheUIyet(weappreciateanyfeedbackonhowthiscanbebestsurfacedintheUI).

**14.IfaMemberworkspaceisoffboardedfromWorkspaceManager,whathappens?**
>OffboardingdoesnotrefertothedeletionoftheMemberworkspace,itwillcontinuetoexist(whereveritis)butwillnolongerbemanagedbytheWorkspaceManagerallGroupswillbeautomaticallyupdated(ie.TheMemberworkspacewillberemovedfromanyexistingGroupdefinitions)

**15.WhathappenswhentheCentral/Parentworkspacegetsdeleted?**
>TheCentral/ParentworkspacegetsdeletedasanyregularMicrosoftSentinelworkspacewould,anycontentthatwaspublishedtoMemberworkspaceswillremainlocallyintheMemberworkspace.

**16.WhatdoesdisablingWorkspaceManagerdo?**
>TheWorkspaceManagerbladewillnolongerappear,andthebackendwillreturnbadrequestresponsestoanyattemptstocallanyAPIotherthanworkspaceManagerConfiguration(whichisusedtoenable/disableWorkspaceManager).

##APIs

**17.ArethereanyservicelimitsfortheWorkspaceManagerAPIs?**
>Therearecurrentlynoknownlimits,ifyoudoencounteranypoorperformanceorerrorsduringloadtesting,pleasereachouttous.RegularMicrosoftSentinelservicelimitswillapplyasusual.

##WhentousetheFeatureandBetterTogetherScenarios

**18.HowdoesWorkspaceManagerworkwithContentHub?OrRepositories?**
>RefertotheWorkspacemanagerBetterTogetherScenariosslideinthepdfincludedinthezipfileaccompanyingthispreview.

**19.WhenshouldIusecustomCI/CDorAPIsorRepositoriesorWorkspaceManager?**
>RefertotheWhichfeatureshouldIuse?slideinthepdfincludedinthezipfileaccompanyingthispreview.

#ForceExitStuckJob

**ErrorReceived:** Conflict:Ajobiscurrentlyrunningundertheassignment

**ReproSteps:**

-CreateGroup_AwithChildws_AandPublishsomecontent

-WhileGroup_Ais"Inprogress"state,deleteChildws_A
- Thisresultsin"orphanedjobs"andsincetherunningjobcan'tbedeleted(orcompleted),Group_Acannotbedeleted/exited==userisstuckinadeadlock

*Note:Rarebutthismightalsooccurinaraceconditionscenario- Childws_AbelongstomultipleGroupsandmultiplePublishesarebeingattemptedonthesameChildws_A*

**Resolution**

-DeletetherunningJobviaAPI

#RGnameDidNotMatchRGMoved

**ErrorReceived:** Foralertrule(BuiltInFusion)givenresourcegroupname(Prod)didnotmatchwiththeworkspacemanagerresourcegroupname(production).

*ReproSteps:**

-ParentWSwasinRG1,itwasmovedtoRG2

-EnabledWsMgronParentWS

-CreatedaGroupandaddedContent,couldnotCreate/Save(errorabovereceivedforFusionandotherrules)

**Resolution:** 

-ThisisaknownandpubliclydocumentedSentinelbehaviourwhenaworkspaceismovedtoadifferentRG([MoveaLogAnalyticsworkspaceinAzureMonitor-AzureMonitor|MicrosoftLearn](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/move-workspace)),ruleIDsdonotauto-updatetoreferencethenewRG

-**Resolution:**
- (A)Disableandenable;
- or(B)editandsave;
- or(C)deleteandrereate,allAnalyticsRulesintheWorkspaceManagerSentinelworkspacethatwasmovedbeforeresumingactivityinWorkspaceManager

#CustomerFacingErrorMessages

##[A]JobExecutionErrors

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|A1|"Encounteredanerror(jobexecutionfailure).Pleasetryagain."|Thismessagearisesfromanissueinthebackendduringjobexecution.ThishasbeenseensofarwhenwemakeanARMrequestwithabadpath.|
||A2|"Unabletolocatethefollowingmembers:{listOfNotFoundMembers}.PleasecheckthattheworkspaceshavebeenonboardedasmemberstoWorkspaceManager."|SomeMembersthattheassignmentreferstowerenotfound|
||A3|"Unabletolocatethefollowingmembers:{listOfNotFoundMembers}.PleasecheckthattheworkspaceshavebeenonboardedasmemberstoWorkspaceManager."|NoneoftheMembersthatareincludedintheassignmentwerefound|
||A4|"Encounteredanerror,thefollowingGroupwasnotfound:{groupResourceName}."|GroupthattheAssignmentpointstodoesnotexist|
||A5|"Encounteredanerror,thefollowingAssignmentwasnotfound:{assignmentResourceName}"|AssignmentthattheJobpointstoisnotfound|
||A6|"Encounteredanerror(jobexecutionfailure).Pleasetryagain."|WhenparsingresponsecontenttoJObject.Edgecase,unlikelytohappen.|
||A7|"Encounteredanerror(jobexecutionfailure).Pleasetryagain."|Whennon-retryableexceptionsthrowntryingtoprocessmessage|
||A8|"Encounteredanerror(jobexecutionfailure).Pleasetryagain."|Whenexceptionsthrowntryingtoprocessmessage|
||A9|"Failedtopublishtotargetworkspace.Targetworkspacenotfound.Pleaseverifythattheworkspaceexists."|Childworkspaceisdeletedandnolongerexists|
||A10|"Failedtopublishcontentitemsduetoinsufficientuserpermissionsonthecentralworkspacetoreaditemsofthiscontenttype.StatusCode:Forbidden.FailureReason:Forbidden"|Edgecase,customerhasacustomroledefinedinWorkspaceManagerworkspacewheretheusercan'taccesscertaincontenttypes.|
||A11|"Failedtopublishcontentitem-contentitemwasnotfound.Pleaseverifythatthecontentitemexists,oreditandupdatetheGrouptoremovereferencetothiscontentitem."|ContentitemnolongerexistsintheparentbutusertriestoPublishtheGroupdefinition.UsershouldedittheGroupandremovelostcontentitems.|
|Analytics/AlertRules|A12|"FailedtopublishAnalyticsruleAnalyticsruletype'{alertRuleKind}'onlysupportsasingleAnalyticsruleofitstypetoexistinthemember.Pleasetryagain."|ForcertainAnalyticsrules(eg.Fusion)onlyoneanalyticsruleofitskindcanexistinthememberworkspace.Wecurrentlyhavealogictoparsethroughallrulesinthemembertocheckifaruleofitskindexists,inthecaseofaparsingfailurewhilegoingthroughtherules,thiserrorwillbedisplayedtothecustomer.|
||A13|"FailedtopublishAnalyticsruleTheAnalyticsrulereferencesatleastonetablethatdoesnotexistinthetargetworkspace."|Analyticsruleisbeingpublishedtoamemberworkspacewheretheanalyticsrulequeryreferencesatablethatdoesnotexistinthechild|
||A14|"Encounteredanerror(Analyticsruleproperty'{propertyName}'ismalformed).PleaseensurethattheAnalyticsruleisnotmisconfiguredandtryagain."|UnlikelyedgecasewhentryingtoextractpropertyfromtheAnalyticsrulepayload|
|AutomationRules|A15|"FailedtopublishAutomationRulethefollowingAnalyticsrule(s)referencedbytheAutomationRuleneedtobeaddedtothisGroupassignmentandpublished:{notFoundAlertRuleIdslist}"|AnalyticsrulethattheAutomationrulereferstoisnotinthesameAssignment|
||A16|"FailedtopublishAutomationrulethefollowingAnalyticsrulereferencedbytheAutomationrulewerenotsuccessfullypublishedtothemember:{alertRuleId}"|AnalyticsruletheAutomationrulereferstofailstopublisheventhoughthey'reinthesameAssignment.Userwillneedtore-attemptpublishingtheentireAssignment.|
||A17|"FailedtopublishAutomationruletheAnalyticsrule(s)referencedbytheAutomationrulewerenotsuccessfullyparsed."|IfanAutomationrulereferstoAnalyticsrulesandwearenotabletoextractthem(ie.thereisatriggerconditionthatindicatesAnalyticsrulesarecontainedwithintheassignment)theerrorwillbeshown.Unlikelyedgecase.|
||A18|"FailedtopublishAutomationRuletheAutomationRulereferencesPlaybooks.ThisiscurrentlynotsupportedbyWorkspaceManager."|AutomationrulereferencesaPlaybook(PlaybooksarenotcurrentlysupportedbyWorkspaceManager)|
||A19|"FailedtopublishAutomationrule-unabletoextracttheAutomationruleproperty'{property}',fromtheAutomationruledefinition."|UnabletoextractanynecessarypropertiesfromAutomationrulepayload,unlikelyedgecase.|
|Workbooks|A20|"Encounteredanerror(Workbookproperty'{propertyName}'ismalformed).PleaseensurethattheWorkbookisnotmisconfiguredandtryagain."|Edgecase,Workbookpayloadismalformed(no/emptyproperties)|
||A21|"FailedtopublishWorkbookonlyWorkbooksoftype'Sentinel'aresupportedbyWorkspaceManager."|WorkbookcategoryisnotSentinel,WorkbooksUXinSentineldoesnotshownon-SentinelWorkbooks.|
||A22|"FailedtopublishWorkbooktheWorkbookissavedtoanAzureStorageaccount,thisiscurrentlynotsupportedbyWorkspaceManager."|Workbookisstoredinbring-your-own-storage,thisisnotcurrentlysupportedbyWorkspaceManager.|
||A23|"Encounteredanerror(Workbookproperty'{propertyName}'ismalformed).PleaseensurethattheWorkbookisnotmisconfiguredandtryagain."|Edgecase,Workbookhasnodisplaynameormissingtags.|
||A24|"FailedtopublishWorkbook-theWorkbookpropertiesof'displayName'and'hidden-title'donotmatch."|Edgecase,happensifuserusespostmancausingdisplaynameandhiddentitletobemismatched.|
||A25|"Encounteredanerror(Workbookproperty'{propertyName}'ismalformed).PleaseensurethattheWorkbookisnotmisconfiguredandtryagain."|WorkbookismissingworkspaceresourceID|
||A26|"FailedtopublishWorkbookonlyWorkbookswithproperty'sourceId'settotheParentWorkspacearesupported."|WorkbooksourceIDpropertyisnotavalidworkspaceresourceID,sourceIDneedstobetheCentral/ParentworkspaceID.|
||A27|"Failedtopublishcontentitem-anexistingcontentitemwiththesameuniqueidentifier(contentnameorresourceID)alreadyexistsinthetargetworkspace."|ErrorisreceivedwhenaWorkbookwiththesamenamealreadyexistsintheChildandcan'tbeoverwrittenbyWorkspaceManager.CustomerneedstoeitherrenametheWorkbookintheParentordeletetheexistingWorkbookintheChild.|
|SavedSearches|A28|"Encounteredanerror(SavedSearchproperty'{propertyName}'ismalformed).PleaseensurethattheSavedSearchisnotmisconfiguredandtryagain."|Edgecase,whentryingtoparsetagstoJarraythiswillbereturnedifthetagsfieldisnullorcontainkeyswithnullvaluesorwhentryingtoextractpropertyfromthepayload.|

##[B]ConfigurationsAPI

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|B1|"ThecreationofmultipleWorkspaceManagerconfigurationsisnotsupported."|CustomertriestocreatemorethanoneconfigurationforthecurrentWorkspaceManager,thisisnotallowed.|

##[C]OdataErrorMessages

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|C1|"Encounteredanerrorthe$orderByvalueisnotvalid."|Customertriestouse_orderBy_viaAPIwithanon-validfieldvalue|
||C2|"Encounteredanerrorthe$topvalueisnotvalid."|Customertriestouse_top_viaAPIwithanon-validfieldvalue|
||C3|"Encounteredanerror(oDataerror).Pleasetryagain."|CatchallforothergenericOdataexceptionsotherthanC1andC2|

##[D]MembersAPI

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|D1|"ThetargetWorkspacecannotbetheWorkspaceManageritself."|WorkspaceManagertriestoadditselfasamember|
||D2|"ThetargetworkspaceisalreadyamemberofthisWorkspaceManager:{targetWorkspaceResourceId}"|CustomertriestocreateamemberwithaworkspaceIdthatisalreadyamember|
||D3|"ThetargetworkspaceisnotaMicrosoftSentinelworkspaceandcannotbeaddedasamember:{targetWorkspaceResourceId}"|TargetworkspaceresourceIdisnotaSentinelWorkspace|
||D4|"Unabletoaddthetargetworkspaceasamemberduetoinsufficientuserpermissionsonthetargetworkspace:{targetWorkspaceResourceId}"|Customerdoesnothavesufficientpermissionsonthetargetworkspacetoadditasamember|
||D5|"Encounteredanerrorwhileattemptingtoaddthetargetworkspaceasamember:{targetWorkspaceResourceId}.Pleasetryagain."|CatchallforothergenericfailureswhenunabletoaddmembertoWorkspaceManagerunrelatedtoD3andD4|

##[E]GroupsAPI

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|E1|"FailedtodeleteGrouptheGroupisreferencedbyanexistingAssignment,pleasedeletetheAssignmentbeforedeletingtheGroup."|Customertriestodeleteagrouptargettedbyanassignment|
||E2|"Unabletoaddthefollowingmember(s)totheGroup:'memberResourceNames'.Pleaseensurethatthemember(s)exist."|CustomertriestoaddamemberResourceNamethatdoesnotexisttothegrouponcreateorupdate|
||E3|"AGroupwiththegivendisplaynamealreadyexists."|CustomertriestocreateaGroupwithadisplaynamethatalreadyexists|
||E4|"Thereisaduplicationofthefollowingtargetworkspace(s)intheGroup:{listOfDuplicateMemberResourceNames}"|Customercreates/updatesaGroupandinthebodyaddsthesameMembertwice|

##[F]AssignmentsAPI

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|F1|"FailedtodeleteAssignmentthereisanactiveJobrunningundertheAssignment.PleasetryagainlaterorterminatetherunningJob."|CustomertriestodeleteanAssignmentwhileajobforthatassignmentisrunning|
||F2|"FailedtocreateAssignmenttheAssignmentreferencesanon-existentGroup:{targetResourceName}."|CustomertriestocreateanAssignmenttoanon-existentgroupResourceName|
||F3|"FailedtocreateAssignmenttheGroupreferencedalreadyhasanexistingAssignment:{targetResourceName}."|CustomertriestocreateanAssignmentwithaGrouptargetResourceNamethatisalreadytargettedbyanotherAssignment|
||F4|"Thereisaduplicationofthefollowingcontentitem(s)intheAssignment:{listofduplicateresourceIds}."|Whenacustomeriscreating/updatingtheAssignmentcontentitems,theyincludethesamecontentitemresourceIDtwice|
||F5|"Thefollowingcontentitem(s)areofcurrentlyunsupportedcontenttypes:{notValidIds}."|CustomertriestoaddaresourceIDasacontentitem,butthecontenttypeisnotcurrentlysupportedbyWorkspaceManager(eg.Watchlists)
||F6|$"For({resourceId}),subscriptioniddoesnotmatchtheWorkspaceManagersubscriptionid({functionInputs.SubscriptionId.ToString()})."$"For({resourceId}),resourcegroupnamedoesnotmatchtheWorkspaceManagerresourcegroupname({functionInputs.ResourceGroupName})."$"For({resourceId}),workspace({workspaceName})doesnotmatchwiththeWorkspaceManagerworkspacename({functionInputs.WorkspaceName})."|CustomertriestoaddcontentitemthatdoesnotbelongtothesameworkspaceastheWorkspaceManager|

##[G]JobsAPI

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|G1|"FailedtocreateJob-theAssignmentreferencedwasnotfound:{assignmentName}"|Customercreates/updatesaJobwithanAssignmentresourcenamethatdoesnotexist|

##[Z]Other/MiscellaneousErrors

|Type|S/N|ErrorMessage|Scenario|
|:-----|:----:|:----|:-----|
|General|Z1|"Encounteredanerror,WorkspaceManagerisnotenabledonthisworkspace."|WorkspaceManagerisnotenabledontheworkspace|
||Z2|"Failedtopublishcontentitemsduetoinsufficientuserpermissionsonthetargetworkspace.StatusCode:Forbidden.FailureReason:Forbidden."|Customerdoesnothavereadpermissionsovermemberworkspace,triestopublishaJob.|
||Z3|"Failedtopublishcontentitemsduetoinsufficientuserpermissionsonthetargetworkspace.StatusCode:Forbidden.FailureReason:Forbidden."|Customerdoesnothavewritepermissionsovermemberworkspace,triestopublishaJob.|

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
