/** Seasons as shown in Figma "HyprEarn Points Modal" (944:2905). */
export const POINTS_SEASONS = [
  {
    id: "s1",
    title: "Season 1 Points",
    status: "Active",
    active: true,
    description: ["Started on 23rd March, 00:00:00 UTC", "Coins are distributed every Monday"],
  },
  { id: "s2", title: "Season 2 Points", status: "Coming Soon", active: false, description: ["Stay tuned!"] },
  { id: "s3", title: "Season 3 Points", status: "Coming Soon", active: false, description: ["Stay tuned!"] },
];

export function formatPoints(value) {
  if (!value) return "0";
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
