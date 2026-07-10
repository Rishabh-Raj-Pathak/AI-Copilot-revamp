import { truncateAddress } from "../../lib/wallet.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileProgressRing from "./ProfileProgressRing.jsx";
import { TelegramGlyph, XGlyph } from "./SocialGlyphs.jsx";
import { useProfile } from "./ProfileContext.jsx";

/** Identity strip: who you are, how far along, what you've earned. */
export default function ProfileHeaderCard() {
  const { address, socials, social, progress } = useProfile();
  const displayName = social?.name ?? truncateAddress(address);

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <ProfileProgressRing percent={progress.percent} size={68} strokeWidth={2.5}>
        <ProfileAvatar
          name={social?.name}
          handle={social?.handle}
          seed={address}
          size="lg"
        />
      </ProfileProgressRing>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="truncate text-lg font-semibold text-white">
          {displayName}
        </h2>
        {social ? (
          /* One glyph per linked account, then the handle they're known by. */
          <span className="flex items-center gap-1.5 text-sm text-[#929292]">
            {socials.x ? <XGlyph className="size-3" /> : null}
            {socials.telegram ? <TelegramGlyph className="size-3.5" /> : null}
            <span className="truncate">{social.handle}</span>
          </span>
        ) : (
          <span className="text-sm text-[#757575]">No account linked yet</span>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="bg-linear-to-r from-[#f7bb08] to-[#2fffce] bg-clip-text text-xl font-semibold text-transparent">
          {progress.points}
        </span>
        <span className="text-xs text-[#757575]">
          of {progress.pointsTotal} points
        </span>
      </div>
    </section>
  );
}
