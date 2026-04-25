import { PrismaClient } from '@prisma/client'
import { subDays, format } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding FORGE database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@forge.app' },
    update: {},
    create: {
      email: 'demo@forge.app',
      name: 'Alex Houston',
      timezone: 'America/Chicago',
      xp: 3400,
      level: 7,
    },
  })

  console.log(`✓ User: ${user.name}`)

  // Goals
  const healthGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Get lean and athletic',
      description: 'Reach 12% body fat and build functional strength.',
      category: 'HEALTH',
      status: 'ACTIVE',
      priority: 1,
      targetDate: new Date('2026-06-01'),
      progress: 42,
      color: '#10b981',
      emoji: '💪',
    },
  })

  await prisma.milestone.createMany({
    data: [
      { goalId: healthGoal.id, title: 'Lose first 5 lbs', status: 'COMPLETED', order: 1, completedAt: new Date() },
      { goalId: healthGoal.id, title: 'Workout 4x/week consistently', status: 'IN_PROGRESS', order: 2 },
      { goalId: healthGoal.id, title: 'Hit 15% body fat', status: 'PENDING', order: 3 },
    ],
  })

  const businessGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Launch FORGE to 1,000 users',
      description: 'Build, ship, and grow a productized SaaS.',
      category: 'BUSINESS',
      status: 'ACTIVE',
      priority: 1,
      targetDate: new Date('2026-09-01'),
      progress: 15,
      color: '#6366f1',
      emoji: '🚀',
    },
  })

  console.log(`✓ Goals created`)

  // Habits
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        userId: user.id,
        goalId: healthGoal.id,
        title: 'Workout',
        category: 'FITNESS',
        color: '#10b981',
        emoji: '🏋️',
        currentStreak: 12,
        longestStreak: 21,
        totalCompletions: 89,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Meditate',
        category: 'MINDFULNESS',
        trackingType: 'DURATION',
        targetValue: 10,
        unit: 'minutes',
        color: '#8b5cf6',
        emoji: '🧘',
        currentStreak: 5,
        longestStreak: 30,
        totalCompletions: 64,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: 'Read',
        category: 'LEARNING',
        trackingType: 'DURATION',
        targetValue: 30,
        unit: 'minutes',
        color: '#6366f1',
        emoji: '📖',
        currentStreak: 8,
        longestStreak: 45,
        totalCompletions: 112,
      },
    }),
  ])

  // Generate 90 days of habit logs
  for (const habit of habits) {
    const logData = Array.from({ length: 90 }, (_, i) => ({
      habitId: habit.id,
      userId: user.id,
      date: subDays(new Date(), 89 - i),
      completed: Math.random() > 0.25,
    }))
    await prisma.habitLog.createMany({ data: logData, skipDuplicates: true })
  }

  console.log(`✓ Habits and logs created`)

  // Tasks for today
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        goalId: businessGoal.id,
        title: 'Finish FORGE Today dashboard',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        energy: 'HIGH',
        estimatedMinutes: 120,
        scheduledFor: new Date(),
        tags: ['dev', 'forge'],
      },
      {
        userId: user.id,
        title: 'Write weekly newsletter',
        status: 'TODO',
        priority: 'HIGH',
        energy: 'MEDIUM',
        estimatedMinutes: 45,
        scheduledFor: new Date(),
        tags: ['content'],
      },
      {
        userId: user.id,
        title: 'Meal prep for the week',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        scheduledFor: new Date(),
        completedAt: new Date(),
        tags: ['health'],
      },
    ],
  })

  console.log(`✓ Tasks created`)

  // Today's journal
  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      date: new Date(),
      type: 'DAILY',
      wins: 'Shipped the Habits component. Great focus session in the morning.',
      lessons: 'Deep work needs to start earlier — after 2pm it\'s hard to get into flow.',
      tomorrowFocus: 'Finish the Vault and Analytics pages.',
    },
  })

  // Notes
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: 'The compounding power of habits',
        content: 'Every action you take is a vote for the type of person you want to become.',
        type: 'QUOTE',
        tags: ['habits', 'mindset'],
        isPinned: true,
        isFavorite: true,
      },
      {
        userId: user.id,
        goalId: businessGoal.id,
        title: 'FORGE GTM strategy',
        content: 'Distribution is the moat. Twitter/build-in-public + PH launch + referral program.',
        type: 'BUSINESS',
        tags: ['forge', 'growth'],
        isPinned: true,
      },
    ],
  })

  console.log(`✓ Journal and notes created`)
  console.log('\n✅ Seed complete! Demo user: demo@forge.app')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
