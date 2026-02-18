export type Teacher = {
  id: string;
  userId: string;
  description?: string;
  graduation?: Record<string, string>;
  skill?: string;
  createdAt: Date;
  updatedAt: Date;
};
