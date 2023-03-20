import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { CreateBlogDto } from './dto/createBlog.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class BlogsFactory {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    private usersRepository: UsersRepository,
  ) {}

  public async createNewBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    return this.blogModel.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
    });
  }

  async bloggerCreateBlog(dto: CreateBlogDto, userId: any) {
    const user = await this.usersRepository.getById(userId);

    return this.blogModel.create({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: userId,
        userLogin: user.login,
      },
    });
  }
}
