import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mongleApi, normalizeReport, toReportPayload, createReportCoachReply } from '../src/lib/api.ts'

const data = {
  ai_summary: { text: 'Test report summary', sleep_score: 80, evaluation: 'Test evaluation' },
  key_metrics: {
    sleep_score: 80, sleep_satisfaction: 4, average_rem: 21.5,
    average_snoring: 3, average_temperature: 22, average_humidity: 52,
  },
  pattern_analysis: [{ condition: 'Test condition', result: 'Test result', description: 'Test description' }],
  abnormal_patterns: [{ date: '2026-09-01', observation: 'Test observation', opinion: 'Test opinion' }],
  improvement_suggestions: ['Test suggestion'],
}

test('new report fields, nested JSON, metadata and abnormal patterns survive normalization', () => {
  const report = normalizeReport({ report_id: 12, created_at: '2026-09-01', report_data: JSON.stringify(data) })
  assert.equal(report.id, '12')
  assert.equal(report.createdAt, '2026-09-01')
  assert.equal(report.metrics.remPercentage, 21.5)
  assert.equal(report.metrics.satisfaction, 4)
  assert.equal(report.metrics.temperature, 22)
  assert.equal(report.metrics.humidity, 52)
  assert.equal(report.serverSnoringAverage, 3)
  assert.equal(report.metrics.snoringCount, null)
  assert.deepEqual(report.summary, ['Test report summary'])
  assert.match(report.patterns[0], /Test condition.*Test result.*Test description/)
  assert.deepEqual(report.abnormalPatterns, data.abnormal_patterns)
  assert.deepEqual(report.suggestions, data.improvement_suggestions)
  assert.match(createReportCoachReply('REM', report), /21.5/)
  assert.match(createReportCoachReply('만족도', report), /4/)
})

test('missing metrics are never serialized as zero; integer fields are validated', () => {
  const report = normalizeReport(data)
  assert.deepEqual(toReportPayload(report).key_metrics, data.key_metrics)
  assert.throws(() => toReportPayload({ ...report, metrics: { ...report.metrics, satisfaction: null } }))
  assert.throws(() => toReportPayload({ ...report, metrics: { ...report.metrics, satisfaction: 4.5 } }))
  assert.equal(normalizeReport({ key_metrics: { sleep_score: 'not-a-number' }, ai_summary: { text: 'x' } }).metrics.score, null)
})

test('latest report uses exact server path and new payload', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url)
    return Response.json({ id: 12, data })
  })
  const report = await mongleApi.getLatestReport('7')
  assert.deepEqual(calls, ['/api/report/latest/7'])
  assert.equal(report.source, 'server')
  assert.equal(report.metrics.satisfaction, 4)
})

test('save posts user_id query and typed body, then retrieves the returned report ID', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    return options.method === 'POST' ? Response.json({ report_id: 12 }) : Response.json({ id: 12, data })
  })
  const report = await mongleApi.saveReport('7', normalizeReport(data))
  assert.equal(calls[0].url, '/api/report?user_id=7')
  assert.equal(calls[0].options.method, 'POST')
  assert.deepEqual(JSON.parse(calls[0].options.body).key_metrics, data.key_metrics)
  assert.equal(calls[1].url, '/api/report/12')
  assert.equal(report.id, '12')
})

test('absent REM and satisfaction produce an unsaved preview without a POST', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    return Response.json([{ day: '2026-09-01', sleep_score: 80, snoring_count: 0, temp_avg: 22, hum_avg: 50, duration: 480 }])
  })
  const preview = await mongleApi.generateReport('7')
  assert.equal(preview.source, 'sleep-records')
  assert.equal(preview.metrics.snoringCount, 0)
  assert.ok(preview.notice)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, '/api/sleepinfo?id=7')
})

test('authorization failure is not silently replaced with a preview', async (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls += 1
    return Response.json({ detail: 'Forbidden' }, { status: 403 })
  })
  await assert.rejects(mongleApi.getLatestReport('7'), { status: 403 })
  assert.equal(calls, 1)
})

test('complete sleep records are aggregated and saved with the new contract', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    if (url.includes('sleepinfo')) return Response.json([{
      day: '2026-09-01', sleep_score: 80, sleep_satisfaction: 4, rem_percentage: 21.5,
      snoring_count: 3, temp_avg: 22, hum_avg: 52, duration: 480,
    }])
    return Response.json({ report_id: 12, data: JSON.parse(options.body) })
  })
  const report = await mongleApi.generateReport('7')
  assert.equal(calls.length, 2)
  assert.equal(calls[1].url, '/api/report?user_id=7')
  assert.deepEqual(JSON.parse(calls[1].options.body).key_metrics, data.key_metrics)
  assert.equal(report.source, 'server')
})
