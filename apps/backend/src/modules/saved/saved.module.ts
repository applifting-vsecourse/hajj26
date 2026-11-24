import { PrismaModule } from '@/core/prisma/prisma.module';
import { QuackModule } from '@/modules/quack/quack.module';
import { AuthModule } from '@/shared/auth/auth.module';
import { Module } from '@nestjs/common';
import { SavedQuacksController } from './controllers/saved-quacks.controller';
import { SavedQuackRepository } from './repositories/saved-quack.repository';
import { SavedQuacksService } from './services/saved-quacks.service';

@Module({
  imports: [AuthModule, PrismaModule, QuackModule],
  controllers: [SavedQuacksController],
  providers: [SavedQuacksService, SavedQuackRepository],
})
export class SavedModule {}
