import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AvailabilityWithTeacher, BookingWithRelations, TeacherWithUser, DbUser } from '../types';

vi.mock('./get-availability', () => ({
  getAvailabilityByTeacherId: vi.fn(),
}));
vi.mock('../bookings/get-bookings', () => ({
  getBookingsByTeacherId: vi.fn(),
}));

import { getAvailableSlots } from './get-available-slots';
import { getAvailabilityByTeacherId } from './get-availability';
import { getBookingsByTeacherId } from '../bookings/get-bookings';

const mockGetAvailabilityByTeacherId = vi.mocked(getAvailabilityByTeacherId);
const mockGetBookingsByTeacherId = vi.mocked(getBookingsByTeacherId);

const teacherId = 'teacher-1';

const baseUser: DbUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
  banned: false,
  banReason: null,
  banExpires: null,
};

const baseTeacher: TeacherWithUser = {
  id: teacherId,
  userId: 'user-1',
  description: null,
  graduations: null,
  skills: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: baseUser,
};

function createAvailability(id: string, start: Date, end: Date, isException = false): AvailabilityWithTeacher {
  return {
    id,
    teacherId,
    startTime: start,
    endTime: end,
    isException,
    exceptionReason: isException ? 'Blocked' : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    teacher: baseTeacher,
  };
}

describe('getAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookingsByTeacherId.mockResolvedValue({
      success: true,
      bookings: [] as BookingWithRelations[],
    });
  });

  it('should return slots when no exceptions exist', async () => {
    const start = new Date('2026-04-10T09:00:00Z');
    const end = new Date('2026-04-10T12:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [createAvailability('av-1', start, end, false)],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].startTime).toEqual(start);
      expect(result.slots[0].endTime).toEqual(end);
    }
  });

  it('should pass slots when exception has no overlap', async () => {
    const ruleStart = new Date('2026-04-10T09:00:00Z');
    const ruleEnd = new Date('2026-04-10T12:00:00Z');
    const exStart = new Date('2026-04-10T14:00:00Z');
    const exEnd = new Date('2026-04-10T16:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [
        createAvailability('av-1', ruleStart, ruleEnd, false),
        createAvailability('ex-1', exStart, exEnd, true),
      ],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].availabilityId).toBe('av-1');
    }
  });

  it('should fragment slot when exception partially overlaps', async () => {
    const ruleStart = new Date('2026-04-10T09:00:00Z');
    const ruleEnd = new Date('2026-04-10T12:00:00Z');
    const exStart = new Date('2026-04-10T11:00:00Z');
    const exEnd = new Date('2026-04-10T13:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [
        createAvailability('av-1', ruleStart, ruleEnd, false),
        createAvailability('ex-1', exStart, exEnd, true),
      ],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slots).toHaveLength(1);
      expect(result.slots[0].startTime).toEqual(ruleStart);
      expect(result.slots[0].endTime).toEqual(exStart);
    }
  });

  it('should split slot into two parts when exception is in the middle', async () => {
    const ruleStart = new Date('2026-04-10T09:00:00Z');
    const ruleEnd = new Date('2026-04-10T12:00:00Z');
    const exStart = new Date('2026-04-10T10:00:00Z');
    const exEnd = new Date('2026-04-10T11:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [
        createAvailability('av-1', ruleStart, ruleEnd, false),
        createAvailability('ex-1', exStart, exEnd, true),
      ],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slots).toHaveLength(2);
      expect(result.slots[0].startTime).toEqual(ruleStart);
      expect(result.slots[0].endTime).toEqual(exStart);
      expect(result.slots[1].startTime).toEqual(exEnd);
      expect(result.slots[1].endTime).toEqual(ruleEnd);
    }
  });

  it('should remove slot when exception fully englobes it', async () => {
    const ruleStart = new Date('2026-04-10T10:00:00Z');
    const ruleEnd = new Date('2026-04-10T11:00:00Z');
    const exStart = new Date('2026-04-10T09:00:00Z');
    const exEnd = new Date('2026-04-10T12:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [
        createAvailability('av-1', ruleStart, ruleEnd, false),
        createAvailability('ex-1', exStart, exEnd, true),
      ],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slots).toHaveLength(0);
    }
  });

  it('should apply multiple distinct exceptions independently', async () => {
    const rule1Start = new Date('2026-04-10T08:00:00Z');
    const rule1End = new Date('2026-04-10T10:00:00Z');
    const rule2Start = new Date('2026-04-10T14:00:00Z');
    const rule2End = new Date('2026-04-10T16:00:00Z');
    const rule3Start = new Date('2026-04-10T18:00:00Z');
    const rule3End = new Date('2026-04-10T20:00:00Z');

    const ex1Start = new Date('2026-04-10T09:00:00Z');
    const ex1End = new Date('2026-04-10T11:00:00Z');
    const ex2Start = new Date('2026-04-10T15:00:00Z');
    const ex2End = new Date('2026-04-10T17:00:00Z');

    mockGetAvailabilityByTeacherId.mockResolvedValue({
      success: true,
      availabilities: [
        createAvailability('av-1', rule1Start, rule1End, false),
        createAvailability('av-2', rule2Start, rule2End, false),
        createAvailability('av-3', rule3Start, rule3End, false),
        createAvailability('ex-1', ex1Start, ex1End, true),
        createAvailability('ex-2', ex2Start, ex2End, true),
      ],
    });

    const result = await getAvailableSlots(teacherId);

    expect(result.success).toBe(true);
    if (result.success) {
      // Rule1 8h-10h avec ex1 9h-11h → slot 8h-9h
      // Rule2 14h-16h avec ex2 15h-17h → slot 14h-15h
      // Rule3 18h-20h → intact
      expect(result.slots).toHaveLength(3);
      expect(result.slots[0].startTime).toEqual(rule1Start);
      expect(result.slots[0].endTime).toEqual(ex1Start);
      expect(result.slots[1].startTime).toEqual(rule2Start);
      expect(result.slots[1].endTime).toEqual(ex2Start);
      expect(result.slots[2].startTime).toEqual(rule3Start);
      expect(result.slots[2].endTime).toEqual(rule3End);
    }
  });
});
