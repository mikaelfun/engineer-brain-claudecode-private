/**
 * tool-registry.ts — 将 PowerShell 脚本注册为 OpenAI function-calling 格式的 tool 定义
 */

export type ToolSafety = 'read' | 'read-browser' | 'write' | 'navigation'

export interface ToolDefinition {
  spec: {
    type: 'function'
    function: {
      name: string
      description: string
      parameters: {
        type: 'object'
        properties: Record<string, { type: string; description: string; enum?: string[] }>
        required?: string[]
      }
    }
  }
  script: string
  paramMap: Record<string, string>  // tool param name → PowerShell param name
  safety: ToolSafety
  timeoutMs: number
  outputDirAuto?: boolean  // auto-set -OutputDir to workspace/cases/active/
}

const tools: ToolDefinition[] = [
  // ============ Read (API) ============
  {
    spec: {
      type: 'function',
      function: {
        name: 'list_active_cases',
        description: 'List all active cases assigned to the current engineer via D365 OData API. Returns case numbers, titles, severity, status, customer info.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    script: 'list-active-cases.ps1',
    paramMap: {},
    safety: 'read',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'fetch_case_snapshot',
        description: 'Fetch a full case snapshot (case info, contact, entitlement, timeline counts) and save as Markdown. Uses incremental refresh if cached.',
        parameters: {
          type: 'object',
          properties: {
            ticketNumber: { type: 'string', description: '16-digit case number' },
          },
          required: ['ticketNumber'],
        },
      },
    },
    script: 'fetch-case-snapshot.ps1',
    paramMap: { ticketNumber: 'TicketNumber' },
    safety: 'read',
    timeoutMs: 90000,
    outputDirAuto: true,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'fetch_emails',
        description: 'Fetch all emails for a case and save as emails.md. Supports incremental updates.',
        parameters: {
          type: 'object',
          properties: {
            ticketNumber: { type: 'string', description: '16-digit case number' },
            force: { type: 'string', description: 'Set to "true" to force full refetch ignoring cache' },
          },
          required: ['ticketNumber'],
        },
      },
    },
    script: 'fetch-emails.ps1',
    paramMap: { ticketNumber: 'TicketNumber', force: 'Force' },
    safety: 'read',
    timeoutMs: 120000,
    outputDirAuto: true,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'fetch_notes',
        description: 'Fetch all notes for a case and save as notes.md. Supports incremental updates.',
        parameters: {
          type: 'object',
          properties: {
            ticketNumber: { type: 'string', description: '16-digit case number' },
            force: { type: 'string', description: 'Set to "true" to force full refetch ignoring cache' },
          },
          required: ['ticketNumber'],
        },
      },
    },
    script: 'fetch-notes.ps1',
    paramMap: { ticketNumber: 'TicketNumber', force: 'Force' },
    safety: 'read',
    timeoutMs: 120000,
    outputDirAuto: true,
  },

  // ============ Read (Browser) ============
  {
    spec: {
      type: 'function',
      function: {
        name: 'check_ir_status',
        description: 'Check case Performance Indicators: IR SLA / FDR / FWR status. Requires browser on case form.',
        parameters: {
          type: 'object',
          properties: {
            ticketNumber: { type: 'string', description: 'Case number. If provided, navigates to the case first.' },
          },
        },
      },
    },
    script: 'check-ir-status.ps1',
    paramMap: { ticketNumber: 'TicketNumber' },
    safety: 'read-browser',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'view_details',
        description: 'Read detail fields of the currently open case via OData API with UI fallback.',
        parameters: { type: 'object', properties: {} },
      },
    },
    script: 'view-details.ps1',
    paramMap: {},
    safety: 'read-browser',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'view_timeline',
        description: 'View Timeline history entries of the currently open case.',
        parameters: {
          type: 'object',
          properties: {
            count: { type: 'string', description: 'Max entries to return (default 10)' },
          },
        },
      },
    },
    script: 'view-timeline.ps1',
    paramMap: { count: 'Count' },
    safety: 'read-browser',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'view_labor',
        description: 'View labor records of the currently open case.',
        parameters: {
          type: 'object',
          properties: {
            count: { type: 'string', description: 'Max entries to return (default 10)' },
          },
        },
      },
    },
    script: 'view-labor.ps1',
    paramMap: { count: 'Count' },
    safety: 'read-browser',
    timeoutMs: 60000,
  },

  // ============ Write ============
  {
    spec: {
      type: 'function',
      function: {
        name: 'add_note',
        description: 'Add a Note to the Timeline of the currently open case.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Note title' },
            body: { type: 'string', description: 'Note body content' },
            ticketNumber: { type: 'string', description: 'Optional case number to navigate to first' },
          },
          required: ['title', 'body'],
        },
      },
    },
    script: 'add-note.ps1',
    paramMap: { title: 'Title', body: 'Body', ticketNumber: 'TicketNumber' },
    safety: 'write',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'record_labor',
        description: 'Record labor time on the currently open case.',
        parameters: {
          type: 'object',
          properties: {
            minutes: { type: 'string', description: 'Labor duration in minutes' },
            classification: { type: 'string', description: 'Classification (default: Troubleshooting)' },
            description: { type: 'string', description: 'Description (default: See case notes)' },
          },
          required: ['minutes'],
        },
      },
    },
    script: 'record-labor.ps1',
    paramMap: { minutes: 'Minutes', classification: 'Classification', description: 'Description' },
    safety: 'write',
    timeoutMs: 90000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'new_email',
        description: 'Create an email draft on the current case. Does not send immediately.',
        parameters: {
          type: 'object',
          properties: {
            body: { type: 'string', description: 'Email body content' },
            subject: { type: 'string', description: 'Optional subject override' },
          },
          required: ['body'],
        },
      },
    },
    script: 'new-email.ps1',
    paramMap: { body: 'Body', subject: 'Subject' },
    safety: 'write',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'reply_email',
        description: 'Reply to an email from the Timeline and save as draft.',
        parameters: {
          type: 'object',
          properties: {
            body: { type: 'string', description: 'Reply body content' },
            index: { type: 'string', description: 'Which email to reply to (1-based, reverse chronological, default 1)' },
          },
          required: ['body'],
        },
      },
    },
    script: 'reply-email.ps1',
    paramMap: { body: 'Body', index: 'Index' },
    safety: 'write',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'edit_draft',
        description: 'Edit body of the currently open email draft.',
        parameters: {
          type: 'object',
          properties: {
            body: { type: 'string', description: 'Text to append or replace' },
            replace: { type: 'string', description: 'Set to "true" to replace entire body; otherwise appends' },
          },
          required: ['body'],
        },
      },
    },
    script: 'edit-draft.ps1',
    paramMap: { body: 'Body', replace: 'Replace' },
    safety: 'write',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'delete_draft',
        description: 'Delete the currently open email draft.',
        parameters: { type: 'object', properties: {} },
      },
    },
    script: 'delete-draft.ps1',
    paramMap: {},
    safety: 'write',
    timeoutMs: 30000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'edit_sap',
        description: 'Modify the current case Support Area Path (SAP).',
        parameters: {
          type: 'object',
          properties: {
            family: { type: 'string', description: 'Product family (e.g., Azure, Windows, Dynamics)' },
            name: { type: 'string', description: 'Product name' },
            version: { type: 'string', description: 'Optional product version' },
          },
          required: ['family', 'name'],
        },
      },
    },
    script: 'edit-sap.ps1',
    paramMap: { family: 'Family', name: 'Name', version: 'Version' },
    safety: 'write',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'request_access',
        description: 'Request case support data access.',
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description: 'Access reason',
              enum: ['Swarming', 'Backup', 'TechRouter', 'Escalation', 'CaseReview', 'RootCause', 'IcM', 'Other'],
            },
          },
        },
      },
    },
    script: 'request-access.ps1',
    paramMap: { reason: 'Reason' },
    safety: 'write',
    timeoutMs: 30000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'add_phone_call',
        description: 'Add a Phone Call record in the current case Timeline.',
        parameters: {
          type: 'object',
          properties: {
            subject: { type: 'string', description: 'Call subject' },
            phoneNumber: { type: 'string', description: 'Phone number' },
            minutes: { type: 'string', description: 'Call duration in minutes' },
          },
          required: ['subject'],
        },
      },
    },
    script: 'add-phone-call.ps1',
    paramMap: { subject: 'Subject', phoneNumber: 'PhoneNumber', minutes: 'Minutes' },
    safety: 'write',
    timeoutMs: 60000,
  },

  // ============ Navigation ============
  {
    spec: {
      type: 'function',
      function: {
        name: 'open_app',
        description: 'Launch browser and open D365 Copilot Service workspace.',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Optional D365 URL override' },
          },
        },
      },
    },
    script: 'open-app.ps1',
    paramMap: { url: 'Url' },
    safety: 'navigation',
    timeoutMs: 120000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'search_case',
        description: 'Search for a case in D365 by keyword. Returns matching results.',
        parameters: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Search keyword (case number, customer name, title)' },
          },
          required: ['keyword'],
        },
      },
    },
    script: 'search-case.ps1',
    paramMap: { keyword: 'Keyword' },
    safety: 'navigation',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'open_case',
        description: 'Open a case from the Dashboard by keyword match.',
        parameters: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Case number or title keyword' },
          },
          required: ['keyword'],
        },
      },
    },
    script: 'open-case.ps1',
    paramMap: { keyword: 'Keyword' },
    safety: 'navigation',
    timeoutMs: 60000,
  },
  {
    spec: {
      type: 'function',
      function: {
        name: 'switch_case',
        description: 'Switch between already opened case tabs, or list all open tabs.',
        parameters: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Case number or title keyword. Omit to list all open tabs.' },
          },
        },
      },
    },
    script: 'switch-case.ps1',
    paramMap: { keyword: 'Keyword' },
    safety: 'navigation',
    timeoutMs: 30000,
  },
]

// ============ Registry API ============

const toolMap = new Map<string, ToolDefinition>()
for (const tool of tools) {
  toolMap.set(tool.spec.function.name, tool)
}

/** Get all registered tools */
export function getAllTools(): ToolDefinition[] {
  return tools
}

/** Get a tool by name */
export function getToolByName(name: string): ToolDefinition | undefined {
  return toolMap.get(name)
}

/** Get tools filtered by safety levels */
export function getToolsBySafety(levels: ToolSafety[]): ToolDefinition[] {
  return tools.filter(t => levels.includes(t.safety))
}

/** Get OpenAI function-calling specs for a set of tools */
export function getToolSpecs(toolDefs: ToolDefinition[]): Array<{ type: 'function'; function: { name: string; description: string; parameters: any } }> {
  return toolDefs.map(t => t.spec)
}
