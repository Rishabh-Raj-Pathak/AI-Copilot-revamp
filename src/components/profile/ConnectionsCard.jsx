import ConnectSocialStep from "./ConnectSocialStep.jsx";
import { useProfile } from "./ProfileContext.jsx";

/**
 * Permanent home for the social links once the checklist has collapsed. Shares
 * `ConnectSocialStep` with the checklist, so adding an account behaves
 * identically in both places.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ConnectionsCard({ onNotify }) {
  const { socials, connectSocial } = useProfile();

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <h2 className="text-base font-semibold text-white">Connections</h2>
      <p className="mt-1 text-sm text-[#929292]">
        Link both if you like — X powers setup sharing and referrals, Telegram
        delivers liquidation and agent alerts.
      </p>

      <div className="mt-4">
        <ConnectSocialStep
          socials={socials}
          onConnect={connectSocial}
          onNotify={onNotify}
        />
      </div>
    </section>
  );
}
