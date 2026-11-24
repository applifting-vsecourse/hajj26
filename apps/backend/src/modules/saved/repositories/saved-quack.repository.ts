import { PrismaService } from '@/core/prisma/prisma.service';
import { Quack } from '@/modules/quack/domain/quack';
import { mapPrismaQuackToDomain } from '@/modules/quack/repositories/quack.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SavedQuackRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Saves the quack for the user. Saving it again changes nothing. */
  async saveQuack(filter: { userId: string; quackId: string }): Promise<void> {
    // INSERT … ON CONFLICT DO NOTHING: idempotent even for two saves racing
    // each other, and a repeat save keeps the original save time (and so its
    // place in Saved).
    await this.prisma.savedQuack.createMany({
      data: [{ userId: filter.userId, quackId: filter.quackId }],
      skipDuplicates: true,
    });
  }

  /** Removes the quack from the user's Saved. Removing a quack that isn't saved changes nothing. */
  async unsaveQuack(filter: {
    userId: string;
    quackId: string;
  }): Promise<void> {
    await this.prisma.savedQuack.deleteMany({
      where: { userId: filter.userId, quackId: filter.quackId },
    });
  }

  /** The user's saved quacks, the most recently saved first, with authors loaded. */
  async getSavedQuacks(filter: { userId: string }): Promise<Quack[]> {
    const saved = await this.prisma.savedQuack.findMany({
      where: { userId: filter.userId },
      include: { quack: { include: { user: true } } },
      orderBy: { savedAt: 'desc' },
    });
    return saved.map(({ quack }) => ({
      ...mapPrismaQuackToDomain(quack),
      isSaved: true,
    }));
  }
}
