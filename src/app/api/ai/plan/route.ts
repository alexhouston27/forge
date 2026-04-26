import { NextRequest, NextResponse } from 'next/server'
import { generateDayPlan } from '@/lib/ai'
import type { TaskItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { prompt: string; tasks?: TaskItem[] }

    const energyPeak = body.prompt.toLowerCase().includes('evening') || body.prompt.toLowerCase().includes('night')
      ? 'evening'
      : body.prompt.toLowerCase().includes('afternoon')
      ? 'afternoon'
      : 'morning'

    const plan = await generateDayPlan({
      workHours: { start: '09:00', end: '17:00' },
      tasks: body.tasks ?? [],
      preferences: body.prompt,
      energyPeak,
    })

    return NextResponse.json(plan)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[AI Plan]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
