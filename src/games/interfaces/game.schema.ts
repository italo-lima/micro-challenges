import { Schema } from 'mongoose';

export const GameSchema = new Schema(
  {
    challenge: { type: Schema.Types.ObjectId },
    category: { type: Schema.Types.ObjectId },
    players: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    def: { type: Schema.Types.ObjectId },
    result: [{ set: { type: String } }],
  },
  { timestamps: true, collection: 'games' },
);
