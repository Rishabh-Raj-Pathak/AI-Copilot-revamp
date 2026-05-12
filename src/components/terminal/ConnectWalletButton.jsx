import { terminalConnectWallet } from '../../design-system/tokens/terminalConnectWallet'

/**
 * Navbar CTA when no wallet session — opens your connect flow (`onConnect`).
 * Styling is design-system driven (Figma Terminal `1017:35291`).
 */
export default function ConnectWalletButton({ onConnect }) {
  return (
    <button
      type="button"
      className={terminalConnectWallet.componentClassName}
      onClick={onConnect}
    >
      Connect Wallet
    </button>
  )
}
