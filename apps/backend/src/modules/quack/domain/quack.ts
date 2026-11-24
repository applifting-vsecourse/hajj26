export type QuackAuthor = {
  id: string;
  name: string;
  username: string;
};

export const QUACK_MOODS = ['happy', 'sad', 'angry', 'silly'] as const;

export type QuackMood = (typeof QUACK_MOODS)[number];

export type Quack = {
  id: string;
  text: string;
  mood: QuackMood | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: QuackAuthor;
  /** Whether the user reading the quack has it in their Saved; set only when a reader is known. */
  isSaved?: boolean;
};
