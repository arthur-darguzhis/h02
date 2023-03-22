import { BlogDocument } from './blogs-schema';

export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
};

export const mapBlogToViewModel = (blog: BlogDocument): BlogViewModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt,
  };
};

export type BlogViewModelWithOwnerInfo = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
};

export const mapBlogToViewModelWithOwnerInfo = (
  blog: BlogDocument,
): BlogViewModelWithOwnerInfo => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt,
    blogOwnerInfo: blog.blogOwnerInfo,
  };
};
