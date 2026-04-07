---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/ASC MFA Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FASC%20MFA%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.ASCMFALogs
- cw.AzureMFA
- SCIM Identity
-  ASC Logs
-  Entra ID MFA 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Workflow](/Tags/AAD-Workflow) [AzureAD](/Tags/AzureAD) 
 


Azure Support Center (ASC) provides multiple views of MFA logs from both SAS and MFA Backend.

To access these logs, go to Azure AD Explorer / Sign-Ins / Diagnostics tab / Correlation Id tab. Once you run the report, you'll see tabs for MFA-SAS-Summary, MFA-SAS-Detail, MFA-SAS-Backend, and MFA-Server-Backend

[[_TOC_]]

# Result Codes

MFA Backend uses numerical result codes. MFA Server logs and Exported MFA Server reports use a string constant that maps to the numerical result codes. SAS translates the MFA Backend result codes to it's own internal result code strings. The following table tries to make sense of this.

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr class="header">
<th>Result Code</th>
<th>Result Contant</th>
<th>SAS Result</th>
<th>Description</th>
<th>Explanation</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top">1</td>
<td style="vertical-align:top">SUCCESS_WITH_PIN</td>
<td style="vertical-align:top">PinEntered</td>
<td style="vertical-align:top">PIN Entered</td>
<td style="vertical-align:top">The user entered a PIN. �If authentication succeeded then they entered the correct PIN. �If authentication is denied, then they entered an incorrect PIN or the user is set to Standard mode.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">2</td>
<td style="vertical-align:top">SUCCESS_NO_PIN</td>
<td style="vertical-align:top">NoPinEntered</td>
<td style="vertical-align:top">Only # Entered</td>
<td style="vertical-align:top">If the user is set to PIN mode and the authentication is denied, this means the user did not enter their PIN and only entered #.� If the user is set to Standard mode and the authentication succeeds this means the user only entered # which is the correct thing to do in Standard mode.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">3</td>
<td style="vertical-align:top">SUCCESS_WITH_PIN_BUT_TIMEOUT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top"># Not Pressed After Entry</td>
<td style="vertical-align:top">The user did not send any DTMF digits since # was not entered. �Other digits entered are not sent unless # is entered indicating the completion of the entry.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">4</td>
<td style="vertical-align:top">SUCCESS_NO_PIN_BUT_TIMEOUT</td>
<td style="vertical-align:top">UserVoiceAuthFailedCallWentToVoicemail</td>
<td style="vertical-align:top">No Phone Input - Timed Out</td>
<td style="vertical-align:top">The call was answered, but there was no response. �This typically indicates the call was picked up by voicemail.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">5</td>
<td style="vertical-align:top">SUCCESS_PIN_EXPIRED</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">PIN Expired and Not Changed</td>
<td style="vertical-align:top">The user's PIN is expired and they were prompted to change it, but the PIN change was not successfully completed</td>
</tr>
<tr class="even">
<td style="vertical-align:top">6</td>
<td style="vertical-align:top">SUCCESS_USED_CACHE</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Used Cache</td>
<td style="vertical-align:top">Authentication succeeded without a Multi-Factor Authentication call since a previous successful authentication for the same username occurred within the configured cache timeframe.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">7</td>
<td style="vertical-align:top">SUCCESS_BYPASSED_AUTH</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Bypassed Auth</td>
<td style="vertical-align:top">Authentication succeeded using a One-Time Bypass initiated for the user. �See the�Bypassed User History Report�for more details on the bypass.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">8</td>
<td style="vertical-align:top">SUCCESS_USED_IP_BASED_CACHE</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Used IP-based Cache</td>
<td style="vertical-align:top">Authentication succeeded without a Multi-Factor Authentication call since a previous successful authentication for the same username, authentication type, application name, and IP occurred within the configured cache timeframe.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">9</td>
<td style="vertical-align:top">SUCCESS_USED_APP_BASED_CACHE</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Used App-based Cache</td>
<td style="vertical-align:top">Authentication succeeded without a Multi-Factor Authentication call since a previous successful authentication for the same username, authentication type, and application name within the configured cache timeframe.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">12</td>
<td style="vertical-align:top">SUCCESS_INVALID_INPUT</td>
<td style="vertical-align:top">UserVoiceAuthFailedInvalidPhoneInput</td>
<td style="vertical-align:top">Invalid Phone Input</td>
<td style="vertical-align:top">The response sent from the phone is not valid. �This could be from a fax machine or modem or the user may have entered * as part of their PIN.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">14</td>
<td style="vertical-align:top">SUCCESS_USER_BLOCKED</td>
<td style="vertical-align:top">UserIsBlocked</td>
<td style="vertical-align:top">User is Blocked</td>
<td style="vertical-align:top">The user's phone number is blocked. �A blocked number can be initiated by the user during an authentication call or by an administrator using the Azure Portal.
<p>Note:��A blocked number is also a byproduct of a Fraud Alert.</p></td>
</tr>
<tr class="even">
<td style="vertical-align:top">15</td>
<td style="vertical-align:top">SUCCESS_STATUS_PENDING</td>
<td style="vertical-align:top">AuthenticationPending</td>
<td style="vertical-align:top">Authentication Pending</td>
<td style="vertical-align:top">Asynchronous MFA request was successfully initiated.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">19</td>
<td style="vertical-align:top">SUCCESS_SMS_AUTHENTICATED</td>
<td style="vertical-align:top">Success</td>
<td style="vertical-align:top">Text Message Authenticated</td>
<td style="vertical-align:top">For two-way test message, the user correctly replied with their one-time passcode (OTP) or OTP + PIN.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">20</td>
<td style="vertical-align:top">SUCCESS_SMS_SENT</td>
<td style="vertical-align:top">SMSSent</td>
<td style="vertical-align:top">Text Message Sent</td>
<td style="vertical-align:top">For Text Message, the text message containing the one-time passcode (OTP) was successfully sent. �The user will enter the OTP or OTP + PIN in the application to complete the authentication.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">21</td>
<td style="vertical-align:top">SUCCESS_PHONE_APP_AUTHENTICATED</td>
<td style="vertical-align:top">Success</td>
<td style="vertical-align:top">Mobile App Authenticated</td>
<td style="vertical-align:top">The user successfully authenticated via the mobile app.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">22</td>
<td style="vertical-align:top">SUCCESS_OATH_CODE_PENDING</td>
<td style="vertical-align:top">OathCodePending</td>
<td style="vertical-align:top">OATH Code Pending</td>
<td style="vertical-align:top">The user was prompted for their OATH code but didn't respond.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">23</td>
<td style="vertical-align:top">SUCCESS_OATH_CODE_VERIFIED</td>
<td style="vertical-align:top">Success</td>
<td style="vertical-align:top">OATH Code Verified</td>
<td style="vertical-align:top">The user entered a valid OATH code when prompted.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">24</td>
<td style="vertical-align:top">SUCCESS_FALLBACK_OATH_CODE_VERIFIED</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Fallback OATH Code Verified</td>
<td style="vertical-align:top">The user was denied authentication using their primary Multi-Factor Authentication method and then provided a valid OATH code for fallback.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">25</td>
<td style="vertical-align:top">SUCCESS_FALLBACK_SECURITY_QUESTIONS_ANSWERED</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Fallback Security Questions Answered</td>
<td style="vertical-align:top">The user was denied authentication using their primary Multi-Factor Authentication method and then answered their security questions correctly for fallback.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">101</td>
<td style="vertical-align:top">FAILED_PHONE_BUSY</td>
<td style="vertical-align:top">UserAuthFailedDuplicateRequest</td>
<td style="vertical-align:top">Auth Already In Progress</td>
<td style="vertical-align:top">Multi-Factor Authentication is already processing an authentication for this user. �This is often caused by RADIUS clients that send multiple authentication requests during the same sign on.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">102</td>
<td style="vertical-align:top">CONFIG_ISSUE</td>
<td style="vertical-align:top">UserVoiceAuthFailedPhoneUnreachable</td>
<td style="vertical-align:top">Phone Unreachable</td>
<td style="vertical-align:top">Call was attempted, but either could not be placed or was not answered. �This includes busy signal, fast busy signal (disconnected), tri-tones (number no longer in service), timed out while ringing, etc.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">107</td>
<td style="vertical-align:top">FAILED_INVALID_PHONENUMBER</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Invalid Phone Number Format</td>
<td style="vertical-align:top">The phone number has an invalid format. �Phone numbers must be numeric and must be 10 digits for country code +1 (United States &amp; Canada).</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">108</td>
<td style="vertical-align:top">FAILED_USER_HUNGUP_ON_US</td>
<td style="vertical-align:top">UserVoiceAuthFailedPhoneHungUp</td>
<td style="vertical-align:top">User Hung Up the Phone</td>
<td style="vertical-align:top">The user answered the phone, but then hung up without pressing any buttons.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">111</td>
<td style="vertical-align:top">FAILED_INVALID_EXTENSION</td>
<td style="vertical-align:top">UserVoiceAuthFailedInvalidExtension</td>
<td style="vertical-align:top">Invalid Extension</td>
<td style="vertical-align:top">The extension contains invalid characters. �Only digits, commas, *, and # are allowed. �An @ prefix may also be used.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">112</td>
<td style="vertical-align:top">FAILED_FRAUD_CODE_ENTERED</td>
<td style="vertical-align:top">FraudCodeEntered</td>
<td style="vertical-align:top">Fraud Code Entered</td>
<td style="vertical-align:top">The user elected to report fraud during the call resulting in a denied authentication and a blocked phone number.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">117</td>
<td style="vertical-align:top">FAILED_SERVER_ERROR</td>
<td style="vertical-align:top">UserVoiceAuthFailedProviderCouldntSendCall</td>
<td style="vertical-align:top">Unable to Place Call</td>
<td style="vertical-align:top">The Multi-Factor Authentication service was unable to place the call.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">120</td>
<td style="vertical-align:top">FAILED_SMS_NOT_SENT</td>
<td style="vertical-align:top">SMSAuthFailedProviderCouldntSendSMS</td>
<td style="vertical-align:top">Text Message Could Not Be Sent</td>
<td style="vertical-align:top">The text message could not be sent. �The authentication is denied.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">122</td>
<td style="vertical-align:top">FAILED_SMS_OTP_INCORRECT</td>
<td style="vertical-align:top">SMSAuthFailedWrongCodeEntered</td>
<td style="vertical-align:top">Text Message OTP Incorrect</td>
<td style="vertical-align:top">The user entered an incorrect one-time passcode (OTP) from the text message they received. �The authentication is denied.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">123</td>
<td style="vertical-align:top">FAILED_SMS_OTP_PIN_INCORRECT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Text Message OTP + PIN Incorrect</td>
<td style="vertical-align:top">The user entered an incorrect one-time passcode (OTP) and/or an incorrect user PIN. �The authentication is denied.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">146</td>
<td style="vertical-align:top">FAILED_SMS_MAX_OTP_RETRY_REACHED</td>
<td style="vertical-align:top">OathCodeFailedMaxAllowedRetryReached</td>
<td style="vertical-align:top">Exceeded Maximum Text Message OTP Attempts</td>
<td style="vertical-align:top">The user has exceed the maximum number of one-time passcode (OTP) attempts.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">129</td>
<td style="vertical-align:top">FAILED_PHONE_APP_DENIED</td>
<td style="vertical-align:top">PhoneAppDenied</td>
<td style="vertical-align:top">Mobile App Denied</td>
<td style="vertical-align:top">The user denied the authentication in the mobile app by pressing the Deny button.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">130</td>
<td style="vertical-align:top">FAILED_PHONE_APP_INVALID_PIN</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Mobile App Invalid PIN</td>
<td style="vertical-align:top">The user entered an invalid PIN when authenticating in the mobile app.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">131</td>
<td style="vertical-align:top">FAILED_PHONE_APP_PIN_NOT_CHANGED</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Mobile App PIN Not Changed</td>
<td style="vertical-align:top">The user did not successfully complete a required PIN change in the mobile app.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">132</td>
<td style="vertical-align:top">FAILED_FRAUD_REPORTED</td>
<td style="vertical-align:top">PhoneAppFraudReported</td>
<td style="vertical-align:top">Fraud Reported</td>
<td style="vertical-align:top">The user reported fraud in the mobile app.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">133</td>
<td style="vertical-align:top">FAILED_PHONE_APP_NO_RESPONSE</td>
<td style="vertical-align:top">PhoneAppNoResponse</td>
<td style="vertical-align:top">Mobile App No Response</td>
<td style="vertical-align:top">The user did not respond to the mobile app authentication request.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">135</td>
<td style="vertical-align:top">FAILED_PHONE_APP_ALL_DEVICES_BLOCKED</td>
<td style="vertical-align:top">PhoneAppAllDevicesBlocked</td>
<td style="vertical-align:top">Mobile App All Devices Blocked</td>
<td style="vertical-align:top">The mobile app devices for this user are no longer responding to notifications and have been blocked.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">136</td>
<td style="vertical-align:top">FAILED_PHONE_APP_NOTIFICATION_FAILED</td>
<td style="vertical-align:top">PhoneAppNotificationFailed</td>
<td style="vertical-align:top">Mobile App Notification Failed</td>
<td style="vertical-align:top">A failure occurred when attempting to send a notification to the mobile app on the user's device.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">137</td>
<td style="vertical-align:top">FAILED_PHONE_APP_INVALID_RESULT</td>
<td style="vertical-align:top">PhoneAppInvalidResult</td>
<td style="vertical-align:top">Mobile App Invalid Result</td>
<td style="vertical-align:top">The mobile app returned an invalid result.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">138</td>
<td style="vertical-align:top">FAILED_OATH_CODE_INCORRECT</td>
<td style="vertical-align:top">OathCodeIncorrect</td>
<td style="vertical-align:top">OATH Code Incorrect</td>
<td style="vertical-align:top">The user entered an incorrect OATH code.� The authentication is denied.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">147</td>
<td style="vertical-align:top">FAILED_OATH_CODE_PIN_INCORRECT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">OATH Code + PIN Incorrect</td>
<td style="vertical-align:top">The user entered an incorrect OATH code and/or an incorrect user PIN.� The authentication is denied.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">139</td>
<td style="vertical-align:top">FAILED_OATH_CODE_DUPLICATE</td>
<td style="vertical-align:top">OathCodeDuplicate</td>
<td style="vertical-align:top">Duplicate OATH Code</td>
<td style="vertical-align:top">The user entered an OATH code that was previously used.� The authentication is denied.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">140</td>
<td style="vertical-align:top">FAILED_OATH_CODE_OLD</td>
<td style="vertical-align:top">OathCodeOld</td>
<td style="vertical-align:top">OATH Code Out of Date</td>
<td style="vertical-align:top">The user entered an OATH code that precedes an OATH code that was previously used.� The authentication is denied.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">142</td>
<td style="vertical-align:top">FAILED_OATH_TOKEN_TIMEOUT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">OATH Code Result Timeout</td>
<td style="vertical-align:top">The user took too long to enter the OATH code and the Multi-Factor Authentication attempt had already timed out.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">143</td>
<td style="vertical-align:top">FAILED_SECURITY_QUESTIONS_TIMEOUT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Security Questions Result Timeout</td>
<td style="vertical-align:top">The user took too long to enter answer to security questions and the Multi-Factor Authentication attempt had already timed out.</td>
</tr>
<tr class="odd">
<td style="vertical-align:top">144</td>
<td style="vertical-align:top">FAILED_AUTH_RESULT_TIMEOUT</td>
<td style="vertical-align:top">n/a</td>
<td style="vertical-align:top">Auth Result Timeout</td>
<td style="vertical-align:top">The user took too long to complete the Multi-Factor Authentication attempt.</td>
</tr>
<tr class="even">
<td style="vertical-align:top">150</td>
<td style="vertical-align:top">FAILED_AUTHENTICATION_THROTTLED</td>
<td style="vertical-align:top">AuthenticationThrottled</td>
<td style="vertical-align:top">Authentication Throttled</td>
<td style="vertical-align:top">The Multi-Factor Authentication attempt was throttled by the service.</td>
</tr>
</tbody>
</table>

# MFA-SAS-Summary

Includes SASPerRequestEvent and MfaStatusEvent logs combined which give a good summary of SAS activity. SAS logs include AAD Sign-Ins (EvoSTS) and Hybrid Sign-Ins (NPS Extension and Azure MFA AD FS Adapter). All examples are AAD Sign-Ins.

Can use Correlation/Tracking ID, Original Request ID, or User Object ID to qualify records. Note that Tracking ID or Original Request ID will be used to determine User Object ID and all logs for the user in the time range are displayed.

## Success

### Mobile App Success

| DateTime             | Source      | AuthMethod           | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/23/2019 8:50:12 PM | MFA Status  | PhoneAppNotification | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/23/2019 8:50:12 PM | Per Request | PhoneAppNotification | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/23/2019 8:50:13 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/23/2019 8:50:14 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/23/2019 8:50:16 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/23/2019 8:50:17 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/23/2019 8:50:18 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/23/2019 8:50:19 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/23/2019 8:50:19 PM | MFA Status  | PhoneAppNotification | PfdCallback               | Success                                                                                                                                                                   |           |

### Phone Call Success

| DateTime              | Source      | AuthMethod        | Operation                 | Message                                                                                                                                                                   | TraceCode |
| --------------------- | ----------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/24/2019 12:26:14 AM | MFA Status  | TwoWayVoiceMobile | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/24/2019 12:26:14 AM | Per Request | TwoWayVoiceMobile | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/24/2019 12:26:20 AM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/24/2019 12:26:25 AM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/24/2019 12:26:29 AM | MFA Status  | TwoWayVoiceMobile | PfdCallback               | Success                                                                                                                                                                   |           |
| 4/24/2019 12:26:30 AM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |

### Text Message Success

| DateTime              | Source      | AuthMethod | Operation                 | Message                                                                                        | TraceCode |
| --------------------- | ----------- | ---------- | ------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| 4/24/2019 12:27:05 AM | Per Request | OneWaySMS  | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |
| 4/24/2019 12:27:05 AM | MFA Status  | OneWaySMS  | BeginTwoWayAuthentication | AuthenticationPending                                                                          |           |
| 4/24/2019 12:27:06 AM | MFA Status  | OneWaySMS  | PfdCallback               | SMSSent                                                                                        |           |
| 4/24/2019 12:27:17 AM | MFA Status  | OneWaySMS  | EndTwoWayAuthentication   | Success                                                                                        |           |
| 4/24/2019 12:27:17 AM | Per Request | OneWaySMS  | EndTwoWayAuthentication   | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |

### OATH Token Success

| DateTime              | Source      | AuthMethod  | Operation                 | Message                                                                                        | TraceCode |
| --------------------- | ----------- | ----------- | ------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| 4/24/2019 12:28:53 AM | MFA Status  | PhoneAppOTP | BeginTwoWayAuthentication | AuthenticationPending                                                                          |           |
| 4/24/2019 12:28:53 AM | Per Request | PhoneAppOTP | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |
| 4/24/2019 12:29:03 AM | MFA Status  | PhoneAppOTP | EndTwoWayAuthentication   | Success                                                                                        |           |
| 4/24/2019 12:29:03 AM | Per Request | PhoneAppOTP | EndTwoWayAuthentication   | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |

## Failure

### Mobile App No Response

| DateTime             | Source      | AuthMethod           | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:24:14 PM | Per Request | PhoneAppNotification | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:24:14 PM | MFA Status  | PhoneAppNotification | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:24:16 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:17 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:18 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:19 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:20 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:21 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:23 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:24 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:25 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:24:27 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| etc                  |             |                      |                           |                                                                                                                                                                           |           |
| 4/29/2019 6:24:59 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:25:01 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:25:04 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:25:07 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:25:09 PM | MFA Status  | PhoneAppNotification | PfdCallback               | PhoneAppNoResponse                                                                                                                                                        |           |
| 4/29/2019 6:25:10 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"PhoneAppNoResponse","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                                      |           |

### Mobile App Denied

| DateTime             | Source      | AuthMethod           | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:26:33 PM | MFA Status  | PhoneAppNotification | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:26:33 PM | Per Request | PhoneAppNotification | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:26:35 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:36 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:37 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:38 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:39 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:40 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:26:41 PM | MFA Status  | PhoneAppNotification | PfdCallback               | PhoneAppDenied                                                                                                                                                            |           |
| 4/29/2019 6:26:42 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"PhoneAppDenied","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                                          |           |

### Mobile App Fraud Reported

| DateTime             | Source      | AuthMethod           | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:28:13 PM | MFA Status  | PhoneAppNotification | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:28:13 PM | Per Request | PhoneAppNotification | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:28:14 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:28:16 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:28:17 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:28:17 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:28:19 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:28:20 PM | MFA Status  | PhoneAppNotification | PfdCallback               | PhoneAppFraudReported                                                                                                                                                     |           |
| 4/29/2019 6:28:20 PM | Per Request | PhoneAppNotification | EndTwoWayAuthentication   | {"value":"PhoneAppFraudReported","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                                   |           |

### Phone Call Voicemail

The same result will occur when user answers the phone, but there are DTMF issues and the prompt times out.

| DateTime             | Source      | AuthMethod        | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:30:13 PM | MFA Status  | TwoWayVoiceMobile | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:30:13 PM | Per Request | TwoWayVoiceMobile | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:30:20 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:25 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:31 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:36 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:42 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:48 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:30:55 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:31:01 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:31:08 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:31:15 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:31:17 PM | MFA Status  | TwoWayVoiceMobile | PfdCallback               | UserVoiceAuthFailedCallWentToVoicemail                                                                                                                                    |           |
| 4/29/2019 6:25:23 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"UserVoiceAuthFailedCallWentToVoicemail","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                  |           |

### Phone Call Hung Up

| DateTime             | Source      | AuthMethod        | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:32:52 PM | Per Request | TwoWayVoiceMobile | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:32:52 PM | MFA Status  | TwoWayVoiceMobile | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:32:57 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:33:03 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:33:08 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:33:10 PM | MFA Status  | TwoWayVoiceMobile | PfdCallback               | UserVoiceAuthFailedPhoneHungUp                                                                                                                                            |           |
| 4/29/2019 6:33:13 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"UserVoiceAuthFailedPhoneHungUp","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                          |           |

### Phone Call Fraud Code

| DateTime             | Source      | AuthMethod        | Operation                 | Message                                                                                                                                                                   | TraceCode |
| -------------------- | ----------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:34:03 PM | Per Request | TwoWayVoiceMobile | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                                                            |           |
| 4/29/2019 6:34:03 PM | MFA Status  | TwoWayVoiceMobile | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                                                     |           |
| 4/29/2019 6:34:08 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:34:14 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:34:19 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:34:25 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"AuthenticationPending","message":"The authentication has not been completed yet, please try again.","resultType":"","retry":true,"Error":null,"Exception":null} |           |
| 4/29/2019 6:34:27 PM | MFA Status  | TwoWayVoiceMobile | PfdCallback               | FraudCodeEntered                                                                                                                                                          |           |
| 4/29/2019 6:34:31 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"FraudCodeEntered","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null}                                        |           |

### Phone Call User Is Blocked

| DateTime             | Source      | AuthMethod        | Operation                 | Message                                                                                                                         | TraceCode |
| -------------------- | ----------- | ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:35:43 PM | Per Request | TwoWayVoiceMobile | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                  |           |
| 4/29/2019 6:35:43 PM | MFA Status  | TwoWayVoiceMobile | BeginTwoWayAuthentication | AuthenticationPending                                                                                                           |           |
| 4/29/2019 6:35:45 PM | MFA Status  | TwoWayVoiceMobile | PfdCallback               | UserIsBlocked                                                                                                                   |           |
| 4/29/2019 6:35:49 PM | Per Request | TwoWayVoiceMobile | EndTwoWayAuthentication   | {"value":"UserIsBlocked","message":"Authentication method failed.","resultType":"","retry":false,"Error":null,"Exception":null} |           |

### Text Message Wrong Code

| DateTime             | Source      | AuthMethod | Operation                 | Message                                                                                                                               | TraceCode |
| -------------------- | ----------- | ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:37:45 PM | MFA Status  | OneWaySMS  | BeginTwoWayAuthentication | AuthenticationPending                                                                                                                 |           |
| 4/29/2019 6:37:45 PM | Per Request | OneWaySMS  | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                                        |           |
| 4/29/2019 6:37:47 PM | MFA Status  | OneWaySMS  | PfdCallback               | SMSSent                                                                                                                               |           |
| 4/29/2019 6:37:59 PM | MFA Status  | OneWaySMS  | EndTwoWayAuthentication   | SMSAuthFailedWrongCodeEntered                                                                                                         |           |
| 4/29/2019 6:37:59 PM | Per Request | OneWaySMS  | EndTwoWayAuthentication   | {"value":"SMSAuthFailedWrongCodeEntered","message":"Wrong code entered.","resultType":"","retry":false,"Error":null,"Exception":null} |           |

### Text Message No Code

| DateTime             | Source      | AuthMethod | Operation                 | Message                                                                                        | TraceCode |
| -------------------- | ----------- | ---------- | ------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:38:28 PM | MFA Status  | OneWaySMS  | BeginTwoWayAuthentication | AuthenticationPending                                                                          |           |
| 4/29/2019 6:38:28 PM | Per Request | OneWaySMS  | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |
| 4/29/2019 6:38:29 PM | MFA Status  | OneWaySMS  | PfdCallback               | SMSSent                                                                                        |           |

### OATH Token Wrong Code

| DateTime             | Source      | AuthMethod  | Operation                 | Message                                                                                                                   | TraceCode |
| -------------------- | ----------- | ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:40:22 PM | Per Request | PhoneAppOTP | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null}                            |           |
| 4/29/2019 6:40:22 PM | MFA Status  | PhoneAppOTP | BeginTwoWayAuthentication | AuthenticationPending                                                                                                     |           |
| 4/29/2019 6:40:35 PM | MFA Status  | PhoneAppOTP | EndTwoWayAuthentication   | OathCodeIncorrect                                                                                                         |           |
| 4/29/2019 6:40:35 PM |             | PhoneAppOTP | EndTwoWayAuthentication   | {"value":"OathCodeIncorrect","message":"Wrong code entered.","resultType":"","retry":false,"Error":null,"Exception":null} |           |

### OATH Token No Code

| DateTime             | Source      | AuthMethod  | Operation                 | Message                                                                                        | TraceCode |
| -------------------- | ----------- | ----------- | ------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| 4/29/2019 6:40:59 PM | MFA Status  | PhoneAppOTP | BeginTwoWayAuthentication | AuthenticationPending                                                                          |           |
| 4/29/2019 6:40:59 PM | Per Request | PhoneAppOTP | BeginTwoWayAuthentication | {"value":"Success","message":null,"resultType":"","retry":false,"Error":null,"Exception":null} |           |

# MFA-SAS-Detailed

Same as MFA-SAS-Summary, but adds SASCommonEvent logs which give full processing details and might be useful for uncovering underlying issues. SAS logs include AAD Sign-Ins (EvoSTS) and Hybrid Sign-Ins (NPS Extension and Azure MFA AD FS Adapter).

Can use Correlation/Tracking ID, Original Request ID, or User Object ID to qualify records. Note that Tracking ID or Original Request ID will be used to determine User Object ID and all logs for the user in the time range are displayed.

Examples are very lengthy, so not included here.

# MFA-SAS-Backend

Includes Pfsyslog (MFA Backend) logs, but starts with SASPerRequestEvent to only include records related to a SAS MFA attempt. These logs include AAD Sign-Ins (EvoSTS) and Hybrid Sign-Ins (NPS Extension and Azure MFA AD FS Adapter). All examples are AAD Sign-Ins.

Can use Correlation/Tracking ID, Original Request ID, or User Object ID to qualify records. Note that Tracking ID or Original Request ID will be used to determine User Object ID and all logs for the user in the time range are displayed.

## Success

### Mobile App Success

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription        |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ------------------------ |
| 4/23/2019 8:50:12 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                          |
| 4/23/2019 8:50:12 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                          |
| 4/23/2019 8:50:12 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending           |
| 4/23/2019 8:50:12 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                          |
| 4/23/2019 8:50:12 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                          |
| 4/23/2019 8:50:12 PM | MFA Backend | phoneApp   | authenticationRequest info                                                               | 1034  |               |            |                          |
| 4/23/2019 8:50:12 PM | MFA Backend |            | Sending push notification                                                                | 1106  |               |            |                          |
| 4/23/2019 8:50:13 PM | MFA Backend |            | Push notification(s) sent, waiting for response                                          | 1111  |               |            |                          |
| 4/23/2019 8:50:17 PM | MFA Backend |            | phoneAppAuthenticationRequest info                                                       | 4301  |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | phoneAppAuthenticationRequest complete                                                   | 4303  |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info                                                 | 4401  |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete                                             | 4404  |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | Got mobile app response                                                                  | 1113  |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 1             | 21         | Mobile App Authenticated |
| 4/23/2019 8:50:18 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                          |
| 4/23/2019 8:50:18 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                          |
| 4/23/2019 8:50:19 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                          |

### Phone Call Success

| DateTime              | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/24/2019 12:26:14 AM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/24/2019 12:26:14 AM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/24/2019 12:26:14 AM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/24/2019 12:26:15 AM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/24/2019 12:26:15 AM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/24/2019 12:26:15 AM | MFA Backend | voice      | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/24/2019 12:26:15 AM | MFA Backend |            | Call file written                                                                        | 1041  |               |            |                   |
| 4/24/2019 12:26:15 AM | MFA Backend |            | Call placed for phone                                                                    | 1045  |               |            |                   |
| 4/24/2019 12:26:28 AM | MFA Backend |            | Call completed                                                                           | 1049  |               |            |                   |
| 4/24/2019 12:26:28 AM | MFA Backend |            | Provider result                                                                          | 1177  | 1             | 2          | No PIN Entered    |
| 4/24/2019 12:26:28 AM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 1             | 2          | No PIN Entered    |
| 4/24/2019 12:26:28 AM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/24/2019 12:26:28 AM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/24/2019 12:26:29 AM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### Text Message Success

Currently we can't correlate the second request to the MFA Backend that provides the final result of the Text Message attempt. An enhancement to SAS logging will provide for this and we'll update the example when this is working.

| DateTime              | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/24/2019 12:27:05 AM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/24/2019 12:27:05 AM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/24/2019 12:27:05 AM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/24/2019 12:27:05 AM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/24/2019 12:27:05 AM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/24/2019 12:27:05 AM | MFA Backend | sms        | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Sending SMS message                                                                      | 1058  |               |            |                   |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 20         | Text Message Sent |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Creating temporary avoid for one way sms                                                 | 1162  |               | 20         | Text Message Sent |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Creating temporary avoid                                                                 | 1164  |               |            |                   |
| 4/24/2019 12:27:06 AM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 20         | Text Message Sent |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/24/2019 12:27:06 AM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### OATH Token Success

OATH Token attempts are now entirely handled by SAS and no longer result in requests to the MFA Backend.

## Failure

### Mobile App No Response

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription      |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ---------------------- |
| 4/29/2019 6:24:14 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                        |
| 4/29/2019 6:24:14 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                        |
| 4/29/2019 6:24:14 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending         |
| 4/29/2019 6:24:14 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                        |
| 4/29/2019 6:24:14 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                        |
| 4/29/2019 6:24:14 PM | MFA Backend | phoneApp   | authenticationRequest info                                                               | 1034  |               |            |                        |
| 4/29/2019 6:24:14 PM | MFA Backend |            | Sending push notification                                                                | 1106  |               |            |                        |
| 4/29/2019 6:24:16 PM | MFA Backend |            | Push notification(s) sent, waiting for response                                          | 1111  |               |            |                        |
| 4/29/2019 6:25:09 PM | MFA Backend |            | Couldn't read responding device token from cloud                                         | 1112  |               |            |                        |
| 4/29/2019 6:25:09 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 133        | Mobile App No Response |
| 4/29/2019 6:25:09 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                        |
| 4/29/2019 6:25:09 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                        |
| 4/29/2019 6:25:09 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                        |

### Mobile App Denied

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/29/2019 6:26:33 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:26:33 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/29/2019 6:26:33 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/29/2019 6:26:33 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/29/2019 6:26:33 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:26:33 PM | MFA Backend | phoneApp   | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/29/2019 6:26:33 PM | MFA Backend |            | Sending push notification                                                                | 1106  |               |            |                   |
| 4/29/2019 6:26:35 PM | MFA Backend |            | Push notification(s) sent, waiting for response                                          | 1111  |               |            |                   |
| 4/29/2019 6:26:38 PM | MFA Backend |            | phoneAppAuthenticationRequest info                                                       | 4301  |               |            |                   |
| 4/29/2019 6:26:38 PM | MFA Backend |            | phoneAppAuthenticationRequest complete                                                   | 4303  |               |            |                   |
| 4/29/2019 6:26:40 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info                                                 | 4401  |               |            |                   |
| 4/29/2019 6:26:40 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete                                             | 4404  |               |            |                   |
| 4/29/2019 6:26:40 PM | MFA Backend |            | Got mobile app response                                                                  | 1113  |               |            |                   |
| 4/29/2019 6:26:40 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 129        | Mobile App Denied |
| 4/29/2019 6:26:40 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/29/2019 6:26:40 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/29/2019 6:26:41 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### Mobile App Fraud Reported

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/29/2019 6:28:13 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:28:13 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/29/2019 6:28:13 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/29/2019 6:28:13 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/29/2019 6:28:13 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:28:13 PM | MFA Backend | phoneApp   | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/29/2019 6:28:13 PM | MFA Backend |            | Sending push notification                                                                | 1106  |               |            |                   |
| 4/29/2019 6:28:14 PM | MFA Backend |            | Push notification(s) sent, waiting for response                                          | 1111  |               |            |                   |
| 4/29/2019 6:28:14 PM | MFA Backend |            | phoneAppAuthenticationRequest info                                                       | 4301  |               |            |                   |
| 4/29/2019 6:28:14 PM | MFA Backend |            | phoneAppAuthenticationRequest complete                                                   | 4303  |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info                                                 | 4401  |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete                                             | 4404  |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | Got mobile app response                                                                  | 1113  |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 132        | Fraud Reported    |
| 4/29/2019 6:28:19 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/29/2019 6:28:19 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### Phone Call Voicemail

The same result will occur when user answers the phone, but there are DTMF issues and the prompt times out.

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription          |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | -------------------------- |
| 4/29/2019 6:30:13 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                            |
| 4/29/2019 6:30:13 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                            |
| 4/29/2019 6:30:13 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending             |
| 4/29/2019 6:30:14 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                            |
| 4/29/2019 6:30:14 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                            |
| 4/29/2019 6:30:14 PM | MFA Backend | voice      | authenticationRequest info                                                               | 1034  |               |            |                            |
| 4/29/2019 6:30:14 PM | MFA Backend |            | Call file written                                                                        | 1041  |               |            |                            |
| 4/29/2019 6:30:14 PM | MFA Backend |            | Call placed for phone                                                                    | 1045  |               |            |                            |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Call completed                                                                           | 1049  |               |            |                            |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 4          | No Phone Input - Timed Out |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1068  |               | 4          | No Phone Input - Timed Out |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1164  |               |            |                            |
| 4/29/2019 6:31:17 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 4          | No Phone Input - Timed Out |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                            |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                            |
| 4/29/2019 6:31:17 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                            |

### Phone Call Hung Up

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription      |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ---------------------- |
| 4/29/2019 6:32:52 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                        |
| 4/29/2019 6:32:52 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                        |
| 4/29/2019 6:32:52 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending         |
| 4/29/2019 6:32:52 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                        |
| 4/29/2019 6:32:52 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                        |
| 4/29/2019 6:32:52 PM | MFA Backend | voice      | authenticationRequest info                                                               | 1034  |               |            |                        |
| 4/29/2019 6:32:53 PM | MFA Backend |            | Call file written                                                                        | 1041  |               |            |                        |
| 4/29/2019 6:32:53 PM | MFA Backend |            | Call placed for phone                                                                    | 1045  |               |            |                        |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Call completed                                                                           | 1049  |               |            |                        |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 108        | User Hung Up the Phone |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1068  |               | 108        | User Hung Up the Phone |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1164  |               |            |                        |
| 4/29/2019 6:33:10 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 108        | User Hung Up the Phone |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                        |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                        |
| 4/29/2019 6:33:10 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                        |

### Phone Call Fraud Code

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription  |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ------------------ |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending     |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend | voice      | authenticationRequest info                                                               | 1034  |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Call file written                                                                        | 1041  |               |            |                    |
| 4/29/2019 6:34:03 PM | MFA Backend |            | Call placed for phone                                                                    | 1045  |               |            |                    |
| 4/29/2019 6:34:27 PM | MFA Backend |            | Call completed                                                                           | 1049  |               |            |                    |
| 4/29/2019 6:34:27 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 112        | Fraud Code Entered |
| 4/29/2019 6:34:27 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 112        | Fraud Code Entered |
| 4/29/2019 6:34:27 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                    |
| 4/29/2019 6:34:27 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                    |
| 4/29/2019 6:34:27 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                    |

### Phone Call User Is Blocked

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/29/2019 6:35:43 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:35:43 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/29/2019 6:35:43 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/29/2019 6:35:43 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:35:44 PM | MFA Backend | voice      | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | Got auth request for blocked user                                                        | 1037  |               |            |                   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 14         | User is Blocked   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 14         | User is Blocked   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/29/2019 6:35:44 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/29/2019 6:35:45 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### Text Message Wrong Code

Currently we can't correlate the second request to the MFA Backend that provides the final result of the Text Message attempt. An enhancement to SAS logging will provide for this and we'll update the example when this is working.

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/29/2019 6:37:45 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:37:45 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/29/2019 6:37:45 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend | sms        | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Sending SMS message                                                                      | 1058  |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 20         | Text Message Sent |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Creating temporary avoid for one way sms                                                 | 1162  |               | 20         | Text Message Sent |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1164  |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 20         | Text Message Sent |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/29/2019 6:37:46 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/29/2019 6:37:47 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### Text Message No Code

MFA Backend is not called again after text message is sent since user never entered a code.

| DateTime             | Source      | AuthMethod | Message                                                                                  | LogId | Authenticated | ResultCode | ResultDescription |
| -------------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/29/2019 6:38:27 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:38:27 PM | MFA Backend |            | Forwarding async request                                                                 | 1013  |               |            |                   |
| 4/29/2019 6:38:27 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 15         | Status Pending    |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Forwarding async request to pfd                                                          |       |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Received authRequest                                                                     | 1000  |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend | sms        | authenticationRequest info                                                               | 1034  |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Sending SMS message                                                                      | 1058  |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Provider result                                                                          | 1177  | 0             | 20         | Text Message Sent |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Creating temporary avoid for one way sms                                                 | 1162  |               | 20         | Text Message Sent |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Creating temporary avoid                                                                 | 1164  |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend |            | authenticationRequest complete                                                           | 1092  | 0             | 20         | Text Message Sent |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Received response from pfd                                                               |       |               |            |                   |
| 4/29/2019 6:38:28 PM | MFA Backend |            | Posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx          |       |               |            |                   |
| 4/29/2019 6:38:29 PM | MFA Backend |            | Finished posting response to callback wus.adnotifications.windowsazure.com/Callback.aspx |       |               |            |                   |

### OATH Token Wrong Code

OATH Token attempts are now entirely handled by SAS and no longer result in requests to the MFA Backend.

### OATH Token No Code

OATH Token attempts are now entirely handled by SAS and no longer result in requests to the MFA Backend.

# MFA-Server-Backend

Includes Pfsyslog (MFA Backend) logs related to MFA Server.

Can use PfdRequestId for a specific MFA attempt or \* for all attempts to qualify records.

In recent versions of MFA Server, the MultiFactorAuthSvc logs include the PfdRequestId for interactions with the MFA Backend.

2019-04-23T17:22:14.516730Z|i|18288|26784|pfsvc|**82a3db8d-3317-43f7-b203-6ba81cba93c9**|Pfauth succeeded for user '\<username\>'. Call status: SUCCESS\_PHONE\_APP\_AUTHENTICATED - "Mobile App Authenticated".

## Success

### Mobile App Success

| DateTime              | Source      | AuthMethod | Message                                         | LogId | Authenticated | ResultCode | ResultDescription        |
| --------------------- | ----------- | ---------- | ----------------------------------------------- | ----- | ------------- | ---------- | ------------------------ |
| 4/30/2019 10:44:29 PM | MFA Backend |            | Received authRequest                            | 1000  |               |            |                          |
| 4/30/2019 10:44:29 PM | MFA Backend | phoneApp   | authenticationRequest info                      | 1034  |               |            |                          |
| 4/30/2019 10:44:30 PM | MFA Backend |            | Sending push notification                       | 1106  |               |            |                          |
| 4/30/2019 10:44:30 PM | MFA Backend |            | phoneAppAuthenticationRequest info              | 4301  |               |            |                          |
| 4/30/2019 10:44:30 PM | MFA Backend |            | phoneAppAuthenticationRequest complete          | 4303  |               |            |                          |
| 4/30/2019 10:44:31 PM | MFA Backend |            | Push notification(s) sent, waiting for response | 1111  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | phoneAppPinValidationRequest info               | 4901  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | phoneAppPinValidationRequest complete           | 4903  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info        | 4401  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete    | 4404  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | Got mobile app response                         | 1113  |               |            |                          |
| 4/30/2019 10:44:35 PM | MFA Backend |            | authenticationRequest complete                  | 1092  | 1             | 21         | Mobile App Authenticated |

### Phone Call Success

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:46:04 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 10:46:04 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 10:46:04 PM | MFA Backend |            | Call file written              | 1041  |               |            |                   |
| 4/30/2019 10:46:04 PM | MFA Backend |            | Call placed for phone          | 1045  |               |            |                   |
| 4/30/2019 10:46:17 PM | MFA Backend |            | Call completed                 | 1049  |               |            |                   |
| 4/30/2019 10:46:17 PM | MFA Backend |            | Provider result                | 1177  | 1             | 1          | PIN Entered       |
| 4/30/2019 10:46:18 PM | MFA Backend |            | authenticationRequest complete | 1092  | 1             | 1          | PIN Entered       |

### Phone Call One-Time Bypass

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:46:45 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 10:46:45 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 10:46:45 PM | MFA Backend |            | Provider result                | 1177  | 1             | 7          | Bypassed Auth     |
| 4/30/2019 10:46:45 PM | MFA Backend |            | authenticationRequest complete | 1092  | 1             | 7          | Bypassed Auth     |

### Phone Call Used Cache

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:47:57 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 10:47:57 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 10:47:58 PM | MFA Backend |            | Using user cache from cloud    | 1121  |               |            |                   |
| 4/30/2019 10:47:58 PM | MFA Backend |            | Provider result                | 1177  | 1             | 6          | Used Cache        |
| 4/30/2019 10:47:58 PM | MFA Backend |            | authenticationRequest complete | 1092  | 1             | 6          | Used Cache        |

### Text Message Success

Currently we can't correlate the second request that provides the final result of the Text Message attempt. An enhancement to ASC query will fix this and we'll update the example when this is working.

| DateTime              | Source      | AuthMethod | Message                                  | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ---------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:48:43 PM | MFA Backend |            | Received authRequest                     | 1000  |               |            |                   |
| 4/30/2019 10:48:43 PM | MFA Backend | sms        | authenticationRequest info               | 1034  |               |            |                   |
| 4/30/2019 10:48:44 PM | MFA Backend |            | Sending SMS message                      | 1058  |               |            |                   |
| 4/30/2019 10:48:44 PM | MFA Backend |            | Provider result                          | 1177  | 0             | 20         | Text Message Sent |
| 4/30/2019 10:48:44 PM | MFA Backend |            | Creating temporary avoid for one way sms | 1162  |               | 20         | Text Message Sent |
| 4/30/2019 10:48:44 PM | MFA Backend |            | Creating temporary avoid                 | 1164  |               |            |                   |
| 4/30/2019 10:48:44 PM | MFA Backend |            | authenticationRequest complete           | 1092  | 0             | 20         | Text Message Sent |

### OATH Token Success

Currently we can't correlate the second request that provides the final result of the OATH Token attempt. An enhancement to ASC query will fix this and we'll update the example when this is working.

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:50:00 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 10:50:00 PM | MFA Backend | oathToken  | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 10:50:00 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 22         | OATH Code Pending |

## Failure

### Mobile App No Response

| DateTime              | Source      | AuthMethod | Message                                          | LogId | Authenticated | ResultCode | ResultDescription      |
| --------------------- | ----------- | ---------- | ------------------------------------------------ | ----- | ------------- | ---------- | ---------------------- |
| 4/30/2019 10:51:01 PM | MFA Backend |            | Received authRequest                             | 1000  |               |            |                        |
| 4/30/2019 10:51:01 PM | MFA Backend | phoneApp   | authenticationRequest info                       | 1034  |               |            |                        |
| 4/30/2019 10:51:01 PM | MFA Backend |            | Sending push notification                        | 1106  |               |            |                        |
| 4/30/2019 10:51:02 PM | MFA Backend |            | Push notification(s) sent, waiting for response  | 1111  |               |            |                        |
| 4/30/2019 10:51:56 PM | MFA Backend |            | Couldn't read responding device token from cloud | 1112  |               |            |                        |
| 4/30/2019 10:51:56 PM | MFA Backend |            | authenticationRequest complete                   | 1092  | 0             | 133        | Mobile App No Response |

### Mobile App Denied

| DateTime              | Source      | AuthMethod | Message                                         | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ----------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:52:10 PM | MFA Backend |            | Received authRequest                            | 1000  |               |            |                   |
| 4/30/2019 10:52:10 PM | MFA Backend | phoneApp   | authenticationRequest info                      | 1034  |               |            |                   |
| 4/30/2019 10:52:10 PM | MFA Backend |            | Sending push notification                       | 1106  |               |            |                   |
| 4/30/2019 10:52:12 PM | MFA Backend |            | Push notification(s) sent, waiting for response | 1111  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | phoneAppAuthenticationRequest info              | 4301  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | phoneAppAuthenticationRequest complete          | 4303  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info        | 4401  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete    | 4404  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | Got mobile app response                         | 1113  |               |            |                   |
| 4/30/2019 10:52:17 PM | MFA Backend |            | authenticationRequest complete                  | 1092  | 0             | 129        | Mobile App Denied |

### Mobile App Fraud Reported

| DateTime              | Source      | AuthMethod | Message                                         | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ----------------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 10:52:36 PM | MFA Backend |            | Received authRequest                            | 1000  |               |            |                   |
| 4/30/2019 10:52:36 PM | MFA Backend | phoneApp   | authenticationRequest info                      | 1034  |               |            |                   |
| 4/30/2019 10:52:36 PM | MFA Backend |            | Sending push notification                       | 1106  |               |            |                   |
| 4/30/2019 10:52:37 PM | MFA Backend |            | phoneAppAuthenticationRequest info              | 4301  |               |            |                   |
| 4/30/2019 10:52:37 PM | MFA Backend |            | phoneAppAuthenticationRequest complete          | 4303  |               |            |                   |
| 4/30/2019 10:52:37 PM | MFA Backend |            | Push notification(s) sent, waiting for response | 1111  |               |            |                   |
| 4/30/2019 10:52:44 PM | MFA Backend |            | phoneAppAuthenticationResultRequest info        | 4401  |               |            |                   |
| 4/30/2019 10:52:44 PM | MFA Backend |            | phoneAppAuthenticationResultRequest complete    | 4404  |               |            |                   |
| 4/30/2019 10:52:44 PM | MFA Backend |            | Got mobile app response                         | 1113  |               |            |                   |
| 4/30/2019 10:52:45 PM | MFA Backend |            | authenticationRequest complete                  | 1092  | 0             | 132        | Fraud Reported    |

### Phone Call Voicemail

The same result will occur when user answers the phone, but there are DTMF issues and the prompt times out.

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription          |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | -------------------------- |
| 4/30/2019 10:58:14 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                            |
| 4/30/2019 10:58:14 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                            |
| 4/30/2019 10:58:15 PM | MFA Backend |            | Call file written              | 1041  |               |            |                            |
| 4/30/2019 10:58:15 PM | MFA Backend |            | Call placed for phone          | 1045  |               |            |                            |
| 4/30/2019 10:59:18 PM | MFA Backend |            | Call completed                 | 1049  |               |            |                            |
| 4/30/2019 10:59:18 PM | MFA Backend |            | Provider result                | 1177  | 0             | 4          | No Phone Input - Timed Out |
| 4/30/2019 10:59:18 PM | MFA Backend |            | Creating temporary avoid       | 1068  |               | 4          | No Phone Input - Timed Out |
| 4/30/2019 10:59:18 PM | MFA Backend |            | Creating temporary avoid       | 1164  |               |            |                            |
| 4/30/2019 10:59:18 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 4          | No Phone Input - Timed Out |

### Phone Call Hung Up

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription      |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ---------------------- |
| 4/30/2019 10:59:42 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                        |
| 4/30/2019 10:59:42 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                        |
| 4/30/2019 10:59:43 PM | MFA Backend |            | Call file written              | 1041  |               |            |                        |
| 4/30/2019 10:59:43 PM | MFA Backend |            | Call placed for phone          | 1045  |               |            |                        |
| 4/30/2019 10:59:54 PM | MFA Backend |            | Call completed                 | 1049  |               |            |                        |
| 4/30/2019 10:59:54 PM | MFA Backend |            | Provider result                | 1177  | 0             | 108        | User Hung Up the Phone |
| 4/30/2019 10:59:54 PM | MFA Backend |            | Creating temporary avoid       | 1068  |               | 108        | User Hung Up the Phone |
| 4/30/2019 10:59:54 PM | MFA Backend |            | Creating temporary avoid       | 1164  |               |            |                        |
| 4/30/2019 10:59:54 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 108        | User Hung Up the Phone |

### Phone Call Fraud Code

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription  |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ------------------ |
| 4/30/2019 11:00:04 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                    |
| 4/30/2019 11:00:04 PM | MFA Backend | voice      | authenticationRequest info     | 1034  |               |            |                    |
| 4/30/2019 11:00:04 PM | MFA Backend |            | Call file written              | 1041  |               |            |                    |
| 4/30/2019 11:00:04 PM | MFA Backend |            | Call placed for phone          | 1045  |               |            |                    |
| 4/30/2019 11:00:18 PM | MFA Backend |            | Call completed                 | 1049  |               |            |                    |
| 4/30/2019 11:00:18 PM | MFA Backend |            | Provider result                | 1177  | 0             | 112        | Fraud Code Entered |
| 4/30/2019 11:00:18 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 112        | Fraud Code Entered |

### Phone Call User Is Blocked

| DateTime              | Source      | AuthMethod | Message                           | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | --------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 11:00:46 PM | MFA Backend |            | Received authRequest              | 1000  |               |            |                   |
| 4/30/2019 11:00:46 PM | MFA Backend | voice      | authenticationRequest info        | 1034  |               |            |                   |
| 4/30/2019 11:00:47 PM | MFA Backend |            | Got auth request for blocked user | 1037  |               |            |                   |
| 4/30/2019 11:00:47 PM | MFA Backend |            | Provider result                   | 1177  | 0             | 14         | User is Blocked   |
| 4/30/2019 11:00:47 PM | MFA Backend |            | authenticationRequest complete    | 1092  | 0             | 14         | User is Blocked   |

### Text Message Wrong Code

Currently we can't correlate the second request that provides the final result of the Text Message attempt. An enhancement to ASC query will fix this and we'll update the example when this is working.

| DateTime              | Source      | AuthMethod | Message                                  | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ---------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 11:01:24 PM | MFA Backend |            | Received authRequest                     | 1000  |               |            |                   |
| 4/30/2019 11:01:24 PM | MFA Backend | sms        | authenticationRequest info               | 1034  |               |            |                   |
| 4/30/2019 11:01:24 PM | MFA Backend |            | Sending SMS message                      | 1058  |               |            |                   |
| 4/30/2019 11:01:24 PM | MFA Backend |            | Provider result                          | 1177  | 0             | 20         | Text Message Sent |
| 4/30/2019 11:01:24 PM | MFA Backend |            | Creating temporary avoid for one way sms | 1162  |               | 20         | Text Message Sent |
| 4/30/2019 11:01:24 PM | MFA Backend |            | Creating temporary avoid                 | 1164  |               |            |                   |
| 4/30/2019 11:01:25 PM | MFA Backend |            | authenticationRequest complete           | 1092  | 0             | 20         | Text Message Sent |

### Text Message No Code

MFA Backend is not called again after text message is sent since user never entered a code.

| DateTime              | Source      | AuthMethod | Message                                  | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ---------------------------------------- | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 11:01:47 PM | MFA Backend |            | Received authRequest                     | 1000  |               |            |                   |
| 4/30/2019 11:01:47 PM | MFA Backend | sms        | authenticationRequest info               | 1034  |               |            |                   |
| 4/30/2019 11:01:47 PM | MFA Backend |            | Sending SMS message                      | 1058  |               |            |                   |
| 4/30/2019 11:01:47 PM | MFA Backend |            | Provider result                          | 1177  | 0             | 20         | Text Message Sent |
| 4/30/2019 11:01:47 PM | MFA Backend |            | Creating temporary avoid for one way sms | 1162  |               | 20         | Text Message Sent |
| 4/30/2019 11:01:47 PM | MFA Backend |            | Creating temporary avoid                 | 1164  |               |            |                   |
| 4/30/2019 11:01:47 PM | MFA Backend |            | authenticationRequest complete           | 1092  | 0             | 20         | Text Message Sent |

### OATH Token Wrong Code

Currently we can't correlate the second request that provides the final result of the OATH Token attempt. An enhancement to ASC query will fix this and we'll update the example when this is working.

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 11:02:07 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 11:02:07 PM | MFA Backend | oathToken  | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 11:02:07 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 22         | OATH Code Pending |

### OATH Token No Code

MFA Backend is not called again after OATH code is pending since user never entered a code.

| DateTime              | Source      | AuthMethod | Message                        | LogId | Authenticated | ResultCode | ResultDescription |
| --------------------- | ----------- | ---------- | ------------------------------ | ----- | ------------- | ---------- | ----------------- |
| 4/30/2019 11:03:41 PM | MFA Backend |            | Received authRequest           | 1000  |               |            |                   |
| 4/30/2019 11:03:41 PM | MFA Backend | oathToken  | authenticationRequest info     | 1034  |               |            |                   |
| 4/30/2019 11:03:41 PM | MFA Backend |            | authenticationRequest complete | 1092  | 0             | 22         | OATH Code Pending |
