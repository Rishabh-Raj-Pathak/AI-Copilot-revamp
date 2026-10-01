import BottomSheet from "../BottomSheet.jsx";
import ConnectionsCard from "../../profile/ConnectionsCard.jsx";
import ProfileChecklistCard from "../../profile/ProfileChecklistCard.jsx";
import ProfileIdentityCard from "../../profile/ProfileIdentityCard.jsx";
import { useProfile } from "../../profile/ProfileContext.jsx";

/**
 * The desktop "Points overview" profile (identity ring, checklist, connections)
 * kept reachable on the phone. Desktop picks it from a dropdown in the title
 * bar; the phone opens it as a full-height sheet from the nav bar so the Figma
 * profile screen stays exactly as drawn.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(message: string, variant?: 'success'|'error') => void} props.onNotify
 */
export default function PointsOverviewSheet({ open, onClose, onNotify }) {
  const { progress } = useProfile();
  return (
    <BottomSheet open={open} onClose={onClose} title="Points overview" fullHeight>
      <div className="flex flex-col gap-4 px-4 py-4">
        <ProfileIdentityCard onNotify={onNotify} />
        <ProfileChecklistCard onNotify={onNotify} />
        {/* Same rule as desktop: until the checklist is done it hosts the
            connect steps itself, so the card would duplicate them. */}
        {progress.isComplete ? <ConnectionsCard onNotify={onNotify} /> : null}
      </div>
    </BottomSheet>
  );
}
