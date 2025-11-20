Teachers feature (frontend)

Purpose
- Provide a simple Teachers page to list teacher agents and create new ones.
- Creation is constrained to the default workflow: `teachers-Teacher` (no workflow picker).

Public surface (re-exported from awfl-web agents)
- useAgentsList(params: { idToken?, enabled? })
- useAgentsApi(params: { idToken?, enabled? })
- useAgentModalController(params)
- AgentModal (used elsewhere for editing; not used for creation on Teachers page)
- useSessionAgentConfig (used in ClassLessons for per-lesson agent config)

UI components/pages
- pages/Teachers.tsx
  - Lists agents filtered by `workflowName === 'teachers-Teacher'`.
  - "New Teacher" opens a lightweight CreateTeacherModal.
  - Modal collects name/description and calls `useAgentsApi().saveAgent` with `workflowName: 'teachers-Teacher'`.
  - Reloads list on create.

Notes & constraints
- We intentionally omit workflow/tools selection during creation; these can be edited later via AgentModal where appropriate.
- Auth: hooks accept `idToken`; local dev may rely on VITE_SKIP_AUTH=1.
- Accessibility: modal has role="dialog" and aria-modal; clicking the backdrop closes it. ESC-to-close and focus trap can be added later.

Dev checklist
- Add route `/teachers` in App.tsx and header/mobile links (done).
- Confirm list loads and creating a teacher adds it to the list (smoke test).
- Optional: Add Edit action that opens AgentModal for the selected agent.
