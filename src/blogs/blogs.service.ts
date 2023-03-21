import { BlogsFactory } from './blogs.factory';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogDto } from './dto/createBlog.dto';
import { BlogDocument } from './blogs-schema';
import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from './dto/updateBlog.dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsFactory: BlogsFactory,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    const newBlog = await this.blogsFactory.createNewBlog(dto);
    return this.blogsRepository.save(newBlog);
  }

  deleteBlog(blogId: string) {
    return this.blogsRepository.deleteById(blogId);
  }

  async updateBlog(blogId: string, dto: UpdateBlogDto) {
    return this.blogsRepository.updateBlog(blogId, dto);
  }

  async isBlogExists(blogId: string) {
    return this.blogsRepository.findById(blogId);
  }
}
