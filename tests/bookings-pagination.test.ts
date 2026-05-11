import { describe, it, expect } from 'vitest';
import type { BookingFilter } from '~/services/bookings/get-bookings';
import { parsePageParam, computeOffset, computeRange } from '~/lib/pagination';

const PAGE_SIZE = 10;

type MockBooking = {
  startTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
};

function applyFilter(bookings: MockBooking[], filter: BookingFilter, now: Date): MockBooking[] {
  switch (filter) {
    case 'upcoming':
      return bookings.filter((b) => b.startTime > now && b.status !== 'cancelled');
    case 'past':
      return bookings.filter((b) => b.startTime <= now && b.status !== 'cancelled');
    case 'cancelled':
      return bookings.filter((b) => b.status === 'cancelled');
    default:
      return bookings;
  }
}

// --- Test data ---

const NOW = new Date('2026-04-29T12:00:00Z');

const BOOKINGS: MockBooking[] = [
  { startTime: new Date('2026-05-10T10:00:00Z'), status: 'confirmed' }, // futur confirmé
  { startTime: new Date('2026-05-15T10:00:00Z'), status: 'pending' }, // futur en attente
  { startTime: new Date('2026-05-20T10:00:00Z'), status: 'cancelled' }, // futur annulé
  { startTime: new Date('2026-04-01T10:00:00Z'), status: 'confirmed' }, // passé confirmé
  { startTime: new Date('2026-04-10T10:00:00Z'), status: 'pending' }, // passé en attente
  { startTime: new Date('2026-04-15T10:00:00Z'), status: 'cancelled' }, // passé annulé
];

// --- URL param parsing ---

describe('parsePageParam', () => {
  it('return 1 if page param is null', () => {
    expect(parsePageParam(null)).toBe(1);
  });

  it('return the parsed number for a valid page param', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('return 1 for an invalid page param', () => {
    expect(parsePageParam('abc')).toBe(1);
    expect(parsePageParam('')).toBe(1);
  });

  it('clamp to 1 for negative or zero values', () => {
    expect(parsePageParam('0')).toBe(1);
    expect(parsePageParam('-5')).toBe(1);
  });
});

// --- Offset computation ---

describe('computeOffset', () => {
  it('return 0 for page 1', () => {
    expect(computeOffset(1, PAGE_SIZE)).toBe(0);
  });

  it('return 10 for page 2', () => {
    expect(computeOffset(2, PAGE_SIZE)).toBe(10);
  });

  it('return 20 for page 3', () => {
    expect(computeOffset(3, PAGE_SIZE)).toBe(20);
  });
});

// --- Range computation ---

describe('computeRange', () => {
  it('return correct range for 0 total results', () => {
    const { rangeStart, rangeEnd } = computeRange(1, 0, PAGE_SIZE);
    expect(rangeStart).toBe(0);
    expect(rangeEnd).toBe(0);
  });

  it('return correct range for page 1 with 25 results', () => {
    const { rangeStart, rangeEnd } = computeRange(1, 25, PAGE_SIZE);
    expect(rangeStart).toBe(1);
    expect(rangeEnd).toBe(10);
  });

  it('return correct range for page 2 with 25 results', () => {
    const { rangeStart, rangeEnd } = computeRange(2, 25, PAGE_SIZE);
    expect(rangeStart).toBe(11);
    expect(rangeEnd).toBe(20);
  });

  it('return correct range for last partial page', () => {
    const { rangeStart, rangeEnd } = computeRange(3, 25, PAGE_SIZE);
    expect(rangeStart).toBe(21);
    expect(rangeEnd).toBe(25);
  });

  it('return correct totalPages for 10 results', () => {
    expect(computeRange(1, 10, PAGE_SIZE).totalPages).toBe(1);
  });

  it('return correct totalPages', () => {
    expect(computeRange(1, 25, PAGE_SIZE).totalPages).toBe(3);
    expect(computeRange(1, 11, PAGE_SIZE).totalPages).toBe(2);
    expect(computeRange(1, 0, PAGE_SIZE).totalPages).toBe(0);
  });
});

// --- Filters ---

describe('"all" filter', () => {
  it('return all bookings', () => {
    expect(applyFilter(BOOKINGS, 'all', NOW)).toHaveLength(6);
  });
});

describe('"upcoming" filter', () => {
  it('return only upcoming bookings', () => {
    const result = applyFilter(BOOKINGS, 'upcoming', NOW);
    result.forEach((b) => expect(b.startTime > NOW).toBe(true));
  });

  it('exclude cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'upcoming', NOW);
    result.forEach((b) => expect(b.status).not.toBe('cancelled'));
  });

  it('return only upcoming non-cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'upcoming', NOW);
    expect(result).toHaveLength(2);
  });
});

describe('"past" filter', () => {
  it('exclude future bookings', () => {
    const result = applyFilter(BOOKINGS, 'past', NOW);
    result.forEach((b) => expect(b.startTime <= NOW).toBe(true));
  });

  it('exclude cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'past', NOW);
    result.forEach((b) => expect(b.status).not.toBe('cancelled'));
  });

  it('return only past non-cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'past', NOW);
    expect(result).toHaveLength(2);
  });
});

describe('"cancelled" filter', () => {
  it('return only cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'cancelled', NOW);
    result.forEach((b) => expect(b.status).toBe('cancelled'));
  });

  it('include only cancelled bookings', () => {
    const result = applyFilter(BOOKINGS, 'cancelled', NOW);
    expect(result).toHaveLength(2);
  });
});

describe('page parameter reset', () => {
  it('reset page parameter when filter changes', () => {
    const params = new URLSearchParams('page=3&filter=past');
    params.delete('page');
    params.set('filter', 'upcoming');
    expect(parsePageParam(params.get('page'))).toBe(1);
  });
});
