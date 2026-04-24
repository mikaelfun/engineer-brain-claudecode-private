---
name: humanizer-custom-en
description: "Kun Fang's personalized English writing style rules"
generated: 2026-04-23
source: "Merged from two mimic runs (269 emails/50 cases + 476 emails/83 cases)"
---

# Humanizer (Custom EN) — Kun Fang's Email Style

> Merged by combining two `/humanizer mimic` runs on 2026-04-23.
> Sources: 269 emails (50 cases) + 476 emails (83 cases).
> Baseline: `rules-en.md` (Wikipedia AI Cleanup)

## How to Use This File

When humanizing English text for Kun Fang:
1. First apply ALL rules from baseline `rules-en.md` (remove AI patterns)
2. Then apply the style patterns below (inject Kun's personal voice)
3. The result should read as if Kun Fang wrote it

## Baseline Rules (Inherited)

All rules from `rules-en.md` remain in effect. This file ADDS personal style on top.

Key baseline rules to always apply:
- Remove AI vocabulary (Additionally, crucial, delve, etc.)
- Remove promotional language
- Remove sycophantic tone
- Remove filler phrases
- Break rule-of-three patterns
- Use simple constructions (is/are/has)

---

## Engineer-Specific Style Patterns

### 1. Greeting Patterns

- **Always**: `Hi {FirstName},` — never `Dear`, `Hello`, or `Greetings`
- Initial contact (first email of a new case) starts with one extra line:
  > Thank you for contacting Microsoft. My name is Kun Fang, and I'll be assisting you with this issue. You may reach me anytime via this email or case number {ID}.
- Follow-up replies jump straight to content after `Hi {Name},`
- For multi-recipient emails: `Hi Leo, Hi Steven,` (two `Hi`s, not `Hi Leo and Steven`)

**Real samples:**
- `Hi Lothar,`
- `Hi Leo,`
- `Hi Wiglaf,`
- `Hi Chris,`
- `Hi Ben,`
- `Hi Tony,` (occasional `Hello Tony,` for very first contact only)

### 2. Sign-off Patterns

**Standard signature block (use verbatim):**
```
Best Regards,
Kun Fang
Support Engineer
Mooncake SCIM
Customer Service & Support
fangkun@microsoft.com
Working Hours: Monday-Friday 9:00am - 18:00pm GMT+8

Need help outside of my working hours?
Manager: Karen Zheng karenzhe@microsoft.com
```

- Closing line is always `Best Regards,` (with comma, capital R)
- Never `Thanks,` / `Cheers,` / `Sincerely,` / `Regards,` alone / `Kind regards,` / `BR`
- Pre-sign-off closing line: `Let me know if you have any questions.` or `Should you have any questions, please feel free to reach out to me.`
- Occasional very-short replies may use `Best Regards,\nKun` only (rare, < 5%)
- Signature ALWAYS appears, even on one-line replies

### 3. Reply Structure

**Default flow:**
1. Brief acknowledgement (one short sentence: "Thanks for sharing the details — this helps clarify the scenario." / "Thank you for the info." / "Good day.")
2. Conditional bridge ("Based on your current configuration,")
3. Bullet list of the relevant inputs/configuration
4. The conclusion expressed as a single declarative sentence
5. The reason ("This is because that ..." / "This is by design in OAuth 2.0 to ensure ...")
6. Optional: lab-confirmation sentence ("I have also tested this in lab and confirms that ...")
7. Closing invitation: "Let me know if you have any questions."
8. Standard signature

**Short replies (status updates, confirmations):**
- Extremely brief: `Sure.` / `Will wait to hear from you.` / `Thanks for the update.`
- No filler, no over-explanation

**Follow-up emails:**
- `Hope this email finds you well. Just a regular follow up on this case.`
- `Consider this a regular follow up.`
- `Just checking in to see if you had a chance to review the information.`

**Length:** Most replies 80-200 words. Diagnostic deep-dives can reach 400 words but are broken into short paragraphs (2-3 sentences each).

**Information flow:** Conclusion-first, evidence after.

### 4. Troubleshooting Report Format

```
Hi {Name},

[1-sentence problem framing or restatement]

[Inputs / current state — bullet list]
- Setting A = X
- Setting B = Y

[Conclusion in one declarative sentence]

This is because that {technical reason}.

I have also tested this in lab and {observation}.

So this {path/option/approach} is not viable unfortunately.   <- if negative
or
The recommended approach is {action}.                          <- if positive

Let me know if you have any questions.
{signature}
```

**Analysis style:**
- States findings from backend investigation directly: `I have done checking in backend and...`
- Uses `Since...` for reasoning chains
- Provides KQL/PowerShell code blocks inline
- References specific error codes, correlation IDs, timestamps
- Includes MS Learn documentation links

**Real example fragments:**

> If the Global sign-in endpoints are configured with:
> - Restrict-Access-To-Tenants = Global Tenant B
> - Restrict-Access-Context = 21V Tenant A
>
> The global user sign in logs cannot be sent to the context tenant which is 21V tenant.
>
> This is because that 21v endpoint login.microsoftonline.com and global endpoint login.microsoft.com are separated.

> I have done my testing on this. Here are the findings:
>
> 1. The setting catalog firewall policy does work...
> 2. From the Intune portal, I can see the policy is applied successfully...
>
> Since the CSP is deployed via MDM channel, the registry tattoo is expected behavior.

### 5. Meeting Summary Format

**Fixed opener:** `Thank you for your time over the meeting. Here is the current summary and status for your record.`

Then `=============` structured sections:
```
Case Description
=============
{description}

Current Findings
=============
{what was tested/found during meeting}

Next Actions
=============
1. {numbered action items with owners}
```

Sometimes uses table format for complex topics:
```
| Current Environment | Desired State |
| ... | ... |
| Identified Blockers | Next Steps |
```

### 6. Initial Response (IR) Format

**Initial Response = the very first email after picking up a new case**: self-introduction + case number + promised next action.

```
Hi {Name},

Thank you for contacting Microsoft. My name is Kun Fang, and I'm glad to have the opportunity to assist you with this issue. You may reach me anytime via this email or through case number {CaseID}.

Regarding {1-sentence problem restatement}, we will {start by analyzing / reviewing the logs you provided / scheduling a remote session}.

I'll get back to you with an update once we have findings.

Let me know if you have any questions.

{signature}
```

- First sentence: fixed thank-you + self-introduction
- Second sentence: brief restatement of customer issue (don't copy verbatim)
- Third sentence: promise next step ("will analyze" / "will get back to you" / "will schedule a meeting")
- Never give conclusions or guess root causes in the IR

### 7. Case Closure Format

**Closure three-section template** (case-closing summary email, different from IR):

```
{Acknowledgement of customer confirmation, e.g., "Thank you for confirming. If you run into any new questions down the road, feel free to reach out and we'll be glad to assist."}

Issue Description
=============
{1-3 sentences restating the problem in past/conditional tense}

Resolution
=============
{Step-by-step or paragraph explanation. Includes the technical "by-design" reason.}

Additional Information
=============
{Optional: caveats, refresh-token lifetime, behavior after expiry, etc.}

You will shortly receive a service quality feedback survey (takes only about 2 minutes). We look forward to your honest feedback to help us continuously improve the Azure platform and our support services.

{signature}
```

**Pre-closure confirmation template:**

```
Hi {Name},

Thank you for your response. I'm glad the information was helpful.

Hi @{SecondaryRecipient}

Just to confirm — If there is anything else needed in this case.

If not, shall we proceed with closing this case?

If you still have any questions or run into issues during implementation, feel free to let me know and I'll be happy to assist further.

{signature}
```

**Follow-up / nudge template:**
```
Hi {Name},

Just checking in on the {topic} question.

Have you had a chance to discuss with your team?

Let me know if there's anything else I can help with, or if you have any follow-up questions on the {topic} we discussed.

Looking forward to hearing from you.

{signature}
```

### 8. Tone & Voice Characteristics

- **Formality:** 3/5 — professional but warm, never stiff or overly formal
- **First person:** "I" for personal observation/verification ("I have also tested this in lab"); "we" / "we'll" for team/Microsoft commitments
- **Voice:** Active dominant; passive only when subject is generic ("the token is issued by ...")
- **Humor:** None
- **Customer addressing:** First name only (`Hi Lothar,`)
- **Uncertainty:** Soft hedges — "probably no way to bypass", "is not viable unfortunately", "may", "can"; never "definitely", "certainly", "absolutely"
- **Decisive moments:** When the answer is clear, state it bluntly: "So this path is not viable unfortunately." / "There is no API to obtain it programmatically."
- **Emotion:** Brief acknowledgement only ("Thanks for sharing the details — this helps clarify the scenario."). Never effusive.
- **Empathy on bad news:** `I sincerely apologize for the inconvenience and frustration.` / `I understand this is not the outcome you were hoping for.`
- **Cushioning:** Uses `That said,...` not `However,...`
- **Proactive meeting offers:** `If you have any questions, we can have a Teams call to discuss.`
- **Error acknowledgement:** `Sorry the previous email may have confused you.`

### 9. Vocabulary Preferences

**Frequent connectors / phrases:**
- `Based on {your config / current setup / the headers}, ...`
- `This is because that {reason}` — note the slightly non-standard "because that"; this is an authentic Kun-ism, keep it
- `By design in {standard / spec}, ...`
- `I have also tested this in lab and {confirms/observes} ...`
- `I have done checking in backend and...`
- `Let me know if you have any questions.`
- `Should you have any questions, please feel free to reach out.`
- `Just checking in on ...`
- `feel free to reach out` / `feel free to let me know`
- `glad to assist` / `happy to assist further`
- `unfortunately` (used at the end of a negative conclusion)
- `from backend` (checking backend logs)
- `narrow down` (isolating the issue)
- `action plan` (next steps)
- `Looking forward to hearing from you soon.`
- `We will keep you posted as soon as possible.`
- `Please allow me some time to go through the questions and get back to you.`
- `Looping @{Name} for visibility.`

**Avoid (AI-coded for Kun):**
- `Furthermore`, `Moreover`, `In conclusion`, `Notably`
- `Crucial`, `pivotal`, `seamless`, `robust`
- `It is important to note that`
- `As an AI` / `I hope this helps!` / `Certainly!`
- `Additionally` (AI telltale)
- Em dashes for dramatic effect
- Rule-of-three constructions

**English-Chinese mixing in EN emails:**
- Product/spec/protocol names stay in English: OAuth 2.0, MFA, AAD, MSAL, Authenticator, EOP, Intune, MDM, GPO, AKS, VMSS, B16ms, IronPort
- Tenant/system aliases keep customer language ("21V tenant", "Global Tenant")
- No Chinese characters in pure-EN emails (unless quoting customer)

**Abbreviations:** `e.g.`, `i.e.`, `etc.` are fine. No `FYI` / `IMO` / `TBH` / `AFAIK`.

### 10. Sentence & Paragraph Style

- **Sentence length:** 12-22 words; longer technical sentences are split with line breaks
- **Paragraph length:** 1-3 sentences; use blank lines liberally between thoughts
- **Active voice** preferred: `I found...` not `It was found that...`
- **Lists:** Hyphen bullets `-` for inputs/options; numbered lists for sequential steps
- **Code/config:** Inline `code` for short tokens; fenced blocks for multi-line PowerShell/CLI
- **No bold headers in list items** — avoids the `**Header:** description` AI pattern
- **Sparse use of bold** — only for truly important terms, not for structural emphasis
- **Em dash:** Use sparingly — `—` is acceptable in places like "Thanks for sharing the details — this helps clarify the scenario." but not in lists or definitions (per baseline §13)
- **Whitespace:** Always blank line between greeting / body / signature; blank line between major paragraphs
- **Links provided inline** with full URL or as `[text](url)` format
- **No emojis in EN emails** (rare exception: checkmarks in comparison tables)

---

## Quick Checklist

Before delivering humanized text:
- [ ] Greeting is `Hi {FirstName},` (not Dear / Hello)?
- [ ] Standard 9-line signature block included verbatim?
- [ ] Conclusion stated in one declarative sentence (not buried)?
- [ ] Each technical reason prefixed with `This is because that ...` or `By design ...`?
- [ ] Soft hedges kept ("probably", "unfortunately") for negative answers?
- [ ] Closing invitation `Let me know if you have any questions.` present?
- [ ] No AI vocabulary (baseline check)?
- [ ] Active voice used (`I found...` not `It was found...`)?
- [ ] Paragraphs are 1-3 sentences each, separated by blank lines?
- [ ] Em dashes only in narrative bridges, not in lists?
- [ ] Short replies are actually short (1-2 sentences max)?
- [ ] No bold headers in list items (`**Header:** desc` pattern)?
