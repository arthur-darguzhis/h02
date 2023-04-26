import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Blog } from '../application/entities/blog';
import { User } from '../../users/application/entities/user';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) {}

  async save(blog: Blog) {
    return await this.blogsRepository.save(blog);
  }

  async findByName(name: string) {
    return await this.blogsRepository.findOneBy({ name: name });
  }

  async findById(blogId: string) {
    return await this.blogsRepository.findOneBy({ id: blogId });
  }

  async getById(blogId: string) {
    const blog = await this.findById(blogId);
    if (blog === null) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return blog;
  }

  async throwIfNotExists(blogId: string): Promise<void | never> {
    const blog = await this.findById(blogId);
    if (blog === null) {
      throw new EntityNotFoundException(
        `Comment with id: ${blogId} is not found`,
      );
    }
  }

  async delete(blog: Blog) {
    await this.blogsRepository.remove(blog);
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.blogsRepository
      .createQueryBuilder()
      .update(Blog)
      .set({ isBanned })
      .where('user_id = :id', { id: userId })
      .execute();
  }
}
