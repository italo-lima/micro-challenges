import { Controller, Logger } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { IChallenge } from './interfaces/challenge.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class ChallengesController {
  constructor(private readonly challengeService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @EventPattern('create-challenge')
  async criarDesafio(
    @Payload() challenge: IChallenge,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`challenge: ${JSON.stringify(challenge)}`);
      await this.challengeService.createChallenge(challenge);
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

  @MessagePattern('get-challenges')
  async consultarDesafios(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<IChallenge[] | IChallenge> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      const { idPlayer, _id } = data;
      this.logger.log(`data: ${JSON.stringify(data)}`);
      if (idPlayer) {
        return await this.challengeService.getChallengeByPlayer(idPlayer);
      } else if (_id) {
        return await this.challengeService.getChallengeById(_id);
      } else {
        return await this.challengeService.getAllChallenges();
      }
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('update-challenge')
  async atualizarDesafio(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);
      const _id: string = data.id;
      const challenge: IChallenge = data.challenge;
      await this.challengeService.updateChallenge(_id, challenge);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter(ackError =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('delete-challenge')
  async deletarDesafio(
    @Payload() challenge: IChallenge,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.challengeService.destroyChallenge(challenge);
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

  @EventPattern('update-challenge-game')
  async updateChallengeGame(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      this.logger.log(`idGame: ${data}`);
      const idGame: string = data.idGame;
      const challenge: IChallenge = data.challenge;
      await this.challengeService.updateChallengeGame(idGame, challenge);
      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter(ackError =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('get-challenges-accommplished')
  async getChallengesAccommplished(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<IChallenge[] | IChallenge> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { idCategory, dateRef } = payload;
      this.logger.log(`data: ${JSON.stringify(payload)}`);
      if (dateRef) {
        return await this.challengeService.getChallengesAccommplishedByDate(
          idCategory,
          dateRef,
        );
      }

      return await this.challengeService.getChallengesAccommplished(idCategory);
    } finally {
      await channel.ack(originalMsg);
    }
  }
}
