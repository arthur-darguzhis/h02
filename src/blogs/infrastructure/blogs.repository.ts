import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Blog } from '../application/entities/blog';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) {}

  async saveNewBlog(blog: {
    createdAt: Date;
    websiteUrl: string;
    name: string;
    isMembership: boolean;
    description: string;
    isBanned: boolean;
    banDate: null;
    userId: string;
  }) {
    const query = `
    INSERT INTO blogs (
        name,
        description,
        website_url,
        is_membership,
        created_at,
        user_id,
        is_banned,
        ban_date
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;

    const result = await this.dataSource.query(query, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.isMembership,
      blog.createdAt,
      blog.userId,
      blog.isBanned,
      blog.banDate,
    ]);

    return result[0].id;
  }

  async findByName(name: string) {
    const blog = await this.dataSource.query(
      `SELECT 
          id,
          name,
          description,
          website_url as "websiteUrl", 
          is_membership as "isMembership", 
          created_at as "createdAt",
          user_id as "userId",
          is_banned as "isBanned", 
          ban_date as "banDate"
        FROM blogs WHERE name = $1`,
      [name],
    );

    return blog[0] || null;
  }

  async findById(blogId: string) {
    const blog = await this.dataSource.query(
      `SELECT 
          id,
          name,
          description,
          website_url as "websiteUrl", 
          is_membership as "isMembership", 
          created_at as "createdAt",
          user_id as "userId",
          is_banned as "isBanned", 
          ban_date as "banDate"
        FROM blogs WHERE id = $1`,
      [blogId],
    );
    return blog[0] || null;
  }

  async getById(blogId: string) {
    const blog = await this.findById(blogId);

    if (!blog) {
      throw new EntityNotFoundException(`Blog with id: ${blogId} is not found`);
    }
    return blog;
  }

  async throwIfNotExists(blogId: string): Promise<void | never> {
    const blog = await this.findById(blogId);
    if (!blog) {
      throw new EntityNotFoundException(
        `Comment with id: ${blogId} is not found`,
      );
    }
  }

  async delete(blogId: string, userId: string) {
    await this.dataSource.query(
      `DELETE FROM blogs WHERE id = $1 AND user_id = $2`,
      [blogId, userId],
    );
  }

  async update(blog: any) {
    await this.dataSource.query(
      `UPDATE blogs SET name = $1, description = $2, website_url = $3 WHERE id = $4`,
      [blog.name, blog.description, blog.websiteUrl, blog.id],
    );
  }

  async updateOwner(userId: string, blogId: string) {
    await this.dataSource.query(`UPDATE blogs SET user_id = $1 WHERE id = $2`, [
      userId,
      blogId,
    ]);
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE blogs SET is_banned = $1 WHERE user_id = $2`,
      [isBanned, userId],
    );
  }
}
