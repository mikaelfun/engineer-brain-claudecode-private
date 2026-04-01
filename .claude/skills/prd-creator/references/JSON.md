# Implementation Task Generation

Transform the completed PRD into simple, concise, actionable and verifiable implementation tasks in JSON format. This creates a comprehensive task list for developers (human or AI) to build and verify the product.

## When to Use

After completing PRD creation, ask the user:
"Your PRD is complete. Would you like me to generate implementation tasks? I'll create a comprehensive JSON task list that breaks down all features into verifiable development work."

Only proceed after user confirmation.

## Task Generation Workflow

Read the PRD markdown file. Each task in the PRD will have a unique ID, formatted as `TASK-${ID}`.

Copy and track progress:

```
Task Generation Progress:
- [ ] Analyze the complete PRD
- [ ] Generate task index (tasks.json)
- [ ] Generate detailed spec for each task
- [ ] Present complete task list to user for review
```

## Root task list format

Each task must follow this exact structure:

```json
{
  "id": "TASK-${ID}",
  "title": "Clear, concise title of the task",
  "category": "category-name",
  "specFilePath": "tasks/TASK-${ID}.json",
  "passes": false
}
```

**Field Requirements:**

- `id`: Unique identifier for the task, formatted as `TASK-${ID}`
- `title`: A title that gives a high level overview of the task
- `category`: Classification of task type (see categories below)
- `specFilePath`: Path to the individual task specification file
- `passes`: Always initialize to `false` - only developers update this after completion

## Individual JSON Task Format

Each task specification file provides comprehensive details for implementation.

```json
{
  "id": "TASK-${ID}",
  "title": "Clear, concise title of the task",
  "category": "category-name",
  "description": "In-depth specification including expected behavior, user flow, and output",
  "acceptanceCriteria": [
    "List of specific, verifiable conditions that must be true when task is complete"
  ],
  "steps": [
    {
      "step": 1,
      "description": "Short description of what to do",
      "details": "Detailed explanation of HOW to do it, including specific code, commands, or techniques",
      "pass": false
    }
  ],
  "dependencies": ["TASK-${ID1}", "TASK-${ID2}"],
  "estimatedComplexity": "medium",
  "technicalNotes": [
    "List of technical notes, implementation hints, or technical constraints"
  ]
}
```

### Required Fields

| Field                | Type                  | Description                                                                     |
| -------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `id`                 | string                | Unique identifier, formatted as `TASK-${ID}`                                    |
| `title`              | string                | High-level overview of the task                                                 |
| `category`           | string                | Classification of task type (see categories below)                              |
| `description`        | string                | In-depth specification including expected behavior, user flow, and output       |
| `acceptanceCriteria` | array of strings      | List of specific, verifiable conditions that must be true when task is complete |
| `steps`              | array of step objects | Sequential implementation steps                                                 |

### Optional Fields

| Field                 | Type             | Description                                                                      |
| --------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `dependencies`        | array of strings | Task IDs that must be completed before this task                                 |
| `estimatedComplexity` | string           | One of: `"low"`, `"medium"`, `"high"`, `"very high"`                             |
| `technicalNotes`      | array of strings | Implementation hints, gotchas, or technical constraints                           |

### Step Object Format

```json
{
  "step": 1,
  "description": "Short description of what to do",
  "details": "Detailed explanation of HOW to do it",
  "pass": false
}
```

### Writing Good Acceptance Criteria

Acceptance criteria define WHAT must be true when the task is done. They should be:

- **Specific**: "Button shows loading spinner while API call is in progress"
- **Verifiable**: Can be checked with a clear yes/no answer
- **Independent**: Each criterion stands alone
- **Complete**: Together they fully define "done"

**Good:**
```json
"acceptanceCriteria": [
  "Login form validates email format before submission",
  "Invalid email shows error message 'Please enter a valid email'",
  "Submit button is disabled while form is invalid",
  "Successful login redirects to /dashboard",
  "Failed login shows error message from API response"
]
```

**Bad:**
```json
"acceptanceCriteria": [
  "Login works correctly",
  "Form validation is good",
  "Handles errors properly"
]
```

### Writing Good Steps

Steps define HOW to implement the task:

- **Sequential**: Each step builds on the previous
- **Detailed**: Include specific code patterns, function names, file paths
- **Atomic**: Each step is a single, focused piece of work
- **Trackable**: The `pass` field lets developers mark progress

## Task Categories

| Category | Description |
|----------|-------------|
| `functional` | Core feature implementation and behavior |
| `ui-ux` | User interface and experience requirements |
| `data-model` | Database schema, data structures, relationships |
| `api-endpoint` | Backend API endpoints and responses |
| `integration` | Third-party service integrations |
| `security` | Security features, authentication, authorization |
| `documentation` | Technical documentation, API docs |

## Task Generation Guidelines

### Be Comprehensive

Generate tasks that cover the entire PRD. Break down every feature into small, manageable tasks.

### Make Steps Verifiable

Each step must be:
- **Specific**: "Verify email field has unique constraint" not "Check database"
- **Actionable**: Can be executed by a developer
- **Measurable**: Has clear pass/fail criteria
- **Sequential**: Steps build on each other

### Initialize All Tasks to `"passes": false`

**CRITICAL**: Never mark tasks as complete during generation. Only developers should update `passes: true` after verifying all steps are complete.

> It is unacceptable to remove or edit items in the task list because this could lead to missing or buggy functionality

## Output Format

Save the complete task list as `tasks.json` in user-specified location.

## After Generation

Present the tasks to the user:

"I've generated [NUMBER] implementation tasks based on your PRD, organized into [NUMBER] categories. These tasks provide a complete checklist for building and verifying every feature.

Would you like me to:
1. Adjust the task breakdown or add more detail
2. Create Conductor tracks from these tasks (`/conductor:new-track`)
3. Save and finalize"

## Attribution

Based on [PageAI-Pro/ralph-loop](https://github.com/PageAI-Pro/ralph-loop) prd-creator skill (MIT License).
