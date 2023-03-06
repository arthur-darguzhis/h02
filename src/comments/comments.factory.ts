import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { AddCommentToPostDto } from '../posts/dto/add-comment-to-post.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CommentsFactory {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private usersRepository: UsersRepository,
  ) {}

  async createNewComment(
    postId: string,
    userId: string,
    dto: AddCommentToPostDto,
  ) {
    const user = await this.usersRepository.getById(userId);

    return this.commentModel.create({
      content: dto.content,
      commentatorInfo: {
        userId: userId,
        userLogin: user.login,
      },
      postId: postId,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}
