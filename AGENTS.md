# Claude & Codex Collaborative Workflow

## Overview
This document describes the shared workflow for Claude and Codex AI agents working together on the PE Ultimate project. Each agent operates on its own branch and coordinates with the other to avoid conflicts and ensure code quality.

## Branching Strategy

Each agent works on a dedicated feature branch named according to its role:
- **Claude**: `ccr-ca8545f1-o0wys8` (development/feature branch)
- **Codex**: Will use separate feature branches for its tasks

### Branch Naming Convention
- Feature branches: `feature/<feature-name>`
- Bug fixes: `fix/<bug-name>`
- Review branches: `review/<pr-number>`

## Workflow Process

### 1. Task Assignment
- Tasks are created as GitHub Issues with:
  - **Assignee**: Which agent (Claude or Codex)
  - **Priority**: High/Medium/Low
  - **Status**: Backlog → In Progress → Review → Done
  - **Dependencies**: Links to blocking issues
  - **Completion Criteria**: Clear definition of done

### 2. Before Starting Work
Agent must:
1. Check GitHub Issues for current tasks
2. Comment on the issue indicating files they'll work on
3. Search for file overlaps with other in-progress work
4. Coordinate if overlap exists
5. Create or switch to assigned feature branch

### 3. During Development
- Make focused, atomic commits with clear messages
- Each commit references the GitHub Issue: `fixes #123` or `work on #123`
- Push regularly to remote branch
- Keep PR descriptions up-to-date in draft PRs

### 4. Code Review & Testing
- **Claude's role**: Initial code review for quality, security, correctness
- **Codex's role**: Functional testing, UI/UX verification, edge cases
- Separate issues created for review and testing phases
- Tests must pass before merging

### 5. Merge & Deployment
- **Merge Coordinator**: One agent (currently unassigned) coordinates all merges to main
- Requires:
  - ✅ All tests passing
  - ✅ Code review approved
  - ✅ No merge conflicts
  - ✅ Handoff summary posted in docs/handoffs/

## File Coordination

Before editing any file:
1. Check if file is listed in any in-progress issue
2. If conflict exists, coordinate with other agent:
   - Divide sections by clear boundaries
   - One agent owns each section
   - Document division in issue comment
3. Update frequency requirements in COLLABORATION.md if file is frequently edited

### High-Touch Files (Require Coordination)
- `src/pages/**/*.tsx` - UI components
- `src/services/**/*.ts` - API integration
- `package.json` - Dependencies
- Database schemas
- Configuration files

## Handoff Process

After completing a task:
1. Create handoff summary in `docs/handoffs/YYYYMMDD-<task-name>.md`
2. Include:
   - **Commit/PR**: Link to merged PR
   - **What changed**: Brief summary of changes
   - **What was tested**: Testing performed
   - **What's blocked**: Any unresolved issues
   - **Next action**: What's needed next
3. Link handoff in the closed issue

## Communication

- **Coordination needed**: Comment on relevant GitHub Issues
- **Immediate blockers**: Use issue comments for async communication
- **Conflicts**: Discussion in issue before making changes
- **Status updates**: Post brief update in issue when starting/finishing

## Current Focus Areas

### Build & Store Preparation
- [ ] Store infrastructure setup
- [ ] Payment system preparation (DO NOT implement yet)
- [ ] API key management (DO NOT add keys yet)

### Codex Review Tasks
- Separate issues will be created for:
  - Code review checklist
  - UI/UX testing procedures
  - Integration testing

## Tools & Technologies

- **Git**: Version control with feature branches
- **GitHub Issues**: Task management and tracking
- **GitHub PRs**: Code review and discussion
- **docs/handoffs/**: Work transfer documentation

## Rules

✅ DO:
- Check GitHub Issues before starting work
- Comment on issues indicating your work
- Create atomic commits with clear messages
- Run tests before pushing
- Coordinate on shared files
- Document handoffs

❌ DON'T:
- Work on unlisted files without checking
- Force-push to main or develop
- Merge without approval
- Add payment/API keys without explicit request
- Skip testing before push
- Leave issues without status updates

## Getting Started

1. Check the [GitHub Issues](../../issues) board for assigned tasks
2. Read the issue description and comments
3. Comment with files you'll be working on
4. Create/switch to your feature branch
5. Begin development
6. Push regularly and create/update PR
7. Complete handoff summary when done
