# Claude & Codex Collaboration Guide

## Overview
This guide describes how Claude and Codex coordinate work to avoid conflicts and maintain code quality.

## Roles & Responsibilities

### Claude
- **Primary role**: Feature development and implementation
- **Secondary role**: Architecture decisions, API design
- **Workflow**: Develops on feature branch → Creates PR → Updates based on Codex feedback
- **Commits to**: `ccr-ca8545f1-o0wys8` branch

### Codex
- **Primary role**: Code review, testing, quality assurance
- **Secondary role**: Bug identification, edge case testing
- **Workflow**: Reviews Claude's work → Tests functionality → Reports findings
- **Commits to**: Separate feature branches for any necessary fixes

### Merge Coordinator
- **Currently**: Unassigned (should be designated)
- **Responsibility**: Approves and merges PRs to main
- **Requirements**: All tests passing, reviews approved, no conflicts

## File Ownership & Coordination

### Core Business Logic (Claude → Codex Review)
Files that Claude develops and Codex reviews:
- `src/pages/stores/**/*.tsx` - Store UI components
- `src/services/store.ts` - Store API service
- `src/types/store.ts` - Store types and interfaces
- `docs/PAYMENT_SYSTEM.md` - Payment preparation docs

### Configuration Files (Requires Coordination)
Files that may need updates from both parties:
- `package.json` - Dependencies (coordinate changes)
- `tsconfig.json` - TypeScript config (notify before changes)
- `.env.example` - Environment variables (document any new ones)

### Testing Files (Codex Priority)
Files where Codex makes changes:
- `src/**/*.test.ts` - Unit tests
- `src/**/*.test.tsx` - Component tests
- `cypress/**/*.ts` - E2E tests
- Any test-related configuration

### Documentation (Shared)
- `README.md` - General updates from both
- `docs/**/*.md` - Feature documentation (author documents own features)
- `AGENTS.md` - Workflow (update together)
- `COLLABORATION.md` - This file (update together)

## High-Touch File Protocol

When working on files that are frequently edited or shared:

1. **Before starting work**:
   - Search for the file in GitHub Issues
   - Check if another agent is working on it
   - Comment on the issue: "I'll be working on `path/to/file.ts`"

2. **During work**:
   - Keep commits focused on specific changes
   - Push regularly (at least daily)
   - Update PR description with current status

3. **When conflicts arise**:
   - Communicate in the GitHub Issue
   - Divide the file into clear sections
   - One agent owns each section
   - Update the issue with division agreement

4. **After completion**:
   - Document file changes in handoff summary
   - Note any gotchas for future edits

### Currently Identified High-Touch Files
- `src/pages/**/*.tsx` - Multiple components may be modified
- `src/services/**/*.ts` - Shared API layer
- `package.json` - Dependency updates
- Database schemas - If created

## Code Review Process

### Steps
1. **Claude develops** on feature branch
2. **Claude creates PR** with description of changes
3. **Codex reviews** for quality, security, performance
4. **Codex posts findings** as PR comments or separate issues
5. **Claude addresses findings** or discusses concerns
6. **Codex approves** when satisfied
7. **Merge Coordinator merges** to main

### Review Standards
- ✅ Code follows project conventions
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Tests cover critical paths
- ✅ Documentation is clear
- ✅ TypeScript types are strict

### Finding Severity
- **Blocker** (Red 🔴): Must fix before merge
  - Security vulnerabilities
  - Breaking bugs
  - Type errors
- **Major** (Orange 🟠): Should fix before merge
  - Performance issues
  - Poor architecture choices
  - Missing error handling
- **Minor** (Yellow 🟡): Nice to fix (can merge with plan to fix)
  - Code style issues
  - Documentation gaps
  - Naming improvements
- **Optional** (Blue 🔵): Suggestions for future work
  - Refactoring ideas
  - Future optimizations
  - Long-term improvements

## Testing Process

### Functional Testing (Codex)
Verify that features work as intended:
1. Test normal use cases
2. Test edge cases (empty states, large data, etc.)
3. Test error scenarios
4. Verify error messages are helpful
5. Check loading states

### UI/UX Testing (Codex)
Verify the user experience:
1. Test responsive design (mobile, tablet, desktop)
2. Test accessibility (keyboard navigation, screen readers)
3. Test visual consistency
4. Test interaction feedback
5. Test performance perception (loading, responsiveness)

### Integration Testing (Codex)
Verify integration with existing systems:
1. Test with existing PE Ultimate features
2. Run full test suite
3. Check for console errors/warnings
4. Test data persistence
5. Test API integration

### Test Reports
When issues are found, report as:
```
## Issue: [Title]
- **Test**: What you were testing
- **Steps to reproduce**: 
- **Expected**: 
- **Actual**: 
- **Severity**: Blocker/Major/Minor/Optional
- **Environment**: Browser/Device/OS
```

## Handoff Documentation

Every completed task must have a handoff summary in `docs/handoffs/`.

### File Naming
`YYYYMMDD-<task-name>.md`

Example: `20260101-store-listing-page.md`

### Content
See `docs/handoffs/TEMPLATE.md` for the full template.

### Posting
1. Create the handoff summary when task is complete
2. Link it in the GitHub Issue
3. Post a comment in the issue with a summary

## Merge Protocol

### Prerequisites for Merge
- ✅ All automated tests passing
- ✅ Code review approved by Codex
- ✅ All findings addressed or documented
- ✅ No merge conflicts
- ✅ Handoff summary completed
- ✅ Issue comments resolved

### Who Can Merge
Currently: Merge Coordinator (TBD)

### Merge Process
1. **Verify prerequisites** above are met
2. **Check branch** is up-to-date with main
3. **Run final test suite** locally
4. **Merge to main** with descriptive commit message
5. **Delete feature branch** after merge
6. **Verify deployment** (if auto-deploy is enabled)

### Commit Message Format
```
Merge #[issue-number]: [Brief description]

- Change 1
- Change 2
- Change 3

Related to: [any related issues]
```

## Common Workflows

### Workflow A: New Feature (Typical)
1. Claude checks #13 for current work
2. Claude creates feature branch: `feature/store-listing`
3. Claude comments on #13: "Starting work on store listing. Files: src/pages/stores/list.tsx, src/services/store.ts"
4. Claude develops and pushes regularly
5. Claude creates PR with description
6. Codex reviews and posts findings
7. Claude addresses findings
8. Codex approves
9. Merge Coordinator merges
10. Claude creates handoff summary

### Workflow B: Bug Fix
1. Codex finds bug during testing (#16)
2. Codex creates issue: "[BUG] Store names not displaying"
3. Claude (or Codex) claims bug
4. Codex comments: "Working on bug in src/pages/stores/detail.tsx"
5. Developer fixes bug and creates PR
6. Codex verifies fix
7. Merge Coordinator merges
8. Handoff summary posted

### Workflow C: Conflict Resolution
1. Both agents need to edit `src/pages/stores/list.tsx`
2. Agent B comments on #13: "Also need to edit src/pages/stores/list.tsx"
3. Both agents discuss division:
   - Agent A: Handles filter/sort logic
   - Agent B: Handles pagination
4. Agreement posted in issue
5. Both agents proceed with separate sections
6. Merge carefully to avoid conflicts

## Tools & Systems

### GitHub
- **Issues**: Task tracking and coordination
- **PRs**: Code review and discussion
- **Branches**: Feature branches for isolation

### Git
- **Feature branches**: `feature/*, fix/*, review/*`
- **Main branch**: Production-ready code
- **Development branch**: Pre-release staging (if used)

### Documentation
- **AGENTS.md**: Workflow overview
- **COLLABORATION.md**: This file (detailed coordination)
- **docs/handoffs/**: Task completion summaries
- **GitHub Issues**: Specific task details

## Escalation Path

If conflicts or blockers occur:

1. **Minor disagreement**: Discuss in GitHub Issue
2. **Moderate conflict**: Post detailed comment with context
3. **Blocking issue**: Tag both agents and request immediate discussion
4. **Merge conflict**: Post in #18 Coordination issue

## Continuous Improvement

This workflow will evolve. If something isn't working:

1. Post in #18 (Coordination) with observation
2. Suggest improvement
3. Test the improvement
4. Update COLLABORATION.md if it works

---

**Last Updated**: 2026-09-30  
**Status**: Active  
**Questions?**: Open an issue or comment on #18
