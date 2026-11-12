import type { Project } from '@/content/schema'
import LedgerVisual from './LedgerVisual'
import PayrollVisual from './PayrollVisual'
import RouteVisual from './RouteVisual'

/** The full interactive illustration for an internal project (case-study pages). */
export function InternalVisual({ project, standalone = false }: { project: Project; standalone?: boolean }) {
  if (project.visual === 'ledger') return <LedgerVisual example={project.illustrativeExample} />
  if (project.visual === 'payroll') return <PayrollVisual standalone={standalone} />
  if (project.visual === 'route') return <RouteVisual standalone={standalone} />
  return null
}

/** Particle scene that matches an internal project's illustration. */
export const SCENE_FOR = { ledger: 'ledger', payroll: 'clock', route: 'route', none: undefined } as const
