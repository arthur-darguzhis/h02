import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsFactory {
  public adminCreateBlogPg(name, description, websiteUrl) {
    return {
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date(),
      isMembership: false,
      userId: null,
      isBanned: false,
      banDate: null,
    };
  }

  bloggerCreateBlogPg(
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ) {
    return {
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date(),
      isMembership: false,
      userId: userId,
      isBanned: false,
      banDate: null,
    };
  }
}
