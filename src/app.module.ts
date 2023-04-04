import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/users-schema';
import { UsersRepository } from './users/users.repository';
import { UsersController } from './users/api/users.controller';
import { UsersFactory } from './users/users.factory';
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
import { BlogsFactory } from './blogs/blogs.factory';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsFactory } from './posts/posts.factory';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/api/auth.controller';
import { AuthService } from './auth/infrastructure/auth.service';
import { GlobalServicesModule } from './global-services/global-services.module';
import { EmailSenderService } from './global-services/email-sender.service';
import { BasicStrategy } from './auth/infrastructure/strategies/basic.strategy';
import { LocalStrategy } from './auth/infrastructure/strategies/local.strategy';
import { JwtStrategy } from './auth/infrastructure/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { RefreshTokenStrategy } from './auth/infrastructure/strategies/refresh-token.strategy';
import { UserSessionsFactory } from './security/user-sessions.factory';
import { ThrottlerModule } from '@nestjs/throttler';
import { getConfiguration } from './configuration';
import { AuthConfigService } from './auth/infrastructure/auth-config.service';
import { AppConfigService } from './app-config.service';
import { AddNewUserUseCase } from './users/application/use-cases/add-new-user.use-case';
import { DeleteUserUseCase } from './users/application/use-cases/delete-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BloggerController } from './blogger/api/blogger.controller';
import { BloggerCreateBlogUseCase } from './blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerUpdateBlogUseCase } from './blogger/application/use-cases/blogger-update-blog.use-case';
import { BloggerDeleteBlogUseCase } from './blogger/application/use-cases/blogger-delete-blog.use-case';
import { BloggerCreatePostUseCase } from './blogger/application/use-cases/blogger-create-post';
import { BloggerUpdatePostUseCase } from './blogger/application/use-cases/blogger-update-post';
import { BloggerDeletePostUseCase } from './blogger/application/use-cases/blogger-delete-post.use-case';
import { AdminSetOwnerToOrphanBlogUseCase } from './super-admin/blogs/use-cases/admin-set-owner-to-orphan-blog.use-case';
import { SuperAdminBlogsController } from './super-admin/blogs/api/super-admin.blogs.controller';
import { SuperAdminUsersController } from './super-admin/users/super-admin.users.controller';
import { AdminBanOrUnbanUserUseCase } from './super-admin/users/use-cases/admin-ban-or-unban-user.use-case';
import { AdminAddNewUserUseCase } from './super-admin/users/use-cases/admin-add-new-user.use-case';
import { AdminDeleteUserByIdUseCase } from './super-admin/users/use-cases/admin-delete-user-by-id.use-case';
import { UserAddCommentUseCase } from './posts/application/use-cases/user-add-comment.use-case';
import { BloggerBanUserUseCase } from './blogger/application/use-cases/blogger-ban-user.use-case';
import {
  BlogUserBans,
  BlogUserBansSchema,
} from './blogs/blog-user-bans-schema';
import { BlogUserBansRepository } from './blogs/blog-user-bans.repository';
import { BloggerGetListOfBannedUsersForBlogHandler } from './blogger/application/queries/blogger-get-list-of-banned-users-in-blog.query';
import { BloggerGetCommentsListInBlogHandler } from './blogger/application/queries/blogger-get-comments-for-current-user-blogs.query';

import { AdminBanOrUnbanBlogUseCase } from './super-admin/blogs/use-cases/admin-ban-or-unban-blog.use-case';
import { GetPaginatedPostsListHandler } from './posts/application/query/get-paginated-posts-list';
import { GetPaginatedPostsListByBlogIdHandler } from './posts/application/query/get-paginated-posts-list-by-blog-id.query';
import { PostsController } from './posts/api/posts.controller';
import { UsersPgRepository } from './users/users.pg-repository';
import { RegistrationUseCase } from './auth/application/use-cases/registration.use-case';
import { ConfirmRegistrationUseCase } from './auth/application/use-cases/registration-confirmation.use-case';
import { ResendRegistrationEmailUseCase } from './auth/application/use-cases/resend-registration-email.use-case';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { UserSessionsPgRepository } from './security/user-sessions-pg.repository';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';

//TODO разбивать для других будущих модулей список их useCases.
const userUseCases = [
  AddNewUserUseCase,
  DeleteUserUseCase,
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  ResendRegistrationEmailUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
];
const bloggerUseCases = [
  BloggerCreateBlogUseCase,
  BloggerUpdateBlogUseCase,
  BloggerDeleteBlogUseCase,
  BloggerCreatePostUseCase,
  BloggerUpdatePostUseCase,
  BloggerDeletePostUseCase,
  AdminBanOrUnbanUserUseCase,
  AdminAddNewUserUseCase,
  AdminDeleteUserByIdUseCase,
  BloggerBanUserUseCase,
  UserAddCommentUseCase,
];

const superAdminUseCases = [
  AdminSetOwnerToOrphanBlogUseCase,
  AdminBanOrUnbanBlogUseCase,
];

const bloggerQueries = [
  BloggerGetListOfBannedUsersForBlogHandler,
  BloggerGetCommentsListInBlogHandler,
];

const postsQueries = [
  GetPaginatedPostsListByBlogIdHandler,
  GetPaginatedPostsListHandler,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      load: [getConfiguration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1111',
      database: 'h03',
      autoLoadEntities: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([]),
    ThrottlerModule.forRoot({
      ttl: 10, // Time to live (seconds)
      limit: 5, // Request limit
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: BlogUserBans.name, schema: BlogUserBansSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
      { name: PostReaction.name, schema: PostReactionSchema },
      { name: UserSessions.name, schema: UserSessionsSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
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
    BloggerController,
    SuperAdminBlogsController,
    SuperAdminUsersController,
  ],
  providers: [
    ConfigService,
    AppService,
    TestingService,
    UsersFactory,
    UsersRepository,
    UsersQueryRepository,
    UsersPgRepository,
    UserSessionsPgRepository,
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
    BlogUserBansRepository,
    // RefreshTokenStrategy,
    BlogExists,
    UserSessionsService,
    UserSessionsRepository,
    UserSessionsQueryRepository,
    UserSessionsFactory,
    ...userUseCases,
    ...bloggerUseCases,
    ...superAdminUseCases,
    ...bloggerQueries,
    ...postsQueries,
  ],
})
export class AppModule {}
