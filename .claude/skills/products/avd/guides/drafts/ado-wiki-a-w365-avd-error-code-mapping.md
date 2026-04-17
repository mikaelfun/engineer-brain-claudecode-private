---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/AVD/Connectivity/Connectivity Error & TSG Mapping/Additional W365 & AVD - Error Code Mapping"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Dependencies/AVD/Connectivity/Connectivity%20Error%20%26%20TSG%20Mapping/Additional%20W365%20%26%20AVD%20-%20Error%20Code%20Mapping"
importDate: "2026-04-06"
type: troubleshooting-guide
---


|WVD Error Code|CPC Error Code  |Error Description  |Recommendation  |
|--|--|--|--|
|ConnectionFailedClientDisconnect  |CPCClientDisconnect  |The user's network connection to their Cloud PC was unexpectedly interrupted.  |Advise the user to try connecting to their Cloud PC again. If the issue persists, there might be a problem with the user's network configuration.   |
|ConnectionFailedNoHealthyRdshAvailable  |CPCNoHealthyResourceAvailable  |The user's Cloud PC is currently not available or in a reachable state  |Advise the user to try connecting to their Cloud PC again. If the issue persists, check that the user has a Cloud PC assigned to them and advise the user to restart it via the end user web portal.  |
|UnexpectedNetworkDisconnect  |CPCUnexpectedNetworkDisconnect  |The user's connection to their Cloud PC was lost due to an unexpected network error. Poor network quality or invalid network configuration may cause such problems.  |Advise the user to try connecting to their Cloud PC again. If the issue persists, there might be a problem with your Virtual Network configuration. Check firewalls settings and/or make sure there are no network appliances that could block http traffic to the Cloud PC service.  |
|ConnectionFailedUserHasValidSessionButRdshIsUnhealthy  |CPCNoHealthyResourceAvailable  |The user's Cloud PC is currently not available or in a reachable state  |Advise the user to try connecting to their Cloud PC again. If the issue persists, check that the user has a Cloud PC assigned to them and advise the user to restart it via the end user web portal.  |
|SavedCredentialsNotAllowed  |CPCSavedCredentialsNotAllowed  |The user connection to their Cloud PC failed to establish because the Cloud PC configuration does not allow using saved credentials  |Advise user to use their credentials and not their saved credentials, or change session host configuration to allow for the use of saved credentials.  |
|InvalidCredentials  |CPCInvalidCredentials  |The user provided invalid authentication information (e.g. username/password) while connecting to the Cloud PC.  |Advise user to check their input credentials and try again.   |
|ReverseConnectResponseTimeout  |CPCConnectResponseTimeout  |The user's connection to their Cloud PC was lost due to an unexpected network timeout. Poor network quality or high resource usage on the Cloud PC may cause such problems.   |Advise the user to try connecting to their Cloud PC again. Make sure the user has good connection quality. If the issue persists, consider upgrading the user to a Cloud PC with higher specs.   |
|ConnectionFailedReverseConnectStackDNSFailure  |CPCConnectionFailedConnectStackDNSFailure  |The user's connection to their Cloud PC failed because the Cloud PC was not able to establish a connection to the Cloud PC service due to a DNS failure.   |Make sure DNS configuration on the Cloud PC network is correct and the DNS service is reachable and try connecting again  |
|AutoReconnectNoCookie  |CPCAutoReconnectFailed  |The user's connection to their Cloud PC failed because the Cloud PC client tried to reconnect to a session that is either new or whose connection information was reset  |Advise the user to try connecting to their Cloud PC again. If the issue persists, contact your admin  |
|ConnectionInitiationSequenceTimeout  |CPCConnectionSequenceTimeout  |The user connection to their Cloud PC failed due to a timeout waiting for the connection initiation sequence to complete. This may be because of pending credential prompt on the client  |Advise the user to try connecting to their Cloud PC again. If the issue persists, contact your admin  |
|NotAuthorizedForLogon  |CPCUserNotAuthorizedForLogon  |The user authentication failed because the user is not authorized to logon to the Cloud PC   |Make sure the user is authorized to logon to the assigned Cloud PC, and try connecting again  |
|OutOfMemory  |CPCOutOfMemory  |The user connection to their Cloud PC was lost due to memory exhaustion in the Cloud PC  |Advise the user to try connecting to the Cloud PC again. If the issue persists, consider upgrading the user to a Cloud PC with higher RAM/specs.   |
|PasswordExpired  |CPCPasswordExpired  |The user authentication failed because the user password is expired.  |Please reset the user's password  |
|UserAccountLocked  |CPCUserAccountLocked  |The user authentication failed because the user account is locked.  |Please unlock the user's account  |




