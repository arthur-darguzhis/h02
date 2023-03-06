import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/users-schema';
import { UsersRepository } from './users/users.repository';
import { UsersController } from './users/users.controller';
import { UsersFactory } from './users/users.factory';
import { UsersService } from './users/users.service';
import { UsersQueryRepository } from './users/users.query.repository';
import { TestingController } from './testing/testing.controller';
import { TestingService } from './testing/testing.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsFactory } from './comments/comments.factory';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { Comment, CommentSchema } from './comments/comments-schema';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { Blog, BlogSchema } from './blogs/blogs-schema';
import { Post, PostSchema } from './posts/posts-schema';
import { BlogsController } from './blogs/blogs.controller';
import { PostsController } from './posts/posts.controller';
import { BlogsFactory } from './blogs/blogs.factory';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsFactory } from './posts/posts.factory';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { GlobalServicesModule } from './global-services/global-services.module';
import { EmailSenderService } from './global-services/email-sender.service';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import {
  CommentReaction,
  CommentReactionSchema,
} from './comments/comment-reaction-schema';
import { CommentReactionsRepository } from './comments/comment-reactions.repository';
import { CommentReactionsQueryRepository } from './comments/comment-reactions.query-repository';
import { CommentReactionsFactory } from './comments/comment-reactions.factory';
import { PostReaction, PostReactionSchema } from './posts/post-reaction-schema';
import { PostReactionsFactory } from './posts/post-reaction.factory';
import { PostReactionsRepository } from './posts/post-reactions.repository';
import { PostReactionsQueryRepository } from './posts/post-reactions.query-repository';
import { BlogExists } from './common/customValidations/blog-exists';
import {
  UserSessions,
  UserSessionsSchema,
} from './security/user-sessions-schema';
import { UserSessionsRepository } from './security/user-sessions.repository';
import { UserSessionsQueryRepository } from './security/user-sessions.query-repository';
import { UserSessionsService } from './security/user-sessions.service';
import { SecurityController } from './security/security.controller';
import { RefreshTokenStrategy } from './auth/strategies/refresh-token.strategy';
import { UserSessionsFactory } from './security/user-sessions.factory';
import { ThrottlerModule } from '@nestjs/throttler';
import { getConfiguration } from './configuration';
import { AuthConfigService } from './auth/auth-config.service';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfiguration],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 10, // Time to live (seconds)
      limit: 5, // Request limit
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
      { name: PostReaction.name, schema: PostReactionSchema },
      { name: UserSessions.name, schema: UserSessionsSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10s' },
    }),
    GlobalServicesModule,
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    AuthController,
    BlogsController,
    PostsController,
    CommentsController,
    SecurityController,
  ],
  providers: [
    ConfigService,
    AppService,
    TestingService,
    UsersFactory,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    AuthConfigService,
    AppConfigService,
    EmailSenderService,
    BlogsFactory,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsFactory,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    PostReactionsFactory,
    PostReactionsRepository,
    PostReactionsQueryRepository,
    CommentsFactory,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    CommentReactionsFactory,
    CommentReactionsRepository,
    CommentReactionsQueryRepository,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    // RefreshTokenStrategy,
    BlogExists,
    UserSessionsService,
    UserSessionsRepository,
    UserSessionsQueryRepository,
    UserSessionsFactory,
  ],
})
export class AppModule {}
