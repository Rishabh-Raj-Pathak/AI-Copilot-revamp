import ConnectSocialStep from "./ConnectSocialStep.jsx";
import { useProfile } from "./ProfileContext.jsx";

/**
 * Permanent home for the social link once the checklist has collapsed. Shares
 * `ConnectSocialStep` with the checklist, so switch/disconnect behave identically
 * in both places.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ConnectionsCard({ onNotify }) {
  const { social, connectSocial, disconnectSocial } = useProfile();

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <h2 className="text-base font-semibold text-white">Connections</h2>
      <p className="mt-1 text-sm text-[#929292]">
        One account at a time. X powers setup sharing and referrals; Telegram
        delivers liquidation and agent alerts.
      </p>

      <div className="mt-4">
        <ConnectSocialStep
          social={social}
          onConnect={connectSocial}
          onDisconnect={disconnectSocial}
          onNotify={onNotify}
        />
      </div>
    </section>
  );
}
