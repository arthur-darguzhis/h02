import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { CreateBlogDto } from './dto/createBlogDto';

@Injectable()
export class BlogsFactory {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  public async createNewBlog(
    createBlogDto: CreateBlogDto,
  ): Promise<BlogDocument> {
    return this.blogModel.create({
      name: createBlogDto.name,
      description: createBlogDto.description,
      websiteUrl: createBlogDto.websiteUrl,
    });
  }
}
