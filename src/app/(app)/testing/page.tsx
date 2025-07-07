import { type Metadata } from 'next'
import { TestingSection } from '@/components/testing-section'

export const metadata: Metadata = {
  title: 'Testing',
  description: 'Test and experiment with Neura-Code features and functionality.',
}

export default async function TestingPage() {
  return <TestingSection />
} 