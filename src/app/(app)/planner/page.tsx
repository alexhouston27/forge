import { Metadata } from 'next'
import { PlannerView } from '@/components/planner/PlannerView'

export const metadata: Metadata = { title: 'AI Planner' }

export default function PlannerPage() {
  return <PlannerView />
}
