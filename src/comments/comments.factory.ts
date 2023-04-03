import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsFactory {
  createNewCommentPg(postId, currentUserId, content) {
    return {
      content: content,
      postId: postId,
      userId: currentUserId,
      isBanned: false,
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
    };
  }
}
