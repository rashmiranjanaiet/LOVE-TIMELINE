export function formatHumanDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateString));
}

export function toDateInputValue(dateString) {
  return new Date(dateString).toISOString().slice(0, 10);
}

function dateOnly(dateInput) {
  const date = new Date(dateInput);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function anniversaryForYear(startDate, year) {
  const month = startDate.getUTCMonth();
  const day = startDate.getUTCDate();
  const candidate = new Date(Date.UTC(year, month, day));

  if (candidate.getUTCMonth() === month) {
    return candidate;
  }

  return new Date(Date.UTC(year, month + 1, 0));
}

export function getRelationshipStats(startDateInput) {
  const startDate = dateOnly(startDateInput);
  const today = dateOnly(new Date());
  const daysTogether = Math.max(0, Math.floor((today - startDate) / (24 * 60 * 60 * 1000)));
  let anniversaryYear = Math.max(today.getUTCFullYear(), startDate.getUTCFullYear() + 1);
  let nextAnniversary = anniversaryForYear(startDate, anniversaryYear);

  if (nextAnniversary < today) {
    anniversaryYear += 1;
    nextAnniversary = anniversaryForYear(startDate, anniversaryYear);
  }

  const daysUntilAnniversary = Math.max(
    0,
    Math.floor((nextAnniversary - today) / (24 * 60 * 60 * 1000))
  );

  return {
    daysTogether,
    daysUntilAnniversary,
    nextAnniversaryLabel: formatHumanDate(nextAnniversary.toISOString()),
    upcomingYears: nextAnniversary.getUTCFullYear() - startDate.getUTCFullYear()
  };
}
