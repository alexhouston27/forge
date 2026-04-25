import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        logs: {
          where: { date: new Date(todayStr) },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const habitsWithLog = habits.map((habit) => ({
      ...habit,
      todayLog: habit.logs[0] ?? null,
    }))

    return NextResponse.json(habitsWithLog)
  } catch (error) {
    console.error('[Habits GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        category: body.category ?? 'OTHER',
        frequency: body.frequency ?? 'DAILY',
        trackingType: body.trackingType ?? 'BINARY',
        targetValue: body.targetValue,
        unit: body.unit,
        color: body.color ?? '#10b981',
        emoji: body.emoji,
        goalId: body.goalId,
        reminderTime: body.reminderTime,
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('[Habits POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
