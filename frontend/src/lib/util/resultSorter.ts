import type { Result } from '@/lib/types'

export function getSortedResults(results: Result[], selectedModel?: string): Result[] {
  if (!selectedModel) return results

  const selected = results.find(r => r.model === selectedModel)
  if (!selected) return results

  const others = results.filter(r => r.model !== selectedModel)
  return [selected, ...others]
}