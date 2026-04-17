---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/AAD ID Protection ESTS Risk Assessment Module (RAM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Identity%20Protection%2FAAD%20ID%20Protection%20ESTS%20Risk%20Assessment%20Module%20(RAM)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.AAD-IP-Protection
- cw.ESTS
- cw.risk
- SCIM Identity
-  ESTS
-  Risk Assessment
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

The Risk Assessment Module is described on AADWiki:
https://aadwiki.windows-int.net/index.php?title=Risk_Assessment_Module

[[_TOC_]]

## Terminology


| Term                 | Meaning                                                      |
|----------------------|--------------------------------------------------------------|
| Session Risk         | The probability that the current authentication request being evaluated is fraudulent. <br/> *This is refered to as 'Sign-In Risk" in the AAD Identity Protection product* |
| Account Risk         | The probability that the authenticating account is compromised. <br /> *This is refered to as "User Risk" in the AAD Identity Protection product.* |


## RAM Overview

RAM, the Risk Assessment Module, is an ESTS runtime **execution engine** that drives the execution of all online protection algorithms. This overview is provided for context; these details are not surfaced to customers.

Each protection algorithm executes as one or several **execution units**. These execution units process input request data, log data in RamLogData, and may issue **recommendations**. Each execution unit has its own logic to determine whether it is enabled and whether it has all the data necessary for its processing.

Unless there are unexpected errors, RAM will always execute all execution units that can be executed. RAM execution is never aborted midway intentionally, only through unexpected errors (incidents would be automatically generated in such situations).

Once RAM completes the execution of all its units, it aggregates all the data output by each of the algorithms to produce 3 types of recommendations:

  - The **account risk recommendation** (a.k.a "**user risk**"), which indicates the current account risk level for the account
    - This recommendation is fed into the Conditional Access engine for use in tenant-authored policies.
  - The **session risk recommendation** (a.k.a "**sign-in risk**"), which indicates the current session risk evaluated for the 
    request
    - This recommendation is fed into the Conditional Access engine for use in tenant-authored policies.
  - The **blocking recommendation**, which indicates whether or not the request should be blocked
    - Block recommendations can occur when credential brute force detections such as Smart Lockout or IPBlocking are triggered. They can also be issued when the session risk for the request is evaluated to be very high.
    - When a block recommendation is issued, the authentication request is immediately failed. This is the only situation where RAM directly affects the flow of authentication.


## RamLogData

The RamLogData column in ESTS per-request logs captures all the details of the RAM execution for a request.

### Decoding RamLogData

In its raw form, RamLogData is a Base64 encoded Google Protobuf serialized object. The schema for the object (including all associated enumerations) is [here](https://msazure.visualstudio.com/One/_git/ESTS-Main?path=%2Fsrc%2FProduct%2Fproto%2FRiskAssessmentLogData.proto).

Reading RamLogData by hand is not possible due to its serialization. However, tooling has been added to ESTS LogsMiner that can help to view the logs in two ways:
1. When loading a request in LogsMiner, a RamLogData tab will automatically appear that displays the decoded contents.
2. If you have a raw RamLogData Base64 string on its own, you can use the *RamLogData Viewer* in the LogsMiner toolbox to decode and view the data as demonstrated in the screenshot below:



### RamLogData Structure

Each execution unit will log a set of entries and each algorithm's entries will be grouped together, leading to a common prefix in the name of the properties logged.

Because each algorithm is being tweaked constantly, much of the information logged requires an intimate understanding of the algorithm implementation and of its actual configuration in ESTS. Such knowledge can quickly become outdated. Therefore, this article will only focus on explaining those elements that are stable, which should be enough to help with generic investigations. More complex algorithm-specific investigations should be forwarded to Protection on-calls, who will know how to find the area experts.

### RAM's Recommendations

As noted above, RAM produces 3 distinct types of recommendations. These recommendations are the most important outputs from RAM and they are recorded in RamLogData as follows:

#### Blocking Recommendation

| Field Name  | DataType                 | Description |
|-------------|--------------------------|-------------|
| Action      | RecommendedAction (Enum) | Indicates whether RAM has determined if the request should be blocked. Since this outcome is binary, the value will be one of `{RamActionNotSet, RamActionBlock}`. |
| Recommender | RecommenderId (Enum)     | If blocking is recommended, this field indicates which algorithm indicated the block. If multiple algorithms recommend block, there is a built-in precedence ordering to choose one based on the desired reporting outcome. |

Note: Since these are highly used fields, their values are copied outside of RamLogData directly into ESTS per-request logs where they are called *RamRecommendedAction* and *RamRecommender* respectively.

#### Account Risk Recommendation

| Field Name             | DataType                 | Description |
|------------------------|--------------------------|-------------|
| AccountRiskAction      | RecommendedAction (Enum) | Indicates the account risk level determined by RAM for the authenticating user. The value will be one of `{RamActionDoNotDisturb, RamActionAccountRiskLow, RamActionAccountRiskMedium, RamActionAccountRiskHigh}`. |
| AccountRiskRecommender | RecommenderId (Enum)     | Currently, the only value that would be recorded here is `RamRecommenderOfflineAccountRiskScore`. This is because RAM does not currently evaluate any real-time assessment of account risk; all such determinates are computed offline and piped back to RAM for enforcement. |

Note: Since these are highly used fields, their values are copied outside of RamLogData directly into ESTS per-request logs where they are called *RamAccountRiskRecommendedAction* and *RamAccountRiskRecommender* respectively.

#### Session Risk Recommendation

| Field Name             | DataType                 | Description |
|------------------------|--------------------------|-------------|
| SessionRiskAction      | RecommendedAction (Enum) | Indicates the session risk determined by RAM for the current request. The value will be one of `{RamActionDoNotDisturb, RamActionSessionRiskLow, RamActionSessionRiskMedium, RamActionSessionRiskHigh}`. |
| SessionRiskRecommender | RecommenderId (Enum)     | Indicates which algorithm took precedence in the session risk determination. <br/><br/> The way RAM aggregates session risk across its algorithms is fairly complex. It's best not to make assumptions based on the value recorded in this field.|

Note: Since these are highly used fields, their values are copied outside of RamLogData directly into ESTS per-request logs where they are called *RamSessionRiskRecommendedAction* and *RamSessionRiskRecommender* respectively.


### Miscellaneous Enum/Status values

#### RecommendedAction

These are the currently logged actions:

  - *RamActionNotSet* = 0;
      - This indicates an uninitialized value.
  - *RamActionDoNotDisturb* = 1;
      - Indicates that RAM (or the algorithm reporting this action) found nothing to complain about the evaluated request.
  - *RamActionSessionRiskLow* = 40;
  - *RamActionAccountRiskLow* = 50;
  - *RamActionSessionRiskMedium* = 60;
  - *RamActionAccountRiskMedium* = 70;
  - *RamActionSessionRiskHigh* = 80;
  - *RamActionAccountRiskHigh* = 90;
      - All of the above indicate the respective session or account risk.
  - *RamActionBlock* = 100;
      - Indicates that RAM decided to block the request. This is the highest priority recommendation and it is executed upon by RAM, rather than Conditional Access. If this recommendation is made, the request will fail without Conditional Access getting a chance to execute.

#### RecommenderId

These are the currently existing algorithms that can issue recommendations:

  - *RamRecommenderNotSet* = 0;
      - As usual, this indicates an uninitialized value.
  - *RamRecommenderLockout* = 1;
      - The SmartLockout algorithm. Blocks requests when bad passwords are submitted enough times. Lockout counters are stored per-datacenter.
  - *RamRecommenderIPBlocking* = 2;
      - The IPBlocking algorithm. Dynamically blocks requests from IPs who do more bad activity than good activity. IPBlocking counters are also stored per-datacenter.
  - *RamRecommenderTor* = 4;
      - The Tor algorithm. Currently, just flags each request coming from an anonymous network IP. Uses IP data.
  - *RamRecommenderFamiliarFeatures* = 5;
      - The FamiliarFeatures algorithm, also known as FamiliarLocations or UnfamiliarLocations. This algorithm tracks various request features and stores them in a global storage (ActivityStore).
  - *RamRecommenderOfflineAccountRiskScore* = 6;
      - This algorithm just surfaces the account risk computed by the offline AAD Identity Protection systems. Once an account is determined to be at risk, its ActivityStore record is updated with the risk level and that gets surfaced to Conditional Access by this algorithm.
  - *RamRecommenderGeoHopping* = 7;
      - This algorithm tries to detect attackers that attempt to bypass MFA by jumping across the globe to avoid MFA triggered by Familiar Locations.
  - *RamRecommenderTestHook* = 8;
      - This algorithm is only enabled in TestSlice and is used to force RAM recommendations for testing. As a security precaution, it cannot downgrade a recommendation - it can only upgrade it.
  - *RamRecommenderIPBlockingOverride* = 9;
      - This algorithm is used to block IPs that are manually provided to RAM by offline analysts. Think of it as a kind of manual IPBlocking.
  - *RamRecommenderAdaptiveCompromiseProtection* = 10;
      - AdaptiveProtection is the name of machine learning model in RAM that evaluates session risk. The ML is used to provide the overall session risk for the sign-in; you'll usually see this recommender logged in `SessionRiskRecommender`, which indicates that the ML was used to provide the final risk level for the request.
  - *RamRecommenderCarriedSessionRisk* = 11;
      - When a sign-in is interrupted (e.g. due to an MFA challenge), the user agent will make multiple requests to ESTS while getting additional inputs from the user (e.g. perfoming MFA). This recommender is used to carry session risk across the different requests to ESTS in order to ensure a consistent level of sign-in risk.
  - *RamRecommenderAdaptiveProtectionBlock* = 12;
      - This algorithm uses the AdaptiveProtection ML risk score to make blocking recommendations. When the ML reports a risk score above a certain very high threshold, the request will automatically be blocked rather than issuing session risk.
  - *RamRecommenderEmbargoedRegions* = 13,
      - This recommender blocks regions that are under trade embargo. Unlike other mechanisms, this is not based on risk evaluation but purely enforcing legal policy decisions to not allow traffic from certain regions.

# RecommenderExecutionStatus

These values are used for individual availability tracking for each algorithm. They indicate whether the algorithm has successfully executed or was prevented from doing so due to infrastructure issues. In general, these values are only of interest to the Protection team.

  - *RamExecutionNotSet* = 0;
      - Indicates uninitialized values.
  - *RamExecutionAvailable* = 10;
      - The algorithm has executed with no issues.
  - *RamExecutionDegraded* = 20;
      - The algorithm has managed to evaluate the request despite missing some data.
  - *RamExecutionUnavailable* = 30;
      - The algorithm could not evaluate the request due to unavailable data.

#### AuthenticationStatus

RAM also logs the result of password authentications for password flow requests:

  - *RamAuthenticationStatusNotSet* = 0;
      - Uninitialized value.
  - *RamAuthenticationStatusSuccess* = 1;
      - The credential matches the user's current credential.
  - *RamAuthenticationStatusPreviousPassword* = 2;
      - The password matches the user's previous password.
  - *RamAuthenticationStatusBadCredential* = 3;
      - The credential doesn't match the user's current credential.
  - *RamAuthenticationStatusRepeatedBadPassword* = 4;
      - The password is one of the bad passwords tried before.
  - *RamAuthenticationStatusMemberNotExists* = 5;
      - The user does not exist.
  - *RamAuthenticationStatusServerFailure* = 6;
      - A server failure occurred during authentication (not user fault).
  - *RamAuthenticationStatusUserAccountIsLocked* = 7;
      - The user account is locked.
  - *RamAuthenticationStatusAccountDisabled* = 8;
      - The user account is disabled.

#### OfflineRiskScore

These are the values that the account risk score can display:

  - *OfflineRiskScoreNotSet* = 0;
      - Uninitialized value.
  - *OfflineRiskScoreUnknown* = 10;
      - Account risk was set but could not be read. Indicates an internal error, possibly a corruption or some inconsistency in deployment.
  - *OfflineRiskScoreNone* = 20;
      - Account is not market at risk.
  - *OfflineRiskScoreLow* = 40;
  - *OfflineRiskScoreMedium* = 60;
  - *OfflineRiskScoreHigh* = 80;
      - The above indicate that the account was marked at the respective risk level.

#### FamiliarFeatureMatchType

This describes the types of features that FamiliarFeatures tracks and attempts to match on:

  - *RamMatchTypeNotSet* = 0;
      - Uninitialized value.
  - *RamMatchTypeNoMatch* = 1;
      - No match was found.
  - *RamMatchTypeIP* = 2;
      - The IP matched.
  - *RamMatchTypeLocationExactMatch* = 3;
      - The lat/long coordinates have matched exactly.
  - *RamMatchTypeLocationDistance* = 4;
      - The request location was close enough to a familiar location.
  - *RamMatchTypeAsn* = 5;
      - The network matched.
  - *RamMatchTypeDevice* = 6;
      - The device identifier matched.
  - *RamMatchTypeIPPartialMatch* = 7;
      - The IP subnet was matched.
  - *RamMatchTypeBrowserId* = 8;
      - The browser identifier (cookie) matched.
  - *RamMatchTypeTenantLevelFamiliarSubnet* = 9;
      - The IP matched a familiar subnet of the tenant. Tenant-level familiar subnets are determined by an offline algorithm.

#### FamiliarFeaturePatternType

This is a new type of information that tells us how significant is a familiar feature when considered as a pattern of behavior.

  - *RamPatternTypeNotSet* = 0;
      - Uninitialized value.
  - *RamPatternTypeNone* = 1;
      - We have never seen the feature before, we don't know it.
  - *RamPatternTypeRare* = 2;
      - We have seen the feature very few times. "Very few" is determined by configuration. Think about a handful of times or less.
  - *RamPatternTypeOccasionalInactive* = 3;
      - We have seen the feature some times, but its activity stopped and is unexpected at this moment.
  - *RamPatternTypeOccasionalActive* = 4;
      - We have seen the feature some times and activity from it is not surprising.
  - *RamPatternTypeFrequentInactive* = 5;
      - We have seen the feature frequently, but its activity stopped and is unexpected at this moment.
  - *RamPatternTypeFrequentActive* = 6;
      - We have seen the feature frequently and activity from it is expected.

#### RequestIPAllowStatus

These values indicate some useful information about the IP:

  - *RequestIPStatusNotSet* = 0;
      - Uninitialized value.
  - *RequestIPInRamAllowList* = 1;
      - IP is flagged as safe by our internal lists.
  - *RequestIPInTenantTrustedKnownNetwork* = 2;
      - Tenant has trusted the IP using the known networks feature.
  - *RequestIPInStrongAuthPolicyAllowList* = 3;
      - Tenant has trusted the IP using strong auth policy.
  - *RequestIPInStrongAuthPolicyCorpNet* = 4;
      - IP was identified as tenant Corporate IP.

### RamLogData Global entries
*Note: For fields `Action`, `Recommender`, `SessionRiskAction`, `SessionRiskRecommender`, `AccountRiskAction`, `AccountRiskRecommender` please see their descriptions in section [RAM's Recommendations](#ram%27s-recommendations) *

  - bool *IsIPFromTor* = 8;
      - Whether this is an anonymous IP. This used to be the main Tor datapoint, but we added more explicit logging later.
  - bool *IsConfidentialClient* = 9;
  - RequestIPAllowListStatus *RequestIPAllowListStatus* = 14;
      - IP information.
  - ActivityStoreError *ActivityStoreLoadError* = 16;
      - If there was an error loading the ActivityStore record, it will be indicated here. Errors here will prevent algorithms like FamiliarFeatures from executing.
  - bool *IsTrustedServerToServerCall* = 18;
  - bool *HasExecutionCompleted* = 20;
      - Whether RAM has successfully executed all its units. If this value is not set, it means that some exception aborted the RAM execution mid-way and some algorithms may not have executed at all. The request will fail in these situations.
  - int32 *RequestCredentialType* = 21;
      - An integer indicating the credential type associated with this request. This can be ignored, as it is no longer used for any decisions.
  - bool *IsUserInsideCorporateNetwork* = 22;
  - ProtoDateTime *LastFamiliarFeaturesUpdateTime* = 23;
      - This indicates the latest update to a familiar feature. It can be helpful for investigations; for example, it can surface the fact that an account has not been active for months.
  - AuthenticationStatus *AuthenticationStatus* = 24;
      - See Authentication Status values.
  - IPDataStatus *IPDataStatus* = 27;
      - This indicates whether we could successfully load IP information. The values are self-descriptive.

### RamLogData Execution Unit-level entries

Each execution unit has its own execution details logged in RamLogData in a specific structure which will result in a common prefix for the values corresponding to each algorithm.

Each execution unit that can issue a recommendation will include an Action field that represents the recommended action of the algorithm, as well as an execution status value. The values of these fields are the ones that we have described earlier and they can be interpreted similarly for each algorithm.

Because at this point, we're going to get closer to the details of each algorithm, I'll limit explanation to what I think may be long term properties less likely to change. The names generally tend to be descriptive enough, but if you find yourself lost, then it's probably time to forward the investigation to the Protection on-calls.

#### Lockout

This set covers the SmartLockout Algo execution.

  - *FailureCounterValue*
      - This indicates the value of the failure counter that lockout is working with. There are 2 counters: the familiar location one and the unfamiliar location one. Note that the concept of familiar location used by Lockout may differ from that used by the FamiliarFeatures algorithm.
  - *RemainingLockoutDurationInSeconds*
      - This is a countdown to lockout expiration. You should see it decrement on successive requests in the same datacenter.
  - *WasFamiliarBucketUsed*
      - Indicates whether the counter used is the familiar location or the unfamiliar location one.

#### FamiliarFeatures

There is a ton of information here. Note that the tracking part of FamiliarFeatures tends to work even if the recommender part does not execute. Such situations can be recognized by a lack of Action/ExecutionStatus entries.

  - *MatchType*
      - The most important field, this indicates the most trustworthy feature that FamiliarFeatures managed to match. Values have been described earlier. Order of trustworthiness, starting with the most trustworthy feature, is: Device, Browser, IP, Location, Asn, TenantLevelFamiliarSubnet. An IP match indicated in this field, for example, tells us that we could not match the device or browser, if they were present at all.
  - *DistanceToClosestFamiliarLocationInMeters*
      - This is provided whenever we have IP location information, regardless of whether we matched or not. Very large distances are suspicious.
  - *IsInLearningMode*
      - If true, then FamiliarFeatures will not issue any recommendations. This will be the case for accounts for which we either did not get much activity history or which have such erratic behavior that we cannot find a pattern to it.
  - *MatchedXPatternType*
      - If we matched X feature, this will summarize what we knew about it. Has it been seen a lot or just a few times?
  - *MatchScore*
      - This is a *familiarity score* which is the primary output of the FamiliarFeatures algorithm. FamiliarFeatures recommendations are made based on thresholds of this score value.

Ignore other values.

#### IPBlocking

This summarizes IPBlocking information. Most information here is in the form of counters that track the IP activity. You should not need this, only the outcome of the algorithm.

#### RequestLocationData

These entries capture all we know about the IP and should be self-descriptive. Not all of this information is used by RAM.

Most important entries are:

  - *Latitude*
  - *Longitude*
  - *CountryISO*
  - *Asn*
  - *RoutingType*
      - Can indicate proxies.
  - *ProxyType*
      - Can indicate Tor. (But this is not the only source for Tor signal)

#### OfflineRiskScoreData

  - *AccountRiskScore*
      - See values of OfflineRiskScore.
  - *AccountRiskEventTime*
      - The time of the event that triggered the risk evaluation.
  - *AccountRiskScoreComputationTime*
      - The time when the risk evaluation updated the score.

#### GeoHopping

This algorithm tracks **failed** requests from **unknown** locations. It is not currently enabled. This section will be updated soon.

#### Tor

You should ignore non-standard fields here. Only Action/ExecutionStatus matter for now.

#### OfflineAccountRisk

Only logs the standard fields.

#### IPBlockingOverride

Only logs the standard fields.

#### IPIntelligence

This indicates the status of the override for the current IP. Values are self-descriptive.

</div>

</div>
