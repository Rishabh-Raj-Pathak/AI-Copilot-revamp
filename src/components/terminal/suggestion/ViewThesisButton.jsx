import { ScanSearch } from 'lucide-react'
import { terminalViewThesisButton } from '../../../design-system/tokens/terminalViewThesis'

export default function ViewThesisButton({ onClick, dataTour, className = '' }) {
  return (
    <button
      type="button"
      className={`${terminalViewThesisButton.componentClassName} ${className}`.trim()}
      onClick={onClick}
      {...(dataTour ? { "data-tour": dataTour } : {})}
    >
      <ScanSearch
        aria-hidden
        size={terminalViewThesisButton.iconSizePx}
        strokeWidth={terminalViewThesisButton.iconStrokeWidth}
        className="shrink-0"
      />
      Backtest
    </button>
  )
}
