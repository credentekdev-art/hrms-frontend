# Local validation and outstanding work

## Current accepted CORS decision

Wildcard CORS is accepted by the owner for this internal deployment. Production
uses same-origin /api/v1 through nginx. CORS_ORIGINS is unused by the application
CORS middleware. app/main.py retains allow_origins=["*"] without an added exception
handler. The current tests/test_cors.py is preserved unchanged in the backend
baseline; its original cannot be recovered. These tests do not match the wildcard
setup and need the developer's decision. CI excludes them from blocking tests and
runs them separately as a non-blocking known issue. No application fix branch is
planned. Earlier validation results below are historical, not a new passing run.

Application code retains the original wildcard CORS setup.

- Source checks: passed.
- ESLint: passed with 28 warnings (zero errors).
- Unit tests: 9 passed, 1 failed; EligibleEmployeePicker.test.jsx fails to find the expected empty-state text. RequestsPage.test.jsx also raises an unhandled scrollIntoView TypeError.
- Prettier: failed; files listed below. Application formatting needs separate approval.
- Coverage installation: blocked by registry.npmjs.org DNS resolution (EAI_AGAIN); no cached package available.
- package.json and package-lock.json remain byte-for-byte as they were before this task.
- On a network-enabled machine, run the following reviewed setup command, then commit both package files together:

```bash
npm install --save-dev --save-exact @vitest/coverage-v8@2.1.9 --ignore-scripts
```

This matches the current lockfile Vitest version, 2.1.9. Coverage CI remains blocked until this is done.

## Files needing formatting

- `.github/pull_request_template.md`
- `eslint.config.js`
- `scripts/lint.mjs`
- `src/__tests__/AutocompleteField.test.jsx`
- `src/__tests__/ConfirmDialog.test.jsx`
- `src/__tests__/EligibleEmployeePicker.test.jsx`
- `src/__tests__/RequestsPage.test.jsx`
- `src/__tests__/Sidebar.test.jsx`
- `src/api/client.js`
- `src/App.jsx`
- `src/components/AllocationActionModal.jsx`
- `src/components/AllocationDetailPanel.jsx`
- `src/components/AllocationListView.jsx`
- `src/components/AutocompleteField.jsx`
- `src/components/CalendarAgenda.jsx`
- `src/components/CalendarDayPanel.jsx`
- `src/components/CalendarDrawer.jsx`
- `src/components/CapacityBar.jsx`
- `src/components/ConfirmDialog.jsx`
- `src/components/DayCalendar.jsx`
- `src/components/EligibleEmployeePicker.jsx`
- `src/components/EmployeeSuggestionList.jsx`
- `src/components/MasterAutocomplete.jsx`
- `src/components/MiniMonthNavigator.jsx`
- `src/components/MonthCalendar.jsx`
- `src/components/RequestWizard.jsx`
- `src/components/ResourceTimeline.jsx`
- `src/components/ResourceTimelineView.jsx`
- `src/components/Shell.jsx`
- `src/components/Sidebar.jsx`
- `src/components/Timeline.jsx`
- `src/components/Toast.jsx`
- `src/components/Topbar.jsx`
- `src/components/VirtualizedAgenda.jsx`
- `src/components/WeekCalendar.jsx`
- `src/hooks/useFormValidation.js`
- `src/hooks/useSubmitValidation.js`
- `src/main.jsx`
- `src/pages/AllocationsPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/EmployeeProfilePage.jsx`
- `src/pages/EmployeesPage.jsx`
- `src/pages/FeedbackPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/MastersPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/ProjectsPage.jsx`
- `src/pages/RequestsPage.jsx`
- `src/pages/SettingsPage.jsx`
- `src/pages/TimelinePage.jsx`
- `src/styles/app.css`
- `src/styles/theme.css`
- `src/utils/allocation.js`
- `vite.config.js`
- `vitest.config.js`

## Existing ESLint warnings

```text
> hrms-resource-management-ui@1.0.0 lint:eslint
> eslint .


/home/credentek/Videos/hrms_resource_management/frontend/src/components/AllocationDetailPanel.jsx
  11:230  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/components/CalendarDrawer.jsx
  11:709  warning  React Hook useEffect has missing dependencies: 'drawer' and 'filters'. Either include them or remove the dependency array                 react-hooks/exhaustive-deps
  11:754  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/components/EligibleEmployeePicker.jsx
  28:5   warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array                                   react-hooks/exhaustive-deps
  28:22  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/components/MasterAutocomplete.jsx
   7:110  warning  'required' is assigned a value but never used. Allowed unused args must match /^_/u                      no-unused-vars
  28:5    warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/context/AuthContext.jsx
  30:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/AllocationsPage.jsx
  15:415  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array                                                                                         react-hooks/exhaustive-deps
  17:507  warning  React Hook useMemo has missing dependencies: 'em', 'f.employee', 'f.end', 'f.project', 'f.q', 'f.request', 'f.start', 'f.status', and 'pm'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  17:542  warning  React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked                                                          react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/DashboardPage.jsx
  38:32  warning  React Hook useMemo has a missing dependency: 'live'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/EmployeeProfilePage.jsx
  12:421  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  13:179  warning  React Hook useMemo has a missing dependency: 'today'. Either include it or remove the dependency array   react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/EmployeesPage.jsx
  16:129  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/MastersPage.jsx
  17:131  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/RequestsPage.jsx
  43:75  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/credentek/Videos/hrms_resource_management/frontend/src/pages/TimelinePage.jsx
  27:293  warning  React Hook useMemo has a missing dependency: 'params'. Either include it or remove the dependency array                                   react-hooks/exhaustive-deps
  27:294  warning  React Hook useMemo has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked    react-hooks/exhaustive-deps
  31:51   warning  React Hook useEffect has a missing dependency: 'params'. Either include it or remove the dependency array                                 react-hooks/exhaustive-deps
  31:52   warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps
  31:212  warning  React Hook useEffect has missing dependencies: 'params' and 'setQuery'. Either include them or remove the dependency array                react-hooks/exhaustive-deps
  35:117  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array                                   react-hooks/exhaustive-deps
  35:145  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps
  35:168  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps
  35:190  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps
  35:211  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps
  35:230  warning  React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked  react-hooks/exhaustive-deps

✖ 28 problems (0 errors, 28 warnings)
```
