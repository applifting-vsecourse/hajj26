import { QuackResponseDto } from '@/modules/quack/controllers/dto/quack.response.dto';
import { SavedQuacksService } from '@/modules/saved/services/saved-quacks.service';
import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Skeleton only: the routes exist so the tests can call them, and every one
// answers 501 until Saved is implemented (see cases.md).
@ApiTags('saved')
@Controller('saved')
export class SavedQuacksController {
  constructor(private readonly savedQuacksService: SavedQuacksService) {}

  @Get()
  async list(): Promise<QuackResponseDto[]> {
    throw new NotImplementedException('GET /saved is not implemented');
  }

  @Put(':quackId')
  async save(@Param('quackId') quackId: string): Promise<void> {
    throw new NotImplementedException(
      `PUT /saved/${quackId} is not implemented`,
    );
  }

  @Delete(':quackId')
  async unsave(@Param('quackId') quackId: string): Promise<void> {
    throw new NotImplementedException(
      `DELETE /saved/${quackId} is not implemented`,
    );
  }
}
