import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { date: string; completed: boolean; value?: number }
    const date = new Date(body.date)

    // Upsert the log
    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date } },
      create: {
        habitId: id,
        userId: user.id,
        date,
        completed: body.completed,
        value: body.value,
      },
      update: {
        completed: body.completed,
        value: body.value,
      },
    })

    // Recalculate streaks
    if (body.completed) {
      await recalculateStreak(id, user.id)
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('[Habit log POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function recalculateStreak(habitId: string, userId: string) {
  const logs = await prisma.habitLog.findMany({
    where: { habitId, userId, completed: true },
    orderBy: { date: 'desc' },
  })

  let streak = 0
  let prev: Date | null = null

  for (const log of logs) {
    if (!prev) {
      streak = 1
      prev = log.date
    } else {
      const diff = Math.abs(
        (prev.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diff <= 1) {
        streak++
        prev = log.date
      } else {
        break
      }
    }
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: {
      currentStreak: streak,
      totalCompletions: logs.length,
    },
  })
}
