# Session Handoff & Dual-PC Git Synchronization Protocol

> **Document Status**: Mandatory Workflow Standard  
> **Environments**: Home PC (Primary) <-> School PC (Secondary)  
> **Sync Mechanism**: Git / GitHub

---

## 1. The Challenge: Seamless Synchronization Across 2 PCs

Development alternates between two physical machines:
- **Home PC**: `C:\Christos\Antigravity\...`
- **School PC**: Secondary environment working on the same repositories.

To prevent knowledge drift, out-of-sync states, or lost context, every project tracks its session state directly in the Git repository via a standardized handoff log.

---

## 2. The `HANDOFF.md` Specification

Every project repository MUST maintain a `HANDOFF.md` file in its root directory.

### Structure:
```markdown
# Session Handoff Log

## Current Status: [READY / IN_PROGRESS / PAUSED]
- **Last Updated**: YYYY-MM-DD HH:mm:ss (Local Time)
- **Workstation**: [Home PC | School PC]
- **Active Branch**: main

## What Was Completed in This Session
- [Bullet points of exact modifications made]

## Key Architectural Decisions Made
- [Technical standards adopted, algorithms chosen, or schema changes]

## Next Immediate Steps
1. [Exact step 1 for the next session]
2. [Exact step 2 for the next session]

## Known Issues / Blockers
- [None, or description of any temporary workaround]
```

---

## 3. Session End Workflow (Agent Responsibility)

Before the user ends work or closes Antigravity on EITHER computer:
1. **Update `HANDOFF.md`**: Write current status, changes, decisions, and immediate next steps.
2. **Trigger Git Update Question**:
   Per global rule, the agent asks:
   > **'Ενημέρωση Git;'**
3. Upon user confirmation:
   - Stage all changes: `git add .`
   - Commit with concise caveman message: `git commit -m "feat/fix: [summary]"`
   - Push to remote: `git push`

---

## 4. Session Start Workflow (Agent Responsibility)

When the user opens a project on EITHER computer:
1. Check if Git is up to date (`git status`, `git pull`).
2. Read `HANDOFF.md` to immediately recall:
   - Where the previous session left off.
   - Which PC performed the last update.
   - What the next immediate action item is.
3. Present a brief, 2-line summary to the user:
   > *"Φορτώθηκε η κατάσταση από [Workstation]. Τελευταία εργασία: [Summary]. Επόμενο βήμα: [Next Step]. Συνεχίζουμε;"*

---

## 5. New Project Discovery Workflow

When Antigravity opens or creates a project directory that DOES NOT contain a `.agents/` folder:
1. Immediately prompt the user:
   > *"Το project δεν διαθέτει φάκελο `.agents/`. Να εγκαταστήσω τα πρότυπα Kidmedia; Επιλογή προφίλ: (1) Erasmus+ ή (2) Kidmedia.eu;"*
2. Scaffold the appropriate `.agents/` configuration, rules, and `HANDOFF.md`.
