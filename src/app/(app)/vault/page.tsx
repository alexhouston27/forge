import { Metadata } from 'next'
import { VaultView } from '@/components/vault/VaultView'

export const metadata: Metadata = { title: 'Idea Vault' }

export default function VaultPage() {
  return <VaultView />
}
