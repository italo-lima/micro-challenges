import { Schema } from 'mongoose';

export const ChallengeSchema = new Schema(
  {
    dateHourChallenge: { type: Date },
    status: { type: String },
    dateHourRequester: { type: Date },
    dateHourResponse: { type: Date },
    requester: { type: Schema.Types.ObjectId },
    category: { type: String },
    players: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
  },
  {
    timestamps: true,
    collection: 'challenges',
  },
);
