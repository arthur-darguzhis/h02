import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Post } from '../application/entities/post';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async save(post: Post) {
    return await this.postsRepository.save(post);
  }

  async findByTitleAndBlog(
    title: string,
    blogId: string,
  ): Promise<Post | null> {
    return await this.postsRepository
      .createQueryBuilder('post')
      .where('post.title = :title', { title })
      .andWhere('post.blogId = :blogId', { blogId })
      .getOne();
  }

  async findById(postId: string) {
    return this.postsRepository.findOneBy({ id: postId });
  }

  async getById(postId: string) {
    const post = await this.findById(postId);
    if (post === null) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return post;
  }

  async delete(post: Post) {
    await this.postsRepository.remove(post);
  }

  async throwIfNotExists(postId: string): Promise<void | never> {
    const post = await this.findById(postId);
    if (post === null) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
  }

  async setBanStatusByBlogId(blogId: string, isBanned: boolean) {
    const banDate = isBanned ? new Date() : null;
    await this.dataSource.query(
      `UPDATE blogs SET is_banned = $1, ban_date = $2 WHERE id = $3`,
      [isBanned, banDate, blogId],
    );

    await this.postsRepository
      .createQueryBuilder()
      .update(Post)
      .set({ isBanned })
      .where('blogId = :blogId', { id: blogId })
      .execute();
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.postsRepository
      .createQueryBuilder()
      .update(Post)
      .set({ isBanned })
      .where('userId = :id', { id: userId })
      .execute();
  }

  async recalculatePostReactionsAfterUserBan(userId: string) {
    await this.dataSource.query(
      `UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_reactions as pr WHERE pr.post_id = posts.id AND pr.status = 'Like' AND pr.is_banned = false),
                 dislikes_count = (SELECT COUNT(*) FROM post_reactions as pr WHERE pr.post_id = posts.id AND pr.status = 'Dislike' AND pr.is_banned = false),
                 newest_likes = (SELECT ARRAY(SELECT 
                                          json_build_object(
                                            'addedAt', pr.created_at,
                                            'userId', pr.user_id,
                                            'login', u.login
                                          )
                                 FROM post_reactions as pr
                                        JOIN users u on pr.user_id = u.id
                                 WHERE post_id = posts.id AND pr.status = 'Like' AND pr.is_banned = false
                                 ORDER BY pr.created_at DESC
                                 LIMIT 3) as likesInfo)
             WHERE id IN (SELECT post_id FROM post_reactions WHERE post_reactions.user_id = $1)`,
      [userId],
    );
  }
}
