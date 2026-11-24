import { Quack } from '@/modules/quack/domain/quack';
import { QuackRepository } from '@/modules/quack/repositories/quack.repository';
import { SavedQuackRepository } from '@/modules/saved/repositories/saved-quack.repository';
import { Identity } from '@/shared/auth/domain/identity';
import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class SavedQuacksService {
  constructor(
    private readonly savedQuackRepository: SavedQuackRepository,
    private readonly quackRepository: QuackRepository,
  ) {}

  async saveQuack(user: Identity, quackId: string): Promise<void> {
    throw new NotImplementedException(
      `saveQuack(${user.id}, ${quackId}) is not implemented`,
    );
  }

  async unsaveQuack(user: Identity, quackId: string): Promise<void> {
    throw new NotImplementedException(
      `unsaveQuack(${user.id}, ${quackId}) is not implemented`,
    );
  }

  async getSavedQuacks(user: Identity): Promise<Quack[]> {
    throw new NotImplementedException(
      `getSavedQuacks(${user.id}) is not implemented`,
    );
  }
}
