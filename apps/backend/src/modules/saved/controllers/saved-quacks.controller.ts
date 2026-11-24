import { QuackResponseDto } from '@/modules/quack/controllers/dto/quack.response.dto';
import { SavedQuacksService } from '@/modules/saved/services/saved-quacks.service';
import { User } from '@/shared/auth/decorators/user.decorator';
import { Identity } from '@/shared/auth/domain/identity';
import { AuthenticatedUserGuard } from '@/shared/auth/guards/authenticated-user.guard';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListSavedQuacksQueryDto } from './dto/list-saved-quacks.query.dto';

@ApiTags('saved')
@Controller('saved')
@UseGuards(AuthenticatedUserGuard)
@ApiCookieAuth()
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class SavedQuacksController {
  constructor(private readonly savedQuacksService: SavedQuacksService) {}

  @Get()
  @ApiOperation({
    summary: 'Your saved quacks, the most recently saved first',
  })
  @ApiResponse({ status: 200, type: [QuackResponseDto] })
  @ApiResponse({
    status: 400,
    description: 'Takes no parameters — Saved is always your own',
  })
  @ApiResponse({ status: 401, description: 'Not signed in' })
  async list(
    @User() user: Identity,
    // Declared only so the validation pipe rejects any query parameter.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() _query: ListSavedQuacksQueryDto,
  ): Promise<QuackResponseDto[]> {
    const quacks = await this.savedQuacksService.getSavedQuacks(user);
    return quacks.map(QuackResponseDto.fromDomain);
  }

  @Put(':quackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Save a quack (saving it again changes nothing)' })
  @ApiResponse({ status: 204, description: 'Saved' })
  @ApiResponse({ status: 401, description: 'Not signed in' })
  @ApiResponse({ status: 404, description: 'No quack with this id' })
  async save(
    @User() user: Identity,
    @Param('quackId') quackId: string,
  ): Promise<void> {
    await this.savedQuacksService.saveQuack(user, quackId);
  }

  @Delete(':quackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a quack from Saved (removing an unsaved one is fine)',
  })
  @ApiResponse({ status: 204, description: 'Not in Saved any more' })
  @ApiResponse({ status: 401, description: 'Not signed in' })
  async unsave(
    @User() user: Identity,
    @Param('quackId') quackId: string,
  ): Promise<void> {
    await this.savedQuacksService.unsaveQuack(user, quackId);
  }
}
