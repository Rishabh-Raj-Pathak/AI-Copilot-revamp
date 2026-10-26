import { useState } from 'react'
import { Configure } from './Configure'
import { Dashboard, SignedOut, type DashboardView } from './Dashboard'
import { IconInfo, PageSwitch, Popover, PopoverContent, PopoverTrigger } from './ui'
import { useMarketMaking } from './useMarketMaking'

/*
 * The Market Making page on desktop, cloned from production (app.hyprearn.com/
 * market-making): the header block, the Configure / Dashboard switch and both
 * screens. State and actions live in `useMarketMaking`, shared with the phone.
 *
 * `signedIn` is the prototype's wallet connection; `onLogin` connects it.
 */

const SUBHEAD = [
  'Run a market making agent on autopilot. Maker orders keep fees low, you earn the spread, no directional bets.',
]
const VIEWS = [
  { id: 'configure', label: 'Configure' },
  { id: 'dashboard', label: 'Dashboard' },
] as const
type Tab = (typeof VIEWS)[number]['id']

export function MarketMakingApp({ signedIn, onLogin }: { signedIn: boolean; onLogin: () => void }) {
  const mm = useMarketMaking({ signedIn, onLogin })
  // Production opens on the dashboard for someone with agents, else on configure
  const [tab, setTab] = useState<Tab>(signedIn && mm.hasAgents ? 'dashboard' : 'configure')
  const [view, setView] = useState<DashboardView>({ kind: 'list' })

  const showAgent = (id: string) => {
    setView({ kind: 'strategy', id })
    setTab('dashboard')
  }

  return (
    <div className="mm-lh flex flex-col gap-4">
      <section className="mb-2 flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-6">
        <div>
          <h1 className="w-fit bg-gradient-to-b from-[#ffffff] via-[#e8d5b5] to-[#785a28] bg-clip-text pb-[0.12em] text-[46px] font-bold leading-[1.05] tracking-[-0.03em] text-transparent sm:text-[58px]">
            Market Making
          </h1>
          <div className="mt-1.5 max-w-[640px] space-y-0.5">
            {SUBHEAD.map((line) => (
              <p key={line} className="text-[14px] leading-[22px] text-[#8f90a1]">
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-2">
          <PageSwitch
            ariaLabel="Market Making view"
            options={[...VIEWS]}
            value={tab}
            onChange={(t) => {
              if (t === 'dashboard') setView({ kind: 'list' })
              setTab(t)
            }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="About Market Making"
                className="text-[#717182] transition-colors hover:text-[#ccb17f] focus-visible:text-[#ccb17f] focus-visible:outline-none"
              >
                <IconInfo className="h-[18px] w-[18px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[300px] border-[rgba(146,111,56,0.45)] bg-[linear-gradient(180deg,rgba(14,12,10,0.98)_0%,rgba(8,8,8,0.98)_100%)] p-3.5 text-[11px] leading-relaxed text-[#9c9cac]"
            >
              Two sided quoting on a single perp DEX, from your own account. Non custodial. Runs on HyprEarn infra, not in your
              browser.
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {tab === 'configure' && (
        <Configure
          config={mm.config}
          onConfigChange={mm.setConfig}
          overview={mm.overview}
          dex={mm.dex}
          editing={mm.editing}
          isSubmitting={mm.pending === 'create' || mm.pending === 'update'}
          submitError={null}
          onSubmit={async () => {
            const id = await mm.submit()
            if (id) showAgent(id)
          }}
          onCancelEdit={() => {
            const was = mm.editing
            mm.resetForm()
            if (was) showAgent(was.id)
          }}
          marginTouched={mm.marginTouched}
        />
      )}

      {tab === 'dashboard' && !signedIn && <SignedOut onLogin={onLogin} />}

      {tab === 'dashboard' && signedIn && (
        <Dashboard
          view={view}
          onViewChange={setView}
          active={mm.active}
          completed={mm.completed}
          totals={mm.totals}
          detailFor={mm.getDetail}
          pending={mm.pending}
          onNewStrategy={() => {
            mm.resetForm(true)
            setTab('configure')
          }}
          onEditStrategy={(a) => {
            mm.edit(a)
            setTab('configure')
          }}
          onToggleRun={async (a) => {
            await mm.toggleRun(a)
          }}
          onDeactivate={mm.deactivate}
        />
      )}
    </div>
  )
}
