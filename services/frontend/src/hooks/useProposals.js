import { useContext, useMemo } from 'react'
import { SettingsContext, StoreContext } from '../contexts'

export const useProposals = () => {
  const [store] = useContext(StoreContext)
  const [settings] = useContext(SettingsContext)

  const proposals = useMemo(() => {
    if (!store.proposals) return []
    if (!settings.filters.healOnly) return store.proposals
    return store.proposals.filter((p) => p.healStudy === 'YES')
  }, [store.proposals, settings.filters.healOnly])

  return proposals
}
