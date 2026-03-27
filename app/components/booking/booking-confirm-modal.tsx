import { useEffect } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useFetcher, useNavigate } from 'react-router';
import type { AvailableSlot, CourseWithTeacher } from '~/services/types';
import { formatDateTime, formatPrice } from '~/lib/utils';

type BookingConfirmModalProps = {
  slot: AvailableSlot | null;
  course: CourseWithTeacher;
  isOpen: boolean;
  onClose: () => void;
};

type BookingActionData = {
  success?: boolean;
  error?: string;
  booking?: {
    id: string;
  };
};

export function BookingConfirmModal({ slot, course, isOpen, onClose }: BookingConfirmModalProps) {
  const fetcher = useFetcher<BookingActionData>();
  const navigate = useNavigate();
  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.booking?.id) {
      onClose();
      navigate(`/checkout/${fetcher.data.booking.id}`);
    }
  }, [fetcher.data, navigate, onClose]);

  const handleConfirm = () => {
    if (!slot) return;

    fetcher.submit(
      {
        id: crypto.randomUUID(),
        courseId: course.id,
        availabilityId: slot.availabilityId,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      },
      {
        method: 'POST',
        action: '/api/bookings',
        encType: 'application/json',
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader className="text-xl font-bold text-brand-dark">Confirmer la réservation</ModalHeader>
        <ModalBody>
          {slot ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-brand-dark/60">Cours</p>
                <p className="font-medium text-brand-dark">{course.title}</p>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Date et heure</p>
                <p className="font-medium text-brand-dark">{formatDateTime(slot.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Durée</p>
                <p className="font-medium text-brand-dark">{course.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Prix</p>
                <p className="text-xl font-bold text-brand">{formatPrice(course.price)}</p>
              </div>
            </div>
          ) : null}

          {fetcher.data?.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {fetcher.data.error}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            className="bg-brand-secondary font-semibold text-brand-dark"
            onPress={handleConfirm}
            isLoading={isSubmitting}
            isDisabled={!slot}
          >
            Réserver et payer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
