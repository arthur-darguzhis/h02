import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs-schema';
import { Model } from 'mongoose';
import { BlogViewModel, mapBlogToViewModel } from './blog.mapper';
import { Injectable } from '@nestjs/common';
import { PaginationBlogListDto } from './dto/paginationBlogList.dto';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getById(blogId: string): Promise<BlogViewModel | never> {
    const blog = await this.blogModel.findById(blogId);
    if (!blog) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return mapBlogToViewModel(blog);
  }

  async getPaginatedBlogsList(dto: PaginationBlogListDto) {
    const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = dto;
    let filter = {};
    if (searchNameTerm) {
      filter = { name: { $regex: searchNameTerm, $options: 'i' } };
    }

    const count = await this.blogModel.countDocuments(filter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: direction })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: blogs.map(mapBlogToViewModel),
    };
  }

  async getPaginatedBlogsListByOwner(
    dto: PaginationBlogListDto,
    userId: string,
  ) {
    const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = dto;
    const filter = { 'blogOwnerInfo.userId': userId };
    if (searchNameTerm) {
      filter['name'] = { $regex: searchNameTerm, $options: 'i' };
    }

    const count = await this.blogModel.countDocuments(filter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: direction })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: blogs.map(mapBlogToViewModel),
    };
  }
}
