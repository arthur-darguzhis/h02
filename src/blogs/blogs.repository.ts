import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from './api/dto/updateBlog.dto';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async save(blogModel: BlogDocument): Promise<BlogDocument> {
    return blogModel.save();
  }

  async findById(blogId: string): Promise<BlogDocument | null> {
    return this.blogModel.findById(blogId);
  }

  async getById(blogId: string): Promise<BlogDocument | never> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return blog;
  }

  async deleteById(blogId: string): Promise<true | never> {
    const isRemoved = await this.blogModel.findByIdAndRemove(blogId);

    if (!isRemoved) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return true;
  }

  async updateBlog(blogId: string, dto: UpdateBlogDto): Promise<true | never> {
    const isUpdated = await this.blogModel.findByIdAndUpdate(blogId, dto, {
      new: true,
    });
    if (!isUpdated) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return true;
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.blogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      { $set: { isBanned } },
    );
  }
}
