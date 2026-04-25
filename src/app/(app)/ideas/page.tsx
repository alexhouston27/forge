import { redirect } from 'next/navigation'

// /ideas is the public-facing alias for the Vault module
export default function IdeasPage() {
  redirect('/vault')
}
