import { PrismaService } from '@/core/prisma/prisma.service';
import { Quack } from '@/modules/quack/domain/quack';
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class SavedQuackRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Saves the quack for the user. Saving it again changes nothing. */
  async saveQuack(filter: { userId: string; quackId: string }): Promise<void> {
    throw new NotImplementedException(
      `saveQuack(${filter.userId}, ${filter.quackId}) is not implemented`,
    );
  }

  /** Removes the quack from the user's Saved. Removing a quack that isn't saved changes nothing. */
  async unsaveQuack(filter: {
    userId: string;
    quackId: string;
  }): Promise<void> {
    throw new NotImplementedException(
      `unsaveQuack(${filter.userId}, ${filter.quackId}) is not implemented`,
    );
  }

  /** The user's saved quacks, the most recently saved first, with authors loaded. */
  async getSavedQuacks(filter: { userId: string }): Promise<Quack[]> {
    throw new NotImplementedException(
      `getSavedQuacks(${filter.userId}) is not implemented`,
    );
  }
}
