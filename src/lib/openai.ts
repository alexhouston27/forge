import OpenAI from 'openai'
import type { AIScheduleRequest, AIScheduleResponse, TimeBlockItem } from '@/types'

// Lazy singleton — only instantiated when actually called so the build
// doesn't fail when OPENAI_API_KEY is absent from the environment.
let _openai: OpenAI | null = null
function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' })
  }
  return _openai
}

export async function generateDayPlan(request: AIScheduleRequest): Promise<AIScheduleResponse> {
  const taskList = request.tasks
    .map(t => `- ${t.title} (priority: ${t.priority}, energy: ${t.energy ?? 'MEDIUM'}, est: ${t.estimatedMinutes ?? 30}min)`)
    .join('\n')

  const prompt = `You are FORGE AI, an intelligent life optimizer. Generate an optimized daily schedule.

Work hours: ${request.workHours.start} - ${request.workHours.end}
User's context: ${request.preferences}
Energy peak: ${request.energyPeak ?? 'morning'}

Tasks to schedule:
${taskList}

Generate a JSON response with this exact structure:
{
  "mainFocus": "One sentence main mission for the day",
  "timeBlocks": [
    {
      "title": "Block title",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "category": "WORK|HEALTH|LEARNING|BREAK|PERSONAL",
      "color": "#hex"
    }
  ],
  "priorities": ["Priority 1", "Priority 2", "Priority 3"],
  "insights": ["Insight about the schedule", "Energy tip", "Focus recommendation"]
}

Rules:
- Schedule high-energy tasks during energy peak
- Include breaks every 90 minutes
- Batch similar tasks
- Reserve morning for deep work if energy peak is morning
- Keep it realistic and achievable
- Use 24-hour time format`

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No response from AI')

    const parsed = JSON.parse(content) as AIScheduleResponse
    return parsed
  } catch (error) {
    // Fallback to mock schedule if OpenAI fails
    return generateMockSchedule(request)
  }
}

// Mock AI for development / when API key is not set
function generateMockSchedule(request: AIScheduleRequest): AIScheduleResponse {
  const { workHours, tasks } = request
  const timeBlocks: Omit<TimeBlockItem, 'id' | 'dailyPlanId'>[] = []

  // Morning routine
  timeBlocks.push({
    title: 'Morning Routine',
    startTime: '07:00',
    endTime: '08:00',
    category: 'PERSONAL',
    color: '#10b981',
    isCompleted: false,
  })

  // Deep work block
  timeBlocks.push({
    title: tasks[0]?.title ?? 'Deep Work',
    startTime: workHours.start,
    endTime: addHours(workHours.start, 1.5),
    category: 'WORK',
    color: '#6366f1',
    isCompleted: false,
  })

  // Break
  timeBlocks.push({
    title: 'Break',
    startTime: addHours(workHours.start, 1.5),
    endTime: addHours(workHours.start, 1.75),
    category: 'BREAK',
    color: '#f59e0b',
    isCompleted: false,
  })

  // Second work block
  if (tasks[1]) {
    timeBlocks.push({
      title: tasks[1].title,
      startTime: addHours(workHours.start, 1.75),
      endTime: addHours(workHours.start, 3.25),
      category: 'WORK',
      color: '#6366f1',
      isCompleted: false,
    })
  }

  // Workout
  timeBlocks.push({
    title: 'Workout',
    startTime: '17:30',
    endTime: '18:30',
    category: 'HEALTH',
    color: '#10b981',
    isCompleted: false,
  })

  // Evening wind-down
  timeBlocks.push({
    title: 'Evening Review',
    startTime: '21:00',
    endTime: '21:30',
    category: 'PERSONAL',
    color: '#8b5cf6',
    isCompleted: false,
  })

  return {
    mainFocus: tasks[0] ? `Ship ${tasks[0].title} with full focus` : 'Execute your most important priorities',
    timeBlocks,
    priorities: tasks.slice(0, 3).map(t => t.title),
    insights: [
      'Schedule deep work during your morning energy peak',
      'Take a 15-min break after every 90 minutes of focused work',
      'Batch low-energy tasks in the afternoon',
    ],
  }
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hours * 60
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
}

export { getClient as getOpenAIClient }
