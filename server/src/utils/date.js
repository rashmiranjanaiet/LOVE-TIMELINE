const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeToUtcDate(dateInput) {
  const date = new Date(dateInput);

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getSafeAnniversaryDate(year, sourceDate) {
  const month = sourceDate.getUTCMonth();
  const day = sourceDate.getUTCDate();
  const candidate = new Date(Date.UTC(year, month, day));

  if (candidate.getUTCMonth() === month) {
    return candidate;
  }

  return new Date(Date.UTC(year, month + 1, 0));
}

export function calculateDaysTogether(startDate, now = new Date()) {
  const start = normalizeToUtcDate(startDate);
  const today = normalizeToUtcDate(now);

  return Math.max(0, Math.floor((today - start) / MS_PER_DAY));
}

export function getNextAnniversary(startDate, now = new Date()) {
  const start = normalizeToUtcDate(startDate);
  const today = normalizeToUtcDate(now);
  let year = Math.max(today.getUTCFullYear(), start.getUTCFullYear() + 1);
  let anniversary = getSafeAnniversaryDate(year, start);

  if (anniversary < today) {
    year += 1;
    anniversary = getSafeAnniversaryDate(year, start);
  }

  return {
    anniversary,
    years: anniversary.getUTCFullYear() - start.getUTCFullYear()
  };
}

export function calculateDaysUntil(dateInput, now = new Date()) {
  const target = normalizeToUtcDate(dateInput);
  const today = normalizeToUtcDate(now);

  return Math.max(0, Math.floor((target - today) / MS_PER_DAY));
}

export function isSameMonthDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);

  return dateA.getUTCMonth() === dateB.getUTCMonth() && dateA.getUTCDate() === dateB.getUTCDate();
}

export function buildAnniversaryReminder(user, now = new Date(), windowDays = 7) {
  const { anniversary, years } = getNextAnniversary(user.relationshipStartDate, now);
  const daysUntil = calculateDaysUntil(anniversary, now);

  if (daysUntil > windowDays) {
    return null;
  }

  return {
    email: user.email,
    displayName: user.displayName,
    partnerName: user.partnerName,
    years,
    anniversaryDate: anniversary.toISOString(),
    daysUntil
  };
}

export function buildLoveMessagePayload(user, now = new Date()) {
  const relationshipStartDate = new Date(user.relationshipStartDate);
  const monthlyMilestone = relationshipStartDate.getUTCDate() === now.getUTCDate();
  const valentinesDay = now.getUTCMonth() === 1 && now.getUTCDate() === 14;
  const anniversaryDay = isSameMonthDay(user.relationshipStartDate, now);

  if (!monthlyMilestone && !valentinesDay && !anniversaryDay) {
    return null;
  }

  const daysTogether = calculateDaysTogether(user.relationshipStartDate, now);
  const reason = anniversaryDay ? "anniversary" : valentinesDay ? "special-date" : "monthly";
  const greeting = anniversaryDay
    ? `Another year together deserves a note.`
    : valentinesDay
      ? `A good day to send something intentional.`
      : `Another month of your story is on the calendar.`;

  return {
    email: user.email,
    displayName: user.displayName,
    partnerName: user.partnerName,
    daysTogether,
    reason,
    message: `${greeting} ${user.displayName}, you and ${user.partnerName} have been together for ${daysTogether} days.`
  };
}
