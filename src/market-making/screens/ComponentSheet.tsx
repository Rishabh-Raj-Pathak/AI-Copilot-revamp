import { useState } from 'react'
import {
  Badge,
  DerivedLine,
  GhostButton,
  GoldButton,
  GradientButton,
  IconChevron,
  MoneyInput,
  Panel,
  Radio,
  RiskChip,
  SelectCard,
  Segmented,
  StatCard,
  StatusPill,
  StrategyGlyph,
  Toggle,
  VenueGlyph,
  WarnBlock,
  type Status,
} from '../components/ui/primitives'
import { Slider } from '../components/ui/Slider'

const REUSED = [
  ['Page shell and top nav', 'Logo, nav pills, venue selector, points chip, Deposit CTA, wallet chip.'],
  ['Page title block', 'Gradient title, two line grey subhead, info icon at top right.'],
  ['Stat card', 'Uppercase label, large cream value, muted one line descriptor.'],
  ['Outer config panel', 'Diagonal near black gradient, hairline border, 20px radius.'],
  ['Labelled section', 'Micro tan label with optional info tip, nested inside the outer panel.'],
  ['Market picker', 'Categories and Tokens tabs, category grid, token rows.'],
  ['Margin block', 'Recessed money input, gold slider, derived read-out line.'],
  ['Leverage block', 'Slider with buying power beside it, Cross and Isolated cards.'],
  ['Primary CTA', 'Full width yellow to green gradient, Deposit and Swap style.'],
]

const EXTENDED = [
  ['DEX card', 'Cut from two cards to one, and the venue list now carries per venue logos and a live or offline dot.'],
  ['Token rows', 'Added a 24h volume column, sorted by volume. Volume decides cost so it stays visible.'],
  ['Margin derived line', 'Now states balance loading and venue rate limiting inline instead of a stale zero.'],
  ['Margin mode cards', 'An unsupported mode stays visible but disabled, with the venue reason shown.'],
  ['Slider', 'Gained clickable tick presets under the track.'],
  ['Perp and Spot toggle', 'Dropped from the venue selector. The shell carries the venue and nothing else.'],
  ['Stat card', 'Optional info tip in the label row, used by CPM.'],
]

const NEW = [
  ['Venue selector shell', 'One full width control. Live dot, venue mark, name and chevron.'],
  ['Connected account block', 'Balance sits beside Deposit and Change wallet on one row, in a single green tinted component.'],
  ['Venue glyphs', 'A distinct geometric mark per venue, drawn in that venue tint.'],
  ['Strategy card grid', 'Icon, name, optional gold badge, one line of behaviour. Gold outline when active.'],
  ['Cut-off block', 'Toggle, money input, slider, plain English consequence, warning block when switched off.'],
  ['Duration block', 'Toggle, min and hr switch, number input, slider with 1h to 7d presets.'],
  ['Expected volume block', 'Range with an Estimate badge and an expandable input breakdown.'],
  ['Status pill', 'Standby, Active, Paused, Ended. Same green dot language as the balance rows.'],
  ['Account card', 'Large equity figure, breadcrumb, risk chips for cut-off, auto stop and buying power.'],
  ['Strategy status card', 'Status pill, plain English line, six live run counters.'],
  ['Activity feed', 'Fills, funding and guard triggers, newest first, timestamped.'],
  ['Position tables', 'Open positions with a reason based empty state. History rows expand to fills.'],
]

export function ComponentSheet() {
  const [seg, setSeg] = useState<'perp' | 'spot'>('perp')
  const [card, setCard] = useState('adaptive')
  const [on, setOn] = useState(true)
  const [slider, setSlider] = useState(38)
  const [money, setMoney] = useState(500)

  return (
    <div className="space-y-4">
      <Panel className="space-y-6">
        <Group title="Stat cards">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total Volume" value="$18.4M" descriptor="Volume generated" />
            <StatCard label="Avg CPM" value="$118.20" descriptor="Execution cost" />
            <StatCard
              label="Maker Share"
              value="94.2%"
              descriptor="Fills from resting orders"
              tip="Share of fills that rested on the book instead of crossing the spread."
            />
          </div>
        </Group>

        <Group title="Venue selector shell">
          <div className="max-w-[420px]">
            <div
              className="flex w-full items-center gap-3 rounded-[12px] border border-white/[0.08] bg-mm-recessed px-4 py-3.5"
              style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
            >
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-mm-pos" />
              <VenueGlyph id="hyperliquid" tint="#4ade80" />
              <span className="truncate text-[15px] font-medium text-mm-ink-1">Hyperliquid</span>
              <IconChevron className="ml-auto shrink-0 text-mm-ink-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {[
              ['hyperliquid', '#4ade80'],
              ['pacifica', '#8ab4f8'],
              ['nado', '#e8d5b5'],
              ['avantis', '#b39ddb'],
              ['zklighter', '#7fd1c8'],
              ['lighter', '#f0ddb9'],
            ].map(([id, tint]) => (
              <VenueGlyph key={id} id={id} tint={tint} />
            ))}
          </div>
        </Group>

        <Group title="Segmented controls, badges and status">
          <div className="flex flex-wrap items-center gap-4">
            <Segmented
              size="sm"
              options={[
                { id: 'perp', label: 'Categories' },
                { id: 'spot', label: 'Tokens' },
              ]}
              value={seg}
              onChange={setSeg}
            />
            <Badge>Recommended</Badge>
            <Badge>Max Volume</Badge>
            <Badge tone="muted">Estimate</Badge>
            <Radio active />
            <Radio active={false} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {(['Standby', 'Active', 'Paused', 'Ended'] as Status[]).map((s) => (
              <StatusPill key={s} status={s} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <RiskChip label="Cut-off" value="$20 below start" />
            <RiskChip label="Auto stop" value="11h 42m" />
            <RiskChip label="Buying power" value="$2,000" />
          </div>
        </Group>

        <Group title="Strategy cards">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: 'adaptive', name: 'Dynamic', badge: 'Recommended', line: 'Quotes both sides. Widens on volatility.' },
              { id: 'tight', name: 'Aggressive', badge: 'Max Volume', line: 'Quotes at the top of the book.' },
            ].map((s) => (
              <SelectCard key={s.id} active={card === s.id} onClick={() => setCard(s.id)}>
                <div className="flex items-start gap-3">
                  <span className={card === s.id ? 'mt-0.5 text-mm-gold-300' : 'mt-0.5 text-mm-ink-4'}>
                    <StrategyGlyph id={s.id} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={card === s.id ? 'text-[14px] font-semibold text-mm-gold-100' : 'text-[14px] font-semibold text-mm-ink-2'}>
                        {s.name}
                      </span>
                      <Badge>{s.badge}</Badge>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[18px] text-mm-ink-5">{s.line}</p>
                  </div>
                </div>
              </SelectCard>
            ))}
          </div>
        </Group>

        <Group title="Inputs, sliders with ticks and derived lines">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start lg:gap-6">
            <MoneyInput ariaLabel="Demo" value={money} onChange={setMoney} max={2840} onMax={() => setMoney(2840)} />
            <div className="pt-1">
              <Slider
                ariaLabel="Demo slider"
                min={0}
                max={100}
                value={slider}
                onChange={setSlider}
                ticks={[
                  { value: 0, label: '$0' },
                  { value: 25, label: '$710' },
                  { value: 50, label: '$1.4K' },
                  { value: 75, label: '$2.1K' },
                  { value: 100, label: '$2.8K' },
                ]}
              />
            </div>
          </div>
          <div className="mt-4">
            <DerivedLine>
              margin · balance $2,840.53 · × 4x = <span className="text-mm-ink-2">$2,000.00 buying power</span>
            </DerivedLine>
          </div>
        </Group>

        <Group title="Toggles, warnings and buttons">
          <div className="flex flex-wrap items-center gap-6">
            <Toggle id="sheet-toggle" label="Stop and flatten on a drawdown" checked={on} onChange={setOn} />
            <GoldButton>Connect DEX</GoldButton>
            <GoldButton>Deposit</GoldButton>
            <button type="button" className="text-[12px] font-medium text-mm-neg hover:opacity-80">
              Change wallet
            </button>
          </div>
          <div className="mt-4">
            <WarnBlock>
              No drawdown floor is set. Only the inventory cap and a manual pause protect this run.
            </WarnBlock>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <GradientButton className="sm:flex-1">Start Market Making</GradientButton>
            <GradientButton disabled className="sm:flex-1">
              Start Market Making
            </GradientButton>
            <GhostButton className="sm:w-[160px]">Configure</GhostButton>
          </div>
        </Group>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-3">
        <ReuseList title="Reused unchanged" rows={REUSED} tone="muted" />
        <ReuseList title="Extended" rows={EXTENDED} tone="gold" />
        <ReuseList title="New" rows={NEW} tone="gold" />
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mm-micro mb-4">{title}</h3>
      {children}
    </section>
  )
}

function ReuseList({
  title,
  rows,
  tone,
}: {
  title: string
  rows: string[][]
  tone: 'gold' | 'muted'
}) {
  return (
    <Panel>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="mm-micro">{title}</h3>
        <Badge tone={tone}>{rows.length}</Badge>
      </div>
      <ul className="space-y-3">
        {rows.map(([name, note]) => (
          <li key={name}>
            <div className="text-[13px] font-medium text-mm-ink-1">{name}</div>
            <div className="mt-0.5 text-[12px] leading-[18px] text-mm-ink-5">{note}</div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
