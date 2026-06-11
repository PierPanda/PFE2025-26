import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast,
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { useFetcher, useRevalidator } from 'react-router';
import type { DbRating } from '~/services/types';

type RatingFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  existingRating?: DbRating | null;
};

type RatingActionData = {
  success?: boolean;
  error?: string;
};

export default function RatingFormModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  existingRating,
}: RatingFormModalProps) {
  const isEditing = Boolean(existingRating);
  const fetcher = useFetcher<RatingActionData>();
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state === 'submitting';
  const lastHandledData = useRef<RatingActionData | undefined>(undefined);
  const submittedAsEditing = useRef(false);

  const [rate, setRate] = useState(Math.round(parseFloat(existingRating?.rate ?? '0')));
  const [title, setTitle] = useState(existingRating?.title ?? '');
  const [description, setDescription] = useState(existingRating?.description ?? '');

  useEffect(() => {
    if (!isOpen) return;
    setRate(Math.round(parseFloat(existingRating?.rate ?? '0')));
    setTitle(existingRating?.title ?? '');
    setDescription(existingRating?.description ?? '');
  }, [isOpen, existingRating]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data === lastHandledData.current) return;
    lastHandledData.current = fetcher.data;

    if (fetcher.data.success) {
      addToast({
        title: submittedAsEditing.current ? 'Avis modifié' : 'Avis publié',
        description: submittedAsEditing.current ? 'Votre avis a été mis à jour.' : 'Merci pour votre avis !',
        color: 'success',
      });
      revalidator.revalidate();
      onClose();
    } else {
      addToast({
        title: 'Erreur',
        description: fetcher.data.error ?? 'Une erreur est survenue.',
        color: 'danger',
      });
    }
  }, [fetcher.data, fetcher.state, onClose, revalidator]);

  const handleSubmit = () => {
    if (rate === 0) {
      addToast({ title: 'Note requise', description: 'Veuillez sélectionner une note.', color: 'warning' });
      return;
    }

    submittedAsEditing.current = isEditing;
    const body: Record<string, string | number> = {
      teacherId,
      title: title.trim(),
      rate,
      description: description.trim(),
    };
    const action = isEditing ? `/api/ratings?id=${existingRating?.id}` : '/api/ratings';
    const method = isEditing ? 'PUT' : 'POST';

    fetcher.submit(body, { method, action, encType: 'application/json' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader className="text-xl font-bold text-dark">
          {isEditing ? 'Modifier mon avis' : 'Rédiger un avis'}
        </ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-sm text-default-500">{teacherName}</p>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRate(star)} aria-label={`Note ${star} sur 5`}>
                <InlineIcon
                  icon={star <= rate ? 'mdi:star' : 'mdi:star-outline'}
                  className="text-amber-400 cursor-pointer"
                  width="32"
                />
              </button>
            ))}
          </div>

          <Input
            label="Titre"
            placeholder="Résumez votre expérience"
            value={title}
            onValueChange={setTitle}
            maxLength={100}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Décrivez votre expérience (optionnel)"
            value={description}
            onValueChange={setDescription}
            maxLength={1000}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            className="bg-secondary font-semibold text-dark"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={rate === 0 || title.trim().length < 3}
          >
            {isEditing ? 'Enregistrer' : 'Publier'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
