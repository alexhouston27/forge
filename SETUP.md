# FORGE — Setup Guide

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
cd forge
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
```
Then fill in `.env.local` with your Supabase and OpenAI credentials.

### 3. Set up Supabase

1. Create a project at supabase.com
2. Copy your project URL and anon key to `.env.local`
3. Copy the database connection strings to `.env.local`

### 4. Set up the database
```bash
# Push schema to Supabase
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Run the app
```bash
npm run dev
```

Visit http://localhost:3000 → redirects to `/today`

---

## Demo Mode (no Supabase needed)

The app ships with full demo data baked in (`src/lib/demo-data.ts`).
All pages work without a database — perfect for exploring the UI.

---

## What's built

| Module | Status | Features |
|--------|--------|---------|
| Today Dashboard | ✅ | Focus, tasks, habits, mood, timeline, AI plan button |
| Goals | ✅ | Goal cards, milestones, category filter, progress bars |
| Habits | ✅ | Check-off, streaks, heatmap, analytics |
| AI Planner | ✅ | GPT-4 schedule generation, time blocks, mock fallback |
| Vault | ✅ | Notes/ideas, search, tags, pin/favorite, editor |
| Journal | ✅ | Daily review, weekly review, free write, day score |
| Analytics | ✅ | Charts, life momentum score, gamification/XP |
| Command Palette | ✅ | ⌘K, search, navigation, quick actions |
| Quick Capture | ✅ | Task/note/idea capture modal |
| Focus Mode | ✅ | Toggle sidebar + header off |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette |
| `⌘T` | Quick capture task |
| `⌘I` | Quick capture idea |
| `⌘F` | Toggle focus mode |
| `⌘\` | Toggle sidebar |
| `⌘1-7` | Navigate to page |

## Architecture

```
forge/
├── prisma/                    # Database schema + seed
│   └── schema.prisma          # Full relational schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (app)/             # Authenticated app layout
│   │   ├── (auth)/            # Login/signup pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Sidebar, Header, CommandPalette
│   │   ├── today/             # Today dashboard components
│   │   ├── goals/             # Goals module
│   │   ├── habits/            # Habits module + heatmap
│   │   ├── planner/           # AI Planner
│   │   ├── vault/             # Idea Vault
│   │   ├── journal/           # Journal + reflection
│   │   ├── analytics/         # Analytics + charts
│   │   └── shared/            # Reusable across modules
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Supabase, Prisma, OpenAI, utils
│   ├── store/                 # Zustand global state
│   └── types/                 # TypeScript types
```

## Phase 6: Venture-Scale Roadmap

### 6-month milestones

**Month 1-2: Foundation**
- Supabase auth (magic link + Google OAuth)
- Mobile-responsive layout
- Core data persistence (replace demo data)
- Email onboarding sequences

**Month 3-4: Growth**
- Public launch (ProductHunt, Twitter/X)
- Team/shared goals feature
- Mobile app (React Native or Expo)
- Stripe billing: Free → Pro ($12/mo) → Team ($25/seat)

**Month 5-6: Intelligence**
- GPT-4 daily coaching & insights
- Pattern recognition ("you complete more tasks on Tuesdays")
- Smart habit suggestions based on goals
- Weekly AI report card

### Monetization model

| Tier | Price | Features |
|------|-------|---------|
| Free | $0 | 3 goals, 5 habits, 7-day history |
| Pro | $12/mo | Unlimited + AI planner + analytics |
| Team | $25/seat | Shared goals + team accountability |
| Coach | $49/mo | White-label + client management |

### Distribution strategy
1. **Build-in-public** on Twitter/X (document the build)
2. **ProductHunt** launch (time with 1.0 feature completeness)
3. **Newsletter sponsorships** (productivity/founder newsletters)
4. **Referral program** with XP bonuses for both parties
5. **Affiliate program** for coaches and accountability partners

### Moat
- Data network effects: the longer you use FORGE, the more personalized it becomes
- Habit/goal history is switching cost (high data stickiness)
- AI personalization improves with usage
- Community accountability features create retention loops
