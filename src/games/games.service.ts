import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGame } from './interfaces/games.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { IChallenge } from 'src/challenges/interfaces/challenge.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel('Game') private readonly gameModel: Model<IGame>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(GamesService.name);

  private clientChallenges = this.clientProxySmartRanking.getClientProxyChallengesInstance();

  private clientRankings = this.clientProxySmartRanking.getClientProxyRankingInstance()

  async createGame(game: IGame): Promise<IGame> {
    try {
      const gameCreated = new this.gameModel(game);
      this.logger.log(`partidaCriada: ${JSON.stringify(gameCreated)}`);

      const result = await gameCreated.save();
      this.logger.log(`result: ${JSON.stringify(result)}`);
      const idGame = result._id;

      const challenge: IChallenge = await this.clientChallenges
        .send('get-challenges', { idPlayer: '', _id: game.challenge })
        .toPromise();

      await this.clientChallenges
        .emit('update-challenge-game', { idGame: idGame, challenge })
        .toPromise();
      
        return this.clientRankings.emit('game-processing', {idGame, game}).toPromise()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
