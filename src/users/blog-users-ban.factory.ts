import { Injectable } from '@nestjs/common';
import { BlogUserBan } from '../blogs/application/entities/blog-user-ban';

@Injectable()
export class BlogUsersBanFactory {
  public createBlogUserBan(blogId, userId, banReason) {
    const blogUserBan = new BlogUserBan();

    blogUserBan.blogId = blogId;
    blogUserBan.userId = userId;
    blogUserBan.isBanned = true;
    blogUserBan.banDate = new Date();
    blogUserBan.banReason = banReason;

    return blogUserBan;
  }
}
