import OpenAI from 'openai'
import type { AIScheduleRequest, AIScheduleResponse, TimeBlockItem } from '@/types'

let _openai: OpenAI | null = null
function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' })
  }
  return _openai
}

export async function generateDayPlan(request: AIScheduleRequest): Promise<AIScheduleResponse> {
  const taskList = request.tasks.length > 0
    ? request.tasks
        .map(t => `- ${t.title} (priority: ${t.priority}, est: ${t.estimatedMinutes ?? 30}min)`)
        .join('\n')
    : '(no specific tasks — suggest a productive structure)'

  const systemPrompt = `You are FORGE AI, a personal schedule optimizer. Your job is to build a realistic, optimized daily schedule.

MOST IMPORTANT RULE: The user's message may contain fixed commitments — specific appointments, events, work shifts, errands, or meetings at set times (e.g. "haircut at 12", "work at 4pm", "meeting at 2:30"). These are IMMOVABLE. You MUST include them as time blocks at EXACTLY the times mentioned, and NEVER schedule anything else during those windows.

Step 1 — Extract every fixed event from the user's message and lock them in.
Step 2 — Fill remaining free time with the user's tasks and healthy structure (deep work, breaks, etc).
Step 3 — Respect energy peak: put cognitively demanding work during peak hours.

Return a JSON object with this exact shape:
{
  "mainFocus": "One sentence describing the most important mission for today",
  "timeBlocks": [
    {
      "title": "Block name",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "category": "WORK|HEALTH|LEARNING|BREAK|PERSONAL|APPOINTMENT",
      "color": "#hex"
    }
  ],
  "priorities": ["Top priority 1", "Top priority 2", "Top priority 3"],
  "insights": ["A specific scheduling insight", "An energy tip", "A focus recommendation"]
}

Color guide: WORK=#6366f1, APPOINTMENT=#ec4899, HEALTH=#10b981, LEARNING=#8b5cf6, BREAK=#f59e0b, PERSONAL=#3b82f6

Additional rules:
- Use 24-hour HH:MM format for all times
- Add a 15-min buffer before appointments for travel/prep
- Include a break every 90 minutes of focused work
- Don't overschedule — keep it realistic and achievable
- If user mentions they work a shift (e.g. "work 4-10pm"), block the ENTIRE shift and don't put tasks inside it`

  const userMessage = `User's day description: "${request.preferences}"

Energy peak: ${request.energyPeak ?? 'morning'}

Tasks to fit into free time:
${taskList}`

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('No response from AI')

    const parsed = JSON.parse(content) as AIScheduleResponse
    return parsed
  } catch (error) {
    console.error('[OpenAI]', error)
    return generateMockSchedule(request)
  }
}

function generateMockSchedule(request: AIScheduleRequest): AIScheduleResponse {
  const { tasks } = request
  const timeBlocks: Omit<TimeBlockItem, 'id' | 'dailyPlanId'>[] = []

  timeBlocks.push({ title: 'Morning Routine', startTime: '07:00', endTime: '08:00', category: 'PERSONAL', color: '#10b981', isCompleted: false })
  timeBlocks.push({ title: tasks[0]?.title ?? 'Deep Work', startTime: '08:00', endTime: '09:30', category: 'WORK', color: '#6366f1', isCompleted: false })
  timeBlocks.push({ title: 'Break', startTime: '09:30', endTime: '09:45', category: 'BREAK', color: '#f59e0b', isCompleted: false })
  if (tasks[1]) {
    timeBlocks.push({ title: tasks[1].title, startTime: '09:45', endTime: '11:15', category: 'WORK', color: '#6366f1', isCompleted: false })
  }
  timeBlocks.push({ title: 'Lunch', startTime: '12:00', endTime: '13:00', category: 'BREAK', color: '#f59e0b', isCompleted: false })
  if (tasks[2]) {
    timeBlocks.push({ title: tasks[2].title, startTime: '13:00', endTime: '14:30', category: 'WORK', color: '#6366f1', isCompleted: false })
  }
  timeBlocks.push({ title: 'Workout', startTime: '17:30', endTime: '18:30', category: 'HEALTH', color: '#10b981', isCompleted: false })
  timeBlocks.push({ title: 'Evening Review', startTime: '21:00', endTime: '21:30', category: 'PERSONAL', color: '#8b5cf6', isCompleted: false })

  return {
    mainFocus: tasks[0] ? `Focus on: ${tasks[0].title}` : 'Execute your most important priorities',
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

void addHours

export { getClient as getOpenAIClient }
