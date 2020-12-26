import { Document } from 'mongoose';
import { ChallengeStatus } from '../challenge-status.enum';

export interface IChallenge extends Document {
  dateHourChallenge: Date;
  status: ChallengeStatus;
  dateHourRequester: Date;
  dateHourResponse?: Date;
  requester: string;
  category: string;
  players: string[];
  game?: string;
}
