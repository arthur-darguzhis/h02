import { Injectable } from '@nestjs/common';
import { Comment } from './application/entities/comment';

@Injectable()
export class CommentsFactory {
  createNewCommentPg(postId, currentUserId, content) {
    const comment = new Comment();

    comment.content = content;
    comment.postId = postId;
    comment.userId = currentUserId;
    comment.isBanned = false;
    comment.createdAt = new Date();
    comment.likesCount = 0;
    comment.dislikesCount = 0;

    return comment;
  }
}
