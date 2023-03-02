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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    AppService,
    TestingService,
    UsersFactory,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BlogsFactory,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsFactory,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsFactory,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class AppModule {}
