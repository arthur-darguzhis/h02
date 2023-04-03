import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/users-schema';
import { UsersRepository } from './users/users.repository';
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
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsFactory } from './blogs/blogs.factory';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsFactory } from './posts/posts.factory';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/api/auth.controller';
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
import { BloggerCreatePostUseCase } from './blogger/application/use-cases/blogger-create-post.use-case';
import { BloggerUpdatePostUseCase } from './blogger/application/use-cases/blogger-update-post.use-case';
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
import { BloggerGetCommentsListInBlogHandler } from './blogger/application/queries/blogger-get-comments-from-current-user-blogs.query';

import { AdminBanOrUnbanBlogUseCase } from './super-admin/blogs/use-cases/admin-ban-or-unban-blog.use-case';
import { GetPostsListHandler } from './posts/application/query/get-posts-list.query';
import { GetPostsListByBlogIdHandler } from './posts/application/query/get-posts-list-by-blog-id.query';
import { PostsController } from './posts/api/posts.controller';
import { UsersPgRepository } from './users/infrastructure/users.pg-repository';
import { RegistrationUseCase } from './auth/application/use-cases/registration.use-case';
import { ConfirmRegistrationUseCase } from './auth/application/use-cases/registration-confirmation.use-case';
import { ResendRegistrationEmailUseCase } from './auth/application/use-cases/resend-registration-email.use-case';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { UserSessionsPgRepository } from './security/user-sessions-pg.repository';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout.use-case';
import { CurrentUserInfoHandler } from './auth/application/query/current-user-info.query';
import { UsersPgQueryRepository } from './users/infrastructure/users.pg-query-repository';
import { PasswordRecoveryUseCase } from './auth/application/use-cases/password-recovery.use-case';
import { PasswordRecoveryRepository } from './users/password-recovery.repository';
import { SetNewPasswordUseCase } from './auth/application/use-cases/set-new-password.use-case';
import { AdminGetUserDataByIdHandler } from './super-admin/users/query/admin-get-user-data-by-email.query';
import { GetUsersListHandler } from './super-admin/users/query/get-users-list.query';
import { UserPurgeOtherSessionsUseCase } from './security/application/use-cases/user-purge-other-sessions.use-case';
import { UserPurgeSessionUseCase } from './security/application/use-cases/user-purge-session.use-case';
import { UserSessionsListHandler } from './security/application/query/user-sessions-list.query';
import { BlogsPgRepository } from './blogs/infrastructure/blogs-pg.repository';
import { BlogUserBanRepository } from './blogs/infrastructure/blog-user-ban.repository';
import { CommentsPgRepository } from './comments/infrastructure/comments-pg.repository';
import { PostsPgRepository } from './posts/infrastructure/posts-pg.repository';
import { PostsReactionsPgRepository } from './posts/infrastructure/posts-reactions-pg.repository';
import { CommentReactionsPgRepository } from './comments/infrastructure/comment-reactions-pg.repository';
import { UserDeleteCommentUseCase } from './comments/application/use-cases/user-delete-comment.use-case';
import { BlogUsersBanFactory } from './users/blog-users-ban.factory';
import { UserUpdateCommentUseCase } from './comments/application/use-cases/user-update-comment.use-case';
import { UserMakeReactionOnCommentUseCase } from './comments/application/use-cases/user-make-reaction-on-comment.use-case';
import { UserMakeReactionOnPostUseCase } from './posts/application/use-cases/user-make-reaction-on-post.use-case';
import { AdminCreateBlogUseCase } from './super-admin/blogs/use-cases/admin-create-blog.use-case';
import { GetListOfBlogsByOwnerHandler } from './blogger/application/queries/get-list-of-blogs-by-owner.query';
import { GetBlogsListHandler } from './blogs/application/query/get-blogs-list.query';
import { GetBlogInfoHandler } from './blogs/application/query/get-blog-info.query';
import { GetCommentHandler } from './comments/application/query/get-comment.query';
import { SuperAdminGetBlogsListHandler } from './super-admin/blogs/query/super-admin-get-blogs-list.query';
import { GetPostHandler } from './posts/application/query/get-post.query';
import { GetCommentsListRelatedToPostHandler } from './comments/application/query/get-comments-list-related-to-post.query';

//TODO разбивать для других будущих модулей список их useCases.
const userUseCases = [
  AddNewUserUseCase,
  DeleteUserUseCase,
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  ResendRegistrationEmailUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  CurrentUserInfoHandler,
  PasswordRecoveryUseCase,
  SetNewPasswordUseCase,
  UserMakeReactionOnPostUseCase,
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
  AdminCreateBlogUseCase,
];

const securityUseCases = [
  UserPurgeOtherSessionsUseCase,
  UserPurgeSessionUseCase,
];

const securityQueries = [UserSessionsListHandler];

const superAdminQueries = [
  AdminGetUserDataByIdHandler,
  GetUsersListHandler,
  SuperAdminGetBlogsListHandler,
];

const commentQueries = [GetCommentHandler, GetCommentsListRelatedToPostHandler];
const commentUseCases = [
  UserDeleteCommentUseCase,
  UserUpdateCommentUseCase,
  UserMakeReactionOnCommentUseCase,
];

const blogsQueries = [GetBlogsListHandler, GetBlogInfoHandler];

const bloggerQueries = [
  BloggerGetListOfBannedUsersForBlogHandler,
  BloggerGetCommentsListInBlogHandler,
  GetListOfBlogsByOwnerHandler,
];

const postsQueries = [
  GetPostsListByBlogIdHandler,
  GetPostsListHandler,
  GetPostHandler,
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
      host: process.env.PG_HOST,
      port: 5432,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE_NAME,
      autoLoadEntities: false,
      synchronize: false,
      ssl: process.env.PG_SSL_FLAG === 'true',
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
    BlogUsersBanFactory,
    UsersRepository,
    UsersQueryRepository,
    UsersPgRepository,
    UsersPgQueryRepository,
    UserSessionsPgRepository,
    PasswordRecoveryRepository,
    AuthConfigService,
    AppConfigService,
    EmailSenderService,
    BlogsFactory,
    BlogsService,
    BlogsRepository,
    BlogsPgRepository,
    BlogsPgRepository,
    BlogUserBanRepository,
    BlogsQueryRepository,
    PostsFactory,
    PostsService,
    PostsRepository,
    PostsPgRepository,
    PostsReactionsPgRepository,
    PostsQueryRepository,
    PostReactionsFactory,
    PostReactionsRepository,
    PostsReactionsPgRepository,
    PostReactionsQueryRepository,
    CommentsFactory,
    CommentsService,
    CommentsRepository,
    CommentsPgRepository,
    CommentsQueryRepository,
    CommentReactionsFactory,
    CommentReactionsRepository,
    CommentReactionsPgRepository,
    CommentReactionsQueryRepository,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    BlogUserBansRepository,
    RefreshTokenStrategy,
    BlogExists,
    UserSessionsService,
    UserSessionsRepository,
    UserSessionsQueryRepository,
    UserSessionsFactory,
    ...userUseCases,
    ...bloggerUseCases,
    ...superAdminUseCases,
    ...securityUseCases,
    ...securityQueries,
    ...superAdminQueries,
    ...bloggerQueries,
    ...blogsQueries,
    ...postsQueries,
    ...commentUseCases,
    ...commentQueries,
  ],
})
export class AppModule {}
