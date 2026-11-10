import { Quack, QuackMood } from '@/modules/quack/domain/quack';
import { QuackRepository } from '@/modules/quack/repositories/quack.repository';
import { Identity } from '@/shared/auth/domain/identity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class QuacksService {
  constructor(private readonly quackRepository: QuackRepository) {}

  async getQuacks(
    filter: { search?: string; authorId?: string } = {},
  ): Promise<Quack[]> {
    // People search for authors the way the feed shows them — "@BreadCritic" —
    // so a leading @ is dropped and the rest matches the username.
    const search = filter.search?.trim().replace(/^@/, '');
    return this.quackRepository.getQuacks({
      search: search || undefined,
      authorId: filter.authorId,
    });
  }

  async createQuack(
    user: Identity,
    quackData: { text: string; mood?: QuackMood | null },
  ): Promise<Quack> {
    return this.quackRepository.createQuack({
      text: quackData.text,
      mood: quackData.mood ?? null,
      // the author is taken from the session, never from the request body
      userId: user.id,
    });
  }

  async deleteQuack(user: Identity, quackId: string): Promise<void> {
    // Only the author may delete — the owner comes from the session.
    const deleted = await this.quackRepository.deleteOwnQuack({
      id: quackId,
      userId: user.id,
    });
    if (deleted) return;

    // Nothing deleted: tell "not yours" apart from "doesn't exist". Quacks are
    // public in the feed, so revealing that one exists leaks nothing.
    const quack = await this.quackRepository.getQuackById(quackId);
    if (quack)
      throw new ForbiddenException('You can only delete your own quacks');
    throw new NotFoundException('Quack not found');
  }
}
