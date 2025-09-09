import { Router } from 'express';
import { db } from '../db';
import { userStats, dailyRoutineCompletions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Get user statistics
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user stats
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    if (!stats) {
      // Return default stats if none exist
      return res.json({
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        todayProgress: 0,
      });
    }

    // Calculate today's progress
    const today = new Date().toISOString().split('T')[0];
    const [todayCompletions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyRoutineCompletions)
      .where(and(
        eq(dailyRoutineCompletions.userId, userId),
        eq(dailyRoutineCompletions.completedDate, today)
      ));

    const todayProgress = Number(todayCompletions?.count || 0);

    res.json({
      totalPoints: stats.totalPoints,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      level: stats.level,
      todayProgress,
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export { router as userStatsRouter };