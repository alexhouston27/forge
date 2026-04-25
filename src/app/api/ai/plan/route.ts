import { NextRequest, NextResponse } from 'next/server'
import { generateDayPlan } from '@/lib/openai'
import type { TaskItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { prompt: string; tasks?: TaskItem[] }

    // Parse work hours from prompt using simple heuristics
    const workHourMatch = body.prompt.match(/(\d{1,2})(?:am|pm)?\s*[-–to]+\s*(\d{1,2})(?:am|pm)?/i)
    const workHours = workHourMatch
      ? { start: parseTime(workHourMatch[1]), end: parseTime(workHourMatch[2]) }
      : { start: '09:00', end: '17:00' }

    const energyPeak = body.prompt.toLowerCase().includes('morning person') ||
      body.prompt.toLowerCase().includes('morning')
      ? 'morning'
      : body.prompt.toLowerCase().includes('evening') || body.prompt.toLowerCase().includes('night')
      ? 'evening'
      : 'morning'

    const plan = await generateDayPlan({
      workHours,
      tasks: body.tasks ?? [],
      preferences: body.prompt,
      energyPeak,
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('[AI Plan]', error)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}

function parseTime(hour: string): string {
  const h = parseInt(hour, 10)
  return `${h.toString().padStart(2, '0')}:00`
}
