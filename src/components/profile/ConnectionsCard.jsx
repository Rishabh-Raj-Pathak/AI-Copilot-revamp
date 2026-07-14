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
    /* Same header band as the checklist it replaces: title on the card's left
       edge, accounts starting under it. The two cards stack, so they had better
       share one set of edges. */
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="border-b border-[#242424] pb-3.5 sm:pb-4">
        <h2 className="text-base font-semibold text-white">Connections</h2>
        <p className="mt-1 max-w-2xl text-sm text-[#929292]">
          Link both if you like — X powers setup sharing and referrals, Telegram
          delivers liquidation and agent alerts.
        </p>
      </header>

      {/* The same measure the checklist gives the step this card grew out of. */}
      <div className="mt-4 max-w-2xl sm:mt-5">
        <ConnectSocialStep
          socials={socials}
          onConnect={connectSocial}
          onNotify={onNotify}
        />
      </div>
    </section>
  );
}
