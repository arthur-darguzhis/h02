import { PostDocument, PostNewestLikes } from './posts-schema';

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    newestLikes: Array<PostNewestLikes>;
    myStatus: string;
  };
  createdAt: string;
};

const mapPostNewestLikes = (newestLike: PostNewestLikes): PostNewestLikes => {
  return {
    addedAt: newestLike.addedAt,
    userId: newestLike.userId,
    login: newestLike.login,
  };
};

export const mapPostToViewModel = (
  post: PostDocument,
  myStatus = 'None', //TODO вернуть вот эту штучку. LikeOfPost.LIKE_STATUS_OPTIONS.NONE,
): PostViewModel => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      newestLikes: post.extendedLikesInfo.newestLikes.map(mapPostNewestLikes),
      myStatus: myStatus,
    },
  };
};
