import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd')

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        scheduledFor: new Date(date),
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('[Tasks GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        priority: body.priority ?? 'MEDIUM',
        energy: body.energy,
        estimatedMinutes: body.estimatedMinutes,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : new Date(),
        scheduledTime: body.scheduledTime,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        tags: body.tags ?? [],
        goalId: body.goalId,
        isRecurring: body.isRecurring ?? false,
        recurrenceRule: body.recurrenceRule,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('[Tasks POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
