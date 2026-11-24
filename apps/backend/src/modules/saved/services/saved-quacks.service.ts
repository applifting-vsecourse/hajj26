import { Quack } from '@/modules/quack/domain/quack';
import { QuackRepository } from '@/modules/quack/repositories/quack.repository';
import { SavedQuackRepository } from '@/modules/saved/repositories/saved-quack.repository';
import { Identity } from '@/shared/auth/domain/identity';
import { Injectable, NotFoundException } from '@nestjs/common';

// Whose Saved is read or changed always comes from the session (`user`),
// never from the request.
@Injectable()
export class SavedQuacksService {
  constructor(
    private readonly savedQuackRepository: SavedQuackRepository,
    private readonly quackRepository: QuackRepository,
  ) {}

  async saveQuack(user: Identity, quackId: string): Promise<void> {
    const quack = await this.quackRepository.getQuackById(quackId);
    if (!quack) throw new NotFoundException('Quack not found');

    // Any quack in the feed can be saved, your own included.
    await this.savedQuackRepository.saveQuack({ userId: user.id, quackId });
  }

  async unsaveQuack(user: Identity, quackId: string): Promise<void> {
    // No existence check: removing what isn't there (or no longer exists) is
    // already the state the caller asked for.
    await this.savedQuackRepository.unsaveQuack({ userId: user.id, quackId });
  }

  async getSavedQuacks(user: Identity): Promise<Quack[]> {
    return this.savedQuackRepository.getSavedQuacks({ userId: user.id });
  }
}
