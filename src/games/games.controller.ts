import { Controller, Logger } from '@nestjs/common';
import { GamesService } from './games.service';
import { EventPattern, Payload, RmqContext, Ctx } from '@nestjs/microservices';
import { IGame } from './interfaces/games.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  private readonly logger = new Logger(GamesController.name);

  @EventPattern('create-game')
  async createGame(@Payload() game: IGame, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`game: ${JSON.stringify(game)}`);
      await this.gamesService.createGame(game);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.filter(ackError =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }
}
