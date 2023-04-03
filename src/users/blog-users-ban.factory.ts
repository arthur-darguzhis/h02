import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogUsersBanFactory {
  public createBlogUserBan(blogId, userId, banReason) {
    return {
      blogId: blogId,
      userId: userId,
      isBanned: true,
      banDate: new Date(),
      banReason: banReason,
    };
  }
}
