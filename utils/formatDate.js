// utils/formatDate.js
// Human-readable date/time formatting with dayjs
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Examples:
// formatDate('2025-08-21T16:21:09.314Z') => "Aug 21, 2025, 9:51 PM"
// fromNow('2025-08-21T16:21:09.314Z')    => "in 2 days" / "3 hours ago"

export function formatDate(value, fallback = "-") {
  if (!value) return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY, H:MM") : fallback;
}

export function fromNow(value, fallback = "-") {
  if (!value) return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.fromNow() : fallback;
}
