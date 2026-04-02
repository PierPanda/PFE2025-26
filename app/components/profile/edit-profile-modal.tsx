import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, Input, Textarea } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { DbUser, TeacherWithUserAndCourses } from '~/services/types';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: DbUser;
  teacher: TeacherWithUserAndCourses | null;
};

export default function EditProfileModal({ isOpen, onClose, user, teacher }: EditProfileModalProps) {
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image ?? null);

  const isSubmitting = fetcher.state !== 'idle';

  // Ferme la modal seulement après succès — évite le démontage prématuré
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('_action', 'updateProfile');
    fetcher.submit(formData, { method: 'POST', encType: 'multipart/form-data' });
  };

  const skills = teacher?.skills
    ? teacher.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Modifier le profil</ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden group focus:outline-none"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-600">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <InlineIcon icon="mdi:camera" className="text-white" width="24" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="avatar"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Nom */}
            <Input
              isRequired
              color="warning"
              variant="bordered"
              label="Nom"
              name="name"
              defaultValue={user.name}
              validate={(value) => (value.trim().length === 0 ? 'Le nom est requis.' : undefined)}
            />

            {/* Champs enseignant */}
            {teacher && (
              <>
                <Textarea
                  color="warning"
                  variant="bordered"
                  label="Description"
                  name="description"
                  placeholder="Présentez-vous en quelques mots…"
                  minRows={3}
                  defaultValue={teacher.description ?? ''}
                />
                <Input
                  color="warning"
                  variant="bordered"
                  label="Compétences"
                  name="skills"
                  placeholder="Piano, Jazz, Improvisation…"
                  defaultValue={skills}
                  description="Séparez les compétences par des virgules."
                />
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" color="warning" isLoading={isSubmitting}>
              Enregistrer
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
