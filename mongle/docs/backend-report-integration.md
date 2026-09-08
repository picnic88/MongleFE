# Report integration (2026-09-08)

Contract checked at http://13.125.10.228/openapi.json.

- GET /report/latest/{user_id}: latest saved report. A null response means no saved report.
- POST /report?user_id={user_id}: saves AiSleepReportData as JSON. This is a storage endpoint, not an AI generation endpoint. The old id/start_date/end_date query is no longer used.
- GET /report/{report_id}: fetches the report identifier returned after saving.
- The page maps ai_summary.text, key_metrics, pattern_analysis, abnormal_patterns and improvement_suggestions to the report display.
- The chat's local rules read REM and satisfaction from a saved report when available. Chat content is not sent to any backend endpoint.

## Pending backend details

The current sleepinfo records omit REM and satisfaction, while KeyMetrics requires both numeric fields. The frontend does not replace missing measurements with zero. It displays an explicitly unsaved preview when required values are unavailable. Scores and satisfaction must also be integers under the current schema; fractional averages are not silently rounded.

To persist partial reports, the backend needs to accept null for missing measurements (and fractional averages if applicable), or supply the missing measurements through an analysis endpoint. Until then, saveReport sends only complete valid reports.

average_snoring has no documented unit. Its raw value is displayed separately from explicit snoring_count; it is not treated as a count or duration. Confirm units/scales for average_rem, sleep_satisfaction and average_snoring. Stored reports also lack a declared period and daily trends; unrelated daily records are not attached to them.

There is no chat endpoint in the current OpenAPI document. Actual model-based answers require an endpoint that accepts a question, even when no conversation is stored. The existing browser cache and rule-based replies do not call a generative model.

## Verification

Read-only live checks: latest/1 returned 200/null and report/user/1 returned 200/[]. No production report was inserted for testing. POST body, returned-ID follow-up, new response mapping, missing values and authorization failures are covered by mocked HTTP tests:

```sh
node --experimental-strip-types --test tests/report-api.test.mjs
npm run build
npm run lint
```

Local development uses Vite's /api proxy. A production deployment needs its own reverse proxy or a CORS-enabled API URL. The current VITE_MONGLE_USER_ID setting is a development user override; production must resolve the actual signed-in user's numeric ID.
