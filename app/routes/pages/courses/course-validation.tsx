import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import type { CourseFormInput } from './create-course-form';
import { formatPrice, formatDuration } from '~/lib/utils';

type CourseValidationProps = {
  values: CourseFormInput;
  createCourse: (published: boolean) => void;
  onBack: () => void;
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
  },
};

export default function CourseValidation({ values, createCourse, onBack }: CourseValidationProps) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-4">
      <motion.div variants={fadeUp} className="overflow-hidden rounded-xl border border-gray-100">
        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold capitalize text-brand">
              <Icon icon="solar:tag-bold" width={11} />
              {values.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-500">
              <Icon icon="solar:chart-bold" width={11} />
              {values.level}
            </span>
          </div>

          <h2 className="text-lg font-bold leading-snug text-gray-900">{values.title}</h2>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-3 rounded-xl bg-gray-50 p-4 overflow-hidden">
        <Icon icon="solar:document-text-bold" width={15} className="mt-0.5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Description</p>
          <p className="text-sm leading-relaxed text-gray-600 wrap-break-words">{values.description}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:wallet-bold" width={13} className="text-brand" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand/70">Prix</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(values.price)}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Icon icon="solar:clock-circle-bold" width={13} className="text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Durée</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDuration(values.duration)}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="h-px bg-gray-100" />

      <motion.div variants={fadeUp} className="flex flex-col gap-3">
        <Button
          type="button"
          color="warning"
          className="h-12 w-full rounded-xl text-base font-bold"
          startContent={<Icon icon="solar:rocket-bold" width={18} />}
          onPress={() => createCourse(true)}
        >
          Publier le cours
        </Button>

        <Button
          type="button"
          variant="bordered"
          className="h-12 w-full rounded-xl border-primary font-semibold text-primary hover:bg-primary/5"
          startContent={<Icon icon="solar:diskette-bold" width={17} />}
          onPress={() => createCourse(false)}
        >
          Enregistrer en brouillon
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700"
        >
          <Icon icon="solar:arrow-left-linear" width={14} />
          Modifier les informations
        </button>
      </motion.div>
    </motion.div>
  );
}
