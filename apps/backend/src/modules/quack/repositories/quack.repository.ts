import { PrismaService } from '@/core/prisma/prisma.service';
import {
  Quack as PrismaQuack,
  User as PrismaUser,
} from '@/generated/prisma/client';
import { Quack, QuackMood } from '@/modules/quack/domain/quack';
import { Injectable } from '@nestjs/common';

const mapPrismaQuackToDomain = (
  quack: PrismaQuack & { user?: PrismaUser },
): Quack => ({
  id: quack.id,
  text: quack.text,
  mood: quack.mood,
  userId: quack.userId,
  createdAt: quack.createdAt,
  updatedAt: quack.updatedAt,
  user: quack.user
    ? {
        id: quack.user.id,
        name: quack.user.name,
        username: quack.user.username ?? '',
      }
    : undefined,
});

/**
 * If you decide to choose a different ORM or database, you should only need to change the repository files methods implementation.
 * Inject what you need instead of PrismaService and re-implement the methods and model mapping.
 */
@Injectable()
export class QuackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getQuacks(
    filter: { search?: string; authorId?: string } = {},
  ): Promise<Quack[]> {
    const { search, authorId } = filter;
    const quacks = await this.prisma.quack.findMany({
      where: {
        userId: authorId,
        OR: search
          ? [
              { text: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
              {
                user: { username: { contains: search, mode: 'insensitive' } },
              },
            ]
          : undefined,
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return quacks.map(mapPrismaQuackToDomain);
  }

  async createQuack(createQuackData: {
    text: string;
    mood: QuackMood | null;
    userId: string;
  }): Promise<Quack> {
    const quack = await this.prisma.quack.create({
      data: {
        text: createQuackData.text,
        mood: createQuackData.mood,
        user: { connect: { id: createQuackData.userId } },
      },
      include: { user: true },
    });
    return mapPrismaQuackToDomain(quack);
  }

  async getQuackById(id: string): Promise<Quack | null> {
    const quack = await this.prisma.quack.findUnique({ where: { id } });
    return quack ? mapPrismaQuackToDomain(quack) : null;
  }

  /**
   * Deletes the quack only if it belongs to `userId` — ownership is part of the
   * WHERE clause, so there is no window between "check" and "delete".
   * Returns whether a row was deleted.
   */
  async deleteOwnQuack(filter: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    const { count } = await this.prisma.quack.deleteMany({
      where: { id: filter.id, userId: filter.userId },
    });
    return count > 0;
  }
}
