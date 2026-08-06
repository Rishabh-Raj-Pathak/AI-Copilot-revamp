import ConnectSocialStep from "./ConnectSocialStep.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { SOCIAL_PROVIDER_ORDER } from "./profileSteps.js";

/**
 * Permanent home for the social links once the checklist has collapsed. Shares
 * `ConnectSocialStep` with the checklist, so a connection behaves identically in
 * both places — and renders the same rows in the same order, since the checklist
 * step ids double as provider ids.
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
          Telegram delivers liquidation and agent alerts; X posts your PnL cards
          and carries your referrals.
        </p>
      </header>

      {/* The same measure the checklist gives the steps this card grew out of. */}
      <div className="mt-4 flex max-w-2xl flex-col gap-2 sm:mt-5">
        {SOCIAL_PROVIDER_ORDER.map((id) => (
          <ConnectSocialStep
            key={id}
            provider={id}
            account={socials[id]}
            onConnect={connectSocial}
            onNotify={onNotify}
          />
        ))}
      </div>
    </section>
  );
}
