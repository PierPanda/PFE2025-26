'use client';

import { useState } from 'react';
import { Avatar, Card, CardBody } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { calculateAverageRating, formatRelativeDate } from '~/lib/utils';
import type { RatingWithLearner } from '~/services/types';
import StarRating from '~/components/ui/star-rating';

const INITIAL_COUNT = 3;

type ReviewsSectionProps = {
  ratings: RatingWithLearner[];
};

function ReviewCard({ rating }: { rating: RatingWithLearner }) {
  const name = rating.learner.user.name ?? 'Anonyme';

  return (
    <div className="flex items-start gap-4 py-4">
      <Avatar name={name} src={rating.learner.user.image ?? undefined} size="sm" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="font-semibold">{name}</span>
          <StarRating rating={Math.round(parseFloat(rating.rate))} width="18" />
          <span className="text-sm text-default-500">{formatRelativeDate(rating.createdAt)}</span>
        </div>
        {rating.title && <p className="font-medium mt-1">{rating.title}</p>}
        {rating.description && <p className="text-default-600 mt-0.5 text-sm">{rating.description}</p>}
      </div>
    </div>
  );
}

export default function ReviewsSection({ ratings }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const average = calculateAverageRating(ratings);
  const formattedAverage = average ? average.toFixed(1).replace('.', ',') : null;
  const count = ratings.length;
  const displayed = showAll ? ratings : ratings.slice(0, INITIAL_COUNT);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Avis</h3>
      <Card className="rounded-2xl shadow-none border border-default-200">
        <CardBody className="p-0">
          {count === 0 ? (
            <p className="text-default-500 text-center py-10">Aucun avis pour le moment</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">
                <div className="flex items-center gap-2">
                  <InlineIcon icon="mdi:star" className="text-amber-400" width="28" />
                  <span className="text-2xl font-bold">{formattedAverage}</span>
                  <span className="text-default-500">({count} avis)</span>
                </div>
              </div>

              <hr className="border-default-200" />

              <div className="divide-y divide-default-200">
                {displayed.map((rating) => (
                  <div key={rating.id} className="px-6">
                    <ReviewCard rating={rating} />
                  </div>
                ))}
              </div>

              {count > INITIAL_COUNT && (
                <div className="flex justify-center py-4 border-t border-default-200">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="flex items-center gap-1.5 text-sm font-medium text-default-600 bg-default-100 hover:bg-default-200 transition-colors px-4 py-2 rounded-lg"
                  >
                    <InlineIcon icon={showAll ? 'mdi:minus' : 'mdi:plus'} width="16" />
                    {showAll ? "Afficher moins d'avis" : "Charger plus d'avis"}
                  </button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
