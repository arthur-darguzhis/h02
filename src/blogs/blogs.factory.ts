import { Injectable } from '@nestjs/common';
import { Blog } from './application/entities/blog';

@Injectable()
export class BlogsFactory {
  public adminCreateBlog(name, description, websiteUrl) {
    const blog = new Blog();

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.userId = null;
    blog.isBanned = false;
    blog.banDate = null;

    return blog;
  }

  bloggerCreateBlog(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ) {
    const blog = new Blog();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.userId = userId;
    blog.isBanned = false;
    blog.banDate = null;

    return blog;
  }
}
