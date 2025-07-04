import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Run every hour at minute 0 (00:00, 01:00, 02:00, etc.)
// Clean up expired auth codes
crons.interval(
  'cleanup-expired-auth-codes',
  { hours: 1 },
  internal.crons.cleanupTasks.cleanupExpiredAuthCodes
)

// Run daily at 2:00 AM
// Clean up expired refresh tokens
crons.daily(
  'cleanup-expired-refresh-tokens',
  { hourUTC: 2, minuteUTC: 0 },
  internal.crons.cleanupTasks.cleanupExpiredRefreshTokens
)

// Run weekly on Sunday at 3:00 AM
// Run all cleanup tasks (comprehensive cleanup)
crons.weekly(
  'weekly-comprehensive-cleanup',
  { dayOfWeek: 'sunday', hourUTC: 3, minuteUTC: 0 },
  internal.crons.cleanupTasks.runAllCleanupTasks
)

export default crons
