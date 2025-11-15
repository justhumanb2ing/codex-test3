import {
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  isToday,
  parseISO,
} from "date-fns";

type RelativeDateInput = string | Date;

const normalizeDate = (input: RelativeDateInput) =>
  typeof input === "string" ? parseISO(input) : input;

export const formatRelativeDate = (input: RelativeDateInput) => {
  const target = normalizeDate(input);
  const now = new Date();

  if (isToday(target)) {
    return "오늘";
  }

  const days = differenceInCalendarDays(now, target);
  if (days < 30) {
    return `${days}일전`;
  }

  const months = differenceInMonths(now, target);
  if (months < 12) {
    return `${months}달전`;
  }

  const years = differenceInYears(now, target);
  return `${years}년전`;
};
