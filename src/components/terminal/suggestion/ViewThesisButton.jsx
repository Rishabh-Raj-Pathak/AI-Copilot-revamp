import { File } from 'lucide-react'
import { terminalViewThesisButton } from '../../../design-system/tokens/terminalViewThesis'

export default function ViewThesisButton({ onClick }) {
  return (
    <button
      type="button"
      className={terminalViewThesisButton.componentClassName}
      onClick={onClick}
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
