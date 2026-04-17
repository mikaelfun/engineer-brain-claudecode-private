# OData API 参考

> 本文件供脚本开发和调试时参考。Agent 在正常使用脚本时不需要阅读此文件。

## Base URL

```
https://onesupport.crm.dynamics.com/api/data/v9.0/
```

## 通用请求头

所有 API 调用通过 `Invoke-D365Api` 自动添加：
```
Accept: application/json
OData-MaxVersion: 4.0
OData-Version: 4.0
Prefer: odata.include-annotations="*"
```

`odata.include-annotations="*"` 会在响应中包含 `@OData.Community.Display.V1.FormattedValue` 后缀字段，提供人类可读值。

## 读操作端点

### Case 基本信息

按 ticketnumber 查询：
```xml
<fetch top="1">
  <entity name="incident">
    <filter>
      <condition attribute="ticketnumber" operator="eq" value="{TICKET_NUMBER}"/>
    </filter>
  </entity>
</fetch>
```

按 incidentid 直接查询：
```
GET /api/data/v9.0/incidents({incidentid})
```

### Customer Statement（Restricted Attributes）

> ⚠️ **已知坑**：`msdfm_caserestrictedattributes` 的 OData entity set 名称不规则，
> FetchXML 直接查会 404。**必须通过 incident 的 navigation property 访问。**

```
GET /api/data/v9.0/incidents({incidentid})/msdfm_CaseRestrictedAttributesId
    ?$select=msdfm_customerstatement,msdfm_symptom,msdfm_overview,
             msdfm_businessimpact,msdfm_issuecontext,msdfm_rootcausedescription,
             msdfm_solutiondescriptionmultiline,msdfm_resolution,
             msdfm_actionplancustomerviewable,msdfm_currentstatuscustomerviewable
```

### Notes (Annotations)

```xml
<fetch count="100">
  <entity name="annotation">
    <attribute name="annotationid"/><attribute name="subject"/><attribute name="notetext"/>
    <attribute name="createdby"/><attribute name="createdon"/><attribute name="modifiedon"/>
    <order attribute="createdon" descending="true"/>
    <link-entity name="systemuser" from="systemuserid" to="createdby" alias="creator" link-type="outer">
      <attribute name="fullname"/>
    </link-entity>
    <filter>
      <condition attribute="objectid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

### Emails

```xml
<fetch count="100">
  <entity name="email">
    <attribute name="subject"/><attribute name="to"/><attribute name="from"/>
    <attribute name="statuscode"/><attribute name="statecode"/>
    <attribute name="createdon"/><attribute name="senton"/>
    <attribute name="directioncode"/><attribute name="description"/>
    <order attribute="createdon" descending="true"/>
    <filter>
      <condition attribute="regardingobjectid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

Email statuscode: `1`=Draft, `2`=Completed, `3`=Pending Send, `4`=Sent, `6`=Canceled

### Phone Calls

```xml
<fetch count="50">
  <entity name="phonecall">
    <attribute name="subject"/><attribute name="phonenumber"/>
    <attribute name="directioncode"/><attribute name="createdon"/>
    <attribute name="description"/><attribute name="statuscode"/>
    <order attribute="createdon" descending="true"/>
    <filter>
      <condition attribute="regardingobjectid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

### Labor (msdfm_labors)

> ⚠️ 实体是 `msdfm_labors`，不是 `msdfm_efforts`！

```xml
<fetch count="50">
  <entity name="msdfm_labor">
    <attribute name="msdfm_laborid"/><attribute name="msdfm_classification"/>
    <attribute name="msdfm_date"/><attribute name="msdfm_duration"/>
    <attribute name="msdfm_description"/><attribute name="createdon"/>
    <order attribute="createdon" descending="true"/>
    <filter>
      <condition attribute="msdfm_caseid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

### Attachments 计数 (DTM)

```xml
<fetch aggregate="true">
  <entity name="msdfm_dtmattachmentmetadata">
    <attribute name="msdfm_dtmattachmentmetadataid" aggregate="count" alias="count"/>
    <filter>
      <condition attribute="msdfm_caseid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

### ICM Details

```xml
<fetch count="50">
  <entity name="msdfm_icmdetail">
    <attribute name="msdfm_status"/><attribute name="msdfm_severity"/>
    <attribute name="msdfm_owningteamid"/><attribute name="msdfm_name"/>
    <attribute name="msdfm_title"/><attribute name="msdfm_icmid"/>
    <attribute name="msdfm_url"/><attribute name="msdfm_createdate"/>
    <link-entity name="incident" from="incidentid" to="msdfm_caseid" alias="case">
      <filter>
        <condition attribute="incidentid" operator="eq" value="{incidentid}"/>
      </filter>
    </link-entity>
  </entity>
</fetch>
```

### Connections（联系人关系）

```xml
<fetch count="50">
  <entity name="connection">
    <filter>
      <condition attribute="record1id" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

### Contact Email

```
GET /api/data/v9.0/contacts({contactid})?$select=emailaddress1,fullname,telephone1
```

### SLA 策略

```
POST /api/data/v9.0/incidents({incidentid})/Microsoft.Dynamics.CRM.msdfm_GetSLAPolicies
```

### My Open Cases（当前用户的 Active Cases）

```xml
<fetch count="100">
  <entity name="incident">
    <attribute name="incidentid"/><attribute name="ticketnumber"/><attribute name="title"/>
    <attribute name="severitycode"/><attribute name="statuscode"/><attribute name="modifiedon"/>
    <filter>
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="msdfm_assignedtoid" operator="eq-userid"/>
    </filter>
    <order attribute="modifiedon" descending="true"/>
  </entity>
</fetch>
```

### 用户权限检查

```
GET /api/data/v9.0/systemusers({userid})/Microsoft.Dynamics.CRM.RetrievePrincipalAccess(Target=@Target)
    ?@Target={"@odata.id":"incidents({incidentid})"}
```

### CSAT Risk Predictions

```xml
<fetch>
  <entity name="msdyn_caseaiprediction">
    <filter>
      <condition attribute="msdyn_caseid" operator="eq" value="{incidentid}"/>
    </filter>
  </entity>
</fetch>
```

## 写操作端点

### Add Note (POST /annotations)

```json
{
  "subject": "Note Subject",
  "notetext": "备注内容",
  "objectid_incident@odata.bind": "/incidents({incidentid})"
}
```

### Record Labor (POST /msdfm_labors)

> ⚠️ `msdfm_CaseId@odata.bind` 大小写敏感，必须 PascalCase

```json
{
  "msdfm_classification": 337818,
  "msdfm_date": "2026-03-05T00:00:00.000Z",
  "msdfm_description": "See case notes",
  "msdfm_duration": 30,
  "msdfm_durationpicker": 30,
  "statuscode": 1,
  "statecode": 0,
  "msdfm_CaseId@odata.bind": "/incidents({incidentid})"
}
```

Classification 选项值：`337818` = Troubleshooting

### Add Phone Call (POST /phonecalls)

```json
{
  "subject": "Phone Call Subject",
  "directioncode": true,
  "statuscode": 1,
  "statecode": 0,
  "phonecall_activity_parties": [
    {
      "partyid_contact@odata.bind": "/contacts({contactid})",
      "participationtypemask": 2
    },
    {
      "partyid_systemuser@odata.bind": "/systemusers({userid})",
      "participationtypemask": 1
    }
  ],
  "regardingobjectid_incident_phonecall@odata.bind": "/incidents({incidentid})"
}
```

> ⚠️ Phone Call 的 regarding binding 使用 `_phonecall` 后缀：`regardingobjectid_incident_phonecall@odata.bind`

### Update Case Status (PATCH)

> ⚠️ 写操作：必须经用户确认后执行。

```
PATCH /api/data/v9.0/incidents({incidentid})
{ "statuscode": {value} }
```

statuscode 值参考 [entity-model.md](entity-model.md) 的 Case Status 完整列表。

### Resolve Case (POST /CloseIncident)

> ⚠️ 写操作：必须先关闭所有 Open 状态的活动（Email、Phone Call 等），否则 API 会报错。

```json
POST /api/data/v9.0/CloseIncident

{
  "IncidentResolution": {
    "subject": "Case Resolved",
    "incidentid@odata.bind": "/incidents({incidentid})"
  },
  "Status": -1
}
```

### Close Phone Call Activity

```
POST /api/data/v9.0/phonecalls({phonecallid})/Microsoft.Dynamics.CRM.CloseActivity
{ "Status": 2 }
```

## 已知坑汇总

| 坑 | 说明 |
|----|------|
| `msdfm_caserestrictedattributes` 404 | 必须通过 incident navigation property 访问 |
| `msdfm_CaseId@odata.bind` 大小写 | 必须 PascalCase，小写返回 400 |
| `msdfm_labors` vs `msdfm_efforts` | Labor 实体是 `msdfm_labors`，`msdfm_efforts` 是另一个无关实体 |
| Phone Call regarding binding | 需要 `_phonecall` 后缀 |
| `msdfm_classification` 是 Picklist | 必须传 Int32（如 337818），不能传字符串 |
| `msdfm_durationpicker` | 必须与 `msdfm_duration` 设置相同的值 |
