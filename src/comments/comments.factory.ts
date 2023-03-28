import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { UsersRepository } from '../users/users.repository';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class CommentsFactory {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createNewComment(
    postId: string,
    postOwnerId: string,
    userId: string,
    content: string,
  ) {
    const user = await this.usersRepository.getById(userId);
    const post = await this.postsRepository.getById(postId);

    return this.commentModel.create({
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: user.login,
      },
      postId: postId,
      postInfo: {
        id: post.id,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
        postOwnerId: postOwnerId,
      },
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}
