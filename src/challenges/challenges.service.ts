import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChallenge } from './interfaces/challenge.interface';
import { ChallengeStatus } from './challenge-status.enum';
import * as momentTimezone from 'moment-timezone';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge')
    private readonly challengeModel: Model<IChallenge>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  private clientNotifications = this.clientProxySmartRanking.getClientProxyNotificationsInstance();

  async createChallenge(challenge: IChallenge): Promise<IChallenge> {
    try {
      const challengeCreated = new this.challengeModel(challenge);
      challengeCreated.dateHourRequester = new Date();

      challengeCreated.status = ChallengeStatus.PENDING;
      this.logger.log(`challengeCreated: ${JSON.stringify(challengeCreated)}`);
      await challengeCreated.save();

      return await this.clientNotifications
        .emit('notification-new-challenge', challenge)
        .toPromise();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getAllChallenges(): Promise<IChallenge[]> {
    try {
      return await this.challengeModel.find();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengeByPlayer(_id: any): Promise<IChallenge[] | IChallenge> {
    try {
      return await this.challengeModel
        .find()
        .where('players')
        .in(_id);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengeById(_id: any): Promise<IChallenge> {
    try {
      return await this.challengeModel.findOne({ _id });
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateChallenge(_id: string, challenge: IChallenge): Promise<void> {
    try {
      challenge.dateHourResponse = new Date();
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async destroyChallenge(challenge: IChallenge): Promise<void> {
    try {
      const { _id } = challenge;

      challenge.status = ChallengeStatus.CANCELED;
      this.logger.log(`chalenge: ${JSON.stringify(challenge)}`);
      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateChallengeGame(
    idGame: string,
    challenge: IChallenge,
  ): Promise<void> {
    try {
      challenge.status = ChallengeStatus.ACCOMPLISHED;
      challenge.game = idGame;
      await this.challengeModel
        .findOneAndUpdate({ _id: challenge._id }, { $set: challenge })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengesAccommplishedByDate(
    idCategory: string,
    dateRef: string,
  ): Promise<IChallenge[]> {
    try {
      const dataRefNew = `${dateRef} 23:59:59.999`;

      return await this.challengeModel
        .find()
        .where('category')
        .equals(idCategory)
        .where('status')
        .equals(ChallengeStatus.ACCOMPLISHED)
        .where('dateHourChallenge')
        .lte(
          momentTimezone(dataRefNew)
            .tz('UTC')
            .format('YYYY-MM-DD HH:mm:ss.SSS+00:00'),
        );
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getChallengesAccommplished(idCategory: string): Promise<IChallenge[]> {
    try {
      const response = await this.challengeModel
        .find()
        .where('category')
        .equals(idCategory)
        .where('status')
        .equals(ChallengeStatus.ACCOMPLISHED);
      this.logger.log(`response ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
