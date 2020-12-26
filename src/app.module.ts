import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesModule } from './challenges/challenges.module';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { ConfigModule } from '@nestjs/config';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://italo:italo@cluster0.gpcne.mongodb.net/srchallenges?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    ),
    ChallengesModule,
    GamesModule,
    ProxyrmqModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
