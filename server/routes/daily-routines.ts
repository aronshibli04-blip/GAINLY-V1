import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { dailyRoutines, dailyRoutineCompletions, userStats, insertDailyRoutineCompletionSchema } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Get user's daily routines
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userRoutines = await db
      .select()
      .from(dailyRoutines)
      .where(and(
        eq(dailyRoutines.userId, userId),
        eq(dailyRoutines.isActive, true)
      ))
      .orderBy(dailyRoutines.order);

    // Check which routines are completed today
    const today = new Date().toISOString().split('T')[0];
    const completions = await db
      .select()
      .from(dailyRoutineCompletions)
      .where(and(
        eq(dailyRoutineCompletions.userId, userId),
        eq(dailyRoutineCompletions.completedDate, today)
      ));

    const completedRoutineIds = new Set(completions.map(c => c.routineId));

    const routinesWithCompletion = userRoutines.map(routine => ({
      ...routine,
      isCompleted: completedRoutineIds.has(routine.id)
    }));

    res.json(routinesWithCompletion);
  } catch (error) {
    console.error('Error fetching daily routines:', error);
    res.status(500).json({ error: 'Failed to fetch daily routines' });
  }
});

// Complete a daily routine
router.post('/complete', async (req, res) => {
  try {
    const completionData = insertDailyRoutineCompletionSchema.parse(req.body);
    
    // Check if already completed today
    const existing = await db
      .select()
      .from(dailyRoutineCompletions)
      .where(and(
        eq(dailyRoutineCompletions.userId, completionData.userId),
        eq(dailyRoutineCompletions.routineId, completionData.routineId),
        eq(dailyRoutineCompletions.completedDate, completionData.completedDate)
      ));

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Routine already completed today' });
    }

    // Get routine details for points
    const [routine] = await db
      .select()
      .from(dailyRoutines)
      .where(eq(dailyRoutines.id, completionData.routineId));

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    // Create completion record
    const [completion] = await db
      .insert(dailyRoutineCompletions)
      .values({
        ...completionData,
        pointsEarned: routine.points,
      })
      .returning();

    // Update user stats
    const [existingStats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, completionData.userId));

    if (existingStats) {
      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      if (existingStats.lastCompletionDate === yesterdayStr) {
        newStreak = existingStats.currentStreak + 1;
      }

      const newTotalPoints = existingStats.totalPoints + routine.points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      await db
        .update(userStats)
        .set({
          totalPoints: newTotalPoints,
          currentStreak: newStreak,
          longestStreak: Math.max(existingStats.longestStreak, newStreak),
          level: newLevel,
          lastCompletionDate: completionData.completedDate,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, completionData.userId));
    } else {
      // Create initial stats
      await db
        .insert(userStats)
        .values({
          userId: completionData.userId,
          totalPoints: routine.points,
          currentStreak: 1,
          longestStreak: 1,
          level: 1,
          lastCompletionDate: completionData.completedDate,
        });
    }

    res.json({
      ...completion,
      pointsEarned: routine.points,
    });
  } catch (error) {
    console.error('Error completing routine:', error);
    res.status(500).json({ error: 'Failed to complete routine' });
  }
});

// Create default routines for a user (called by AI coach)
router.post('/generate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Default hardgainer-focused routines
    const defaultRoutines = [
      {
        userId,
        title: "Drikk et glass helmelk",
        description: "150 kalorier på 30 sekunder - perfekt for hardgainers!",
        points: 25,
        category: "nutrition" as const,
        order: 1,
      },
      {
        userId,
        title: "Spis en håndfull nøtter",
        description: "200+ kalorier i en liten porsjon. Mandler, valnøtter eller cashewnøtter.",
        points: 30,
        category: "nutrition" as const,
        order: 2,
      },
      {
        userId,
        title: "Rydde sengen",
        description: "Start dagen med en liten seier og struktur.",
        points: 15,
        category: "productivity" as const,
        order: 3,
      },
      {
        userId,
        title: "Gå en 10-minutters tur",
        description: "Lett aktivitet som øker appetitten og forbedrer søvn.",
        points: 20,
        category: "fitness" as const,
        order: 4,
      },
      {
        userId,
        title: "Drikk 2 glass vann ved oppvåkning",
        description: "Hydrering kickstarter metabolismen din.",
        points: 15,
        category: "health" as const,
        order: 5,
      },
    ];

    // Check if user already has routines
    const existingRoutines = await db
      .select()
      .from(dailyRoutines)
      .where(eq(dailyRoutines.userId, userId));

    if (existingRoutines.length > 0) {
      return res.json({ message: 'User already has routines', routines: existingRoutines });
    }

    // Insert default routines
    const createdRoutines = await db
      .insert(dailyRoutines)
      .values(defaultRoutines)
      .returning();

    res.json({ 
      message: 'Default routines created successfully',
      routines: createdRoutines 
    });
  } catch (error) {
    console.error('Error generating routines:', error);
    res.status(500).json({ error: 'Failed to generate routines' });
  }
});

export { router as dailyRoutinesRouter };