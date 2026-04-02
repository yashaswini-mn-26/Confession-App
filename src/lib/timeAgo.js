// src/lib/timeAgo.js
export function timeAgo(ts) {
  if (!ts) return "just now";
  const ms  = typeof ts.toMillis === "function" ? ts.toMillis() : new Date(ts).getTime();
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 5)     return "just now";
  if (sec < 60)    return `${sec}s`;
  if (sec < 3600)  return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}