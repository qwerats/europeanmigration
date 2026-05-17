#!/usr/bin/env node
import { runMigrationMonitor } from '../api/migration-monitor.js';

const report = await runMigrationMonitor({ writeFiles: true });
console.log(report.markdown);
console.error(`\nSaved to reports/ and data/metrics-history.json (status: ${report.runMeta.status})`);
