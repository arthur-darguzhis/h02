import {
  CommentatorInfo,
  CommentDocument,
  CommentLikeInfo,
} from './comments-schema';

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: CommentLikeInfo & { myStatus: string };
};

export const mapCommentToViewModel = (
  comment: CommentDocument,
  myStatus = 'none', //TODO когда внедрю лайки обязательно исправить вот этот моментLikeOfComment.LIKE_STATUS_OPTIONS.NONE,
): CommentViewModel => {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: myStatus,
    },
  };
};
