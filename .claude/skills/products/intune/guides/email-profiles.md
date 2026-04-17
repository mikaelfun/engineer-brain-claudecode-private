# Intune 邮件配置与 Exchange — 排查速查

**来源数**: 2 | **21V**: 部分适用
**条目数**: 13 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Users cannot send images from auto-configured email accounts. | Allow e-mail from third-party applications not enabled. | Enable the setting in email profile Properties > Settings. | 🔵 7.5 | MS Learn |
| 2 | iOS email profile: no password prompt after password change. No email sent/received. | EAS basic authentication limitation does not trigger re-auth prompt. | Enable OAuth in email profile. Ensure email service supports OAuth first. | 🔵 7.5 | MS Learn |
| 3 | When trying to configure the Microsoft Intune On-Premise Exchange connector, error: 'Configuratio... | This issue can be caused by having an older version of the Intune on-premise ... | Download and install the latest version of the Intune on-premise Exchange connector from the Exch... | 🔵 7.0 | ContentIdea KB |
| 4 | When trying to configure the Microsoft Intune Exchange Connector you receive the following error ... | This error can be caused by two things :Customer has configured Intune Exchan... | To resolve the issue you can do the following In Intune there can only be one Exchange connector.... | 🔵 7.0 | ContentIdea KB |
| 5 | The Microsoft Intune Exchange Connector service is not able to start. When checking the system lo... | This can be caused by the WIEC_User account does not have Log on as service p... | Assign &quot;Log on as a service&quot; to the service account WIEC_User on this computer. You can... | 🔵 7.0 | ContentIdea KB |
| 6 | When setting up the Intune on-premise Exchange connector, error: The remote server returned an er... | Three possible causes: 1) Account used to setup connector is missing Intune l... | 1) Ensure account is global administrator and has Intune license. 2) Verify connectivity to all I... | 🔵 7.0 | ContentIdea KB |
| 7 | Previously customers could not remove email profiles if there was not another deployment to repla... | This is currently by-design. | Currently, the Engineering team has suspended removal of email profiles due to some issues that w... | 🔵 7.0 | ContentIdea KB |
| 8 | Moving Intune Exchange connector to new Exchange server fails with error: The Microsoft Intune Ex... | Existing Exchange connector is still installed. | Remove the old connector first and then install the new connector. | 🔵 7.0 | ContentIdea KB |
| 9 | Configuring Intune On-Premise Exchange Connector fails with error: The Microsoft Intune Exchange ... | Caused by different/mismatched version of the Intune On-premise Exchange conn... | Delete the existing connector from Intune Portal: Azure Portal > Intune > On-premises access > Ex... | 🔵 7.0 | ContentIdea KB |
| 10 | Exchange Connector configuration fails with error 0x0000001: The Microsoft Intune Exchange Connec... | Internet proxy settings are misconfigured, preventing the Exchange Connector ... | Configure proxy using Netsh winhttp set proxy with correct proxy server and bypass list for inter... | 🔵 6.5 | MS Learn |
| 11 | Exchange Connector configuration fails with error 0x000000b: CertEnroll::CX509PrivateKey::Create:... | The account used to sign in to Intune is not a Global Administrator account | Sign in to Intune with a Global Administrator account, or add the current account to the Global A... | 🔵 6.5 | MS Learn |
| 12 | Exchange Connector configuration fails with error 0x0000006: The Microsoft Intune Exchange Connec... | A proxy server is blocking traffic to the Intune service | Either remove proxy settings or configure the proxy to allow communication to the Intune service ... | 🔵 6.5 | MS Learn |
| 13 | Exchange Connector service fails to start with Event 7000 or 7041: The service did not start beca... | The WIEC_USER service account does not have the Log on as a service user righ... | Assign Log on as a service right to WIEC_USER via Local Security Policy (secpol.msc > User Rights... | 🔵 6.5 | MS Learn |

## 快速排查路径
1. Enable the setting in email profile Properties > Settings. `[来源: MS Learn]`
2. Enable OAuth in email profile. Ensure email service supports OAuth first. `[来源: MS Learn]`
3. Download and install the latest version of the Intune on-premise Exchange connector from the Exchange Access blade. `[来源: ContentIdea KB]`
4. To resolve the issue you can do the following In Intune there can only be one Exchange connector. You can run either the Intune on premise Exchange co `[来源: ContentIdea KB]`
5. Assign &quot;Log on as a service&quot; to the service account WIEC_User on this computer. You can use Local Security Settings (Secpol.msc) to do this. `[来源: ContentIdea KB]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/email-profiles.md#排查流程)
