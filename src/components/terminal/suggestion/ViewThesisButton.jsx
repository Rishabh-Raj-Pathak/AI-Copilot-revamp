import { File } from 'lucide-react'
import { terminalViewThesisButton } from '../../../design-system/tokens/terminalViewThesis'

export default function ViewThesisButton({ onClick, dataTour }) {
  return (
    <button
      type="button"
      className={terminalViewThesisButton.componentClassName}
      onClick={onClick}
      {...(dataTour ? { "data-tour": dataTour } : {})}
    >
      <File
        aria-hidden
        size={terminalViewThesisButton.iconSizePx}
        strokeWidth={terminalViewThesisButton.iconStrokeWidth}
        className="shrink-0"
      />
      View Thesis
    </button>
  )
}
