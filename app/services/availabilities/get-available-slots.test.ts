import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  AvailabilityWithTeacher,
  BookingWithRelations,
  CourseWithTeacher,
  LearnerWithUser,
  TeacherWithUser,
  DbUser,
} from '../types';

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

  describe('exception fragmentation', () => {
    it('should return full slot when no exceptions exist', async () => {
      const start = new Date('2026-04-10T09:00:00Z');
      const end = new Date('2026-04-10T12:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [createAvailability('av-1', start, end)],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(1);
        expect(result.slots[0].startTime).toEqual(start);
        expect(result.slots[0].endTime).toEqual(end);
      }
    });

    it('should return slot unchanged when exception has no overlap', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T12:00:00Z');
      const exStart = new Date('2026-04-10T14:00:00Z');
      const exEnd = new Date('2026-04-10T16:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
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

    it('should clip slot when exception partially overlaps', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T12:00:00Z');
      const exStart = new Date('2026-04-10T11:00:00Z');
      const exEnd = new Date('2026-04-10T13:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
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
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', exStart, exEnd, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(2);
        expect(result.slots[0]).toMatchObject({ startTime: ruleStart, endTime: exStart });
        expect(result.slots[1]).toMatchObject({ startTime: exEnd, endTime: ruleEnd });
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
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', exStart, exEnd, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(0);
      }
    });

    it('should apply multiple exceptions on distinct rules independently', async () => {
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
          createAvailability('av-1', rule1Start, rule1End),
          createAvailability('av-2', rule2Start, rule2End),
          createAvailability('av-3', rule3Start, rule3End),
          createAvailability('ex-1', ex1Start, ex1End, true),
          createAvailability('ex-2', ex2Start, ex2End, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        // rule1 8h-10h + ex1 9h-11h → 8h-9h
        // rule2 14h-16h + ex2 15h-17h → 14h-15h
        // rule3 18h-20h → intact
        expect(result.slots).toHaveLength(3);
        expect(result.slots[0]).toMatchObject({ startTime: rule1Start, endTime: ex1Start });
        expect(result.slots[1]).toMatchObject({ startTime: rule2Start, endTime: ex2Start });
        expect(result.slots[2]).toMatchObject({ startTime: rule3Start, endTime: rule3End });
      }
    });

    it('should produce no left fragment when exception starts exactly at slot start', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T12:00:00Z');
      const exEnd = new Date('2026-04-10T10:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', ruleStart, exEnd, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(1);
        expect(result.slots[0]).toMatchObject({ startTime: exEnd, endTime: ruleEnd });
      }
    });

    it('should produce no right fragment when exception ends exactly at slot end', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T12:00:00Z');
      const exStart = new Date('2026-04-10T11:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', exStart, ruleEnd, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(1);
        expect(result.slots[0]).toMatchObject({ startTime: ruleStart, endTime: exStart });
      }
    });

    it('should handle two adjacent exceptions on the same slot', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T15:00:00Z');
      const ex1Start = new Date('2026-04-10T10:00:00Z');
      const ex1End = new Date('2026-04-10T12:00:00Z');
      const ex2Start = new Date('2026-04-10T12:00:00Z');
      const ex2End = new Date('2026-04-10T14:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', ex1Start, ex1End, true),
          createAvailability('ex-2', ex2Start, ex2End, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        // 9h-10h, 14h-15h
        expect(result.slots).toHaveLength(2);
        expect(result.slots[0]).toMatchObject({ startTime: ruleStart, endTime: ex1Start });
        expect(result.slots[1]).toMatchObject({ startTime: ex2End, endTime: ruleEnd });
      }
    });

    it('should merge two overlapping exceptions into a single block', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T15:00:00Z');
      const ex1Start = new Date('2026-04-10T10:00:00Z');
      const ex1End = new Date('2026-04-10T12:00:00Z');
      const ex2Start = new Date('2026-04-10T11:00:00Z');
      const ex2End = new Date('2026-04-10T13:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', ex1Start, ex1End, true),
          createAvailability('ex-2', ex2Start, ex2End, true),
        ],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        // combined block 10h-13h → 9h-10h, 13h-15h
        expect(result.slots).toHaveLength(2);
        expect(result.slots[0]).toMatchObject({ startTime: ruleStart, endTime: ex1Start });
        expect(result.slots[1]).toMatchObject({ startTime: ex2End, endTime: ruleEnd });
      }
    });
  });

  describe('booking subtraction', () => {
    const baseLearner: LearnerWithUser = {
      id: 'learner-1',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: baseUser,
    };

    const baseCourse: CourseWithTeacher = {
      id: 'course-1',
      teacherId,
      title: 'Test course',
      description: null,
      duration: 60,
      level: 'debutant',
      price: '50',
      isPublished: true,
      category: 'piano',
      createdAt: new Date(),
      updatedAt: new Date(),
      teacher: baseTeacher,
    };

    function createBooking(
      availabilityId: string,
      start: Date,
      end: Date,
      availability: AvailabilityWithTeacher,
    ): BookingWithRelations {
      return {
        id: `booking-${start.toISOString()}`,
        courseId: baseCourse.id,
        availabilityId,
        learnerId: baseLearner.id,
        startTime: start,
        endTime: end,
        priceAtBooking: '50',
        status: 'confirmed',
        paymentIntentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        course: baseCourse,
        availability,
        learner: baseLearner,
      };
    }

    it('should propagate error when getBookingsByTeacherId fails', async () => {
      const start = new Date('2026-04-10T09:00:00Z');
      const end = new Date('2026-04-10T12:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [createAvailability('av-1', start, end)],
      });
      mockGetBookingsByTeacherId.mockResolvedValue({ success: false, error: 'DB error' });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DB error');
      }
    });

    it('should not affect slots when the booking belongs to a different availability', async () => {
      const start = new Date('2026-04-10T09:00:00Z');
      const end = new Date('2026-04-10T12:00:00Z');
      const av1 = createAvailability('av-1', start, end);
      const av2 = createAvailability('av-2', start, end);

      mockGetAvailabilityByTeacherId.mockResolvedValue({ success: true, availabilities: [av1] });
      mockGetBookingsByTeacherId.mockResolvedValue({
        success: true,
        bookings: [createBooking('av-2', start, end, av2)],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(1);
        expect(result.slots[0]).toMatchObject({ startTime: start, endTime: end });
      }
    });

    it('should split availability into two fragments when booking is in the middle', async () => {
      const avStart = new Date('2026-04-10T09:00:00Z');
      const avEnd = new Date('2026-04-10T17:00:00Z');
      const bookingStart = new Date('2026-04-10T12:00:00Z');
      const bookingEnd = new Date('2026-04-10T13:00:00Z');
      const av = createAvailability('av-1', avStart, avEnd);

      mockGetAvailabilityByTeacherId.mockResolvedValue({ success: true, availabilities: [av] });
      mockGetBookingsByTeacherId.mockResolvedValue({
        success: true,
        bookings: [createBooking('av-1', bookingStart, bookingEnd, av)],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.slots).toHaveLength(2);
        expect(result.slots[0]).toMatchObject({ startTime: avStart, endTime: bookingStart });
        expect(result.slots[1]).toMatchObject({ startTime: bookingEnd, endTime: avEnd });
      }
    });

    it('should subtract multiple bookings from the same availability', async () => {
      const avStart = new Date('2026-04-10T08:00:00Z');
      const avEnd = new Date('2026-04-10T16:00:00Z');
      const av = createAvailability('av-1', avStart, avEnd);
      const b1Start = new Date('2026-04-10T10:00:00Z');
      const b1End = new Date('2026-04-10T11:00:00Z');
      const b2Start = new Date('2026-04-10T13:00:00Z');
      const b2End = new Date('2026-04-10T14:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({ success: true, availabilities: [av] });
      mockGetBookingsByTeacherId.mockResolvedValue({
        success: true,
        bookings: [createBooking('av-1', b1Start, b1End, av), createBooking('av-1', b2Start, b2End, av)],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        // 08h-10h, 11h-13h, 14h-16h
        expect(result.slots).toHaveLength(3);
        expect(result.slots[0]).toMatchObject({ startTime: avStart, endTime: b1Start });
        expect(result.slots[1]).toMatchObject({ startTime: b1End, endTime: b2Start });
        expect(result.slots[2]).toMatchObject({ startTime: b2End, endTime: avEnd });
      }
    });

    it('should apply booking subtraction then exception fragmentation', async () => {
      const avStart = new Date('2026-04-10T09:00:00Z');
      const avEnd = new Date('2026-04-10T17:00:00Z');
      const av = createAvailability('av-1', avStart, avEnd);
      const bookingStart = new Date('2026-04-10T12:00:00Z');
      const bookingEnd = new Date('2026-04-10T13:00:00Z');
      const exStart = new Date('2026-04-10T15:00:00Z');
      const exEnd = new Date('2026-04-10T16:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [av, createAvailability('ex-1', exStart, exEnd, true)],
      });
      mockGetBookingsByTeacherId.mockResolvedValue({
        success: true,
        bookings: [createBooking('av-1', bookingStart, bookingEnd, av)],
      });

      const result = await getAvailableSlots(teacherId);

      expect(result.success).toBe(true);
      if (result.success) {
        // 09h-12h, 13h-15h, 16h-17h
        expect(result.slots).toHaveLength(3);
        expect(result.slots[0]).toMatchObject({ startTime: avStart, endTime: bookingStart });
        expect(result.slots[1]).toMatchObject({ startTime: bookingEnd, endTime: exStart });
        expect(result.slots[2]).toMatchObject({ startTime: exEnd, endTime: avEnd });
      }
    });
  });

  describe('duration splitting', () => {
    it('should split fragments into fixed-size slots and discard remainders', async () => {
      const ruleStart = new Date('2026-04-10T09:00:00Z');
      const ruleEnd = new Date('2026-04-10T12:00:00Z');
      // exception leaves a 10-min fragment (09:00-09:10) and a 60-min fragment (11:00-12:00)
      const exStart = new Date('2026-04-10T09:10:00Z');
      const exEnd = new Date('2026-04-10T11:00:00Z');

      mockGetAvailabilityByTeacherId.mockResolvedValue({
        success: true,
        availabilities: [
          createAvailability('av-1', ruleStart, ruleEnd),
          createAvailability('ex-1', exStart, exEnd, true),
        ],
      });

      const result = await getAvailableSlots(teacherId, 30);

      expect(result.success).toBe(true);
      if (result.success) {
        // 10-min fragment → 0 slots (can't fit 30 min)
        // 60-min fragment → 2 slots: 11:00-11:30 and 11:30-12:00
        expect(result.slots).toHaveLength(2);
        expect(result.slots[0]).toMatchObject({ startTime: exEnd, endTime: new Date('2026-04-10T11:30:00Z') });
        expect(result.slots[1]).toMatchObject({
          startTime: new Date('2026-04-10T11:30:00Z'),
          endTime: ruleEnd,
        });
      }
    });
  });
});
