import { BlogsFactory } from './blogs.factory';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogDto } from './dto/createBlogDto';
import { BlogDocument } from './blogs-schema';
import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from './dto/updateBlogDto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsFactory: BlogsFactory,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    //TODO здесь await и вот интерестно сильно ли дорогая операция генерация id? стоит ли из-за нее делать создание блога ассинхроными попробовать нагрузочно потестировать или поискать инфу в интернете?
    const newBlog = await this.blogsFactory.createNewBlog(dto);
    return this.blogsRepository.save(newBlog);
  }

  deleteBlog(blogId: string) {
    return this.blogsRepository.deleteById(blogId);
  }

  async updateBlog(blogId: string, dto: UpdateBlogDto) {
    return this.blogsRepository.updateBlog(blogId, dto);
  }
}
