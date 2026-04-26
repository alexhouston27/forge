import Anthropic from '@anthropic-ai/sdk'
import type { AIScheduleRequest, AIScheduleResponse, TimeBlockItem } from '@/types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
  }
  return _client
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

Return ONLY a valid JSON object with this exact shape (no markdown, no explanation):
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
- If user mentions a work shift (e.g. "work 4-10pm"), block the ENTIRE shift and don't put tasks inside it`

  const userMessage = `User's day description: "${request.preferences}"

Energy peak: ${request.energyPeak ?? 'morning'}

Tasks to fit into free time:
${taskList}`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    console.error('[Claude AI] ANTHROPIC_API_KEY is not set')
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const raw = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(raw) as AIScheduleResponse
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
