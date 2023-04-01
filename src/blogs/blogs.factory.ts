import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { CreateBlogDto } from './dto/createBlog.dto';
import { UsersRepository } from '../users/users.repository';
import { BloggerCreateBlogCommand } from '../blogger/application/use-cases/blogger-create-blog.use-case';

@Injectable()
export class BlogsFactory {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private usersRepository: UsersRepository,
  ) {}

  public async adminCreateBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    return this.blogModel.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
    });
  }

  async bloggerCreateBlog(dto: BloggerCreateBlogCommand) {
    const user = await this.usersRepository.getById(dto.userId);

    return this.blogModel.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: dto.userId,
        userLogin: user.login,
      },
      isBanned: false,
      banDate: null,
    });
  }
}
