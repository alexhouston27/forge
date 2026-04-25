import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        habits: true,
        tasks: true,
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('[Goals GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        category: body.category ?? 'PERSONAL',
        priority: body.priority ?? 1,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        color: body.color ?? '#6366f1',
        emoji: body.emoji,
      },
      include: { milestones: true, habits: true, tasks: true },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('[Goals POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
