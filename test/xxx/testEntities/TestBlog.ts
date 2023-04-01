import { HttpServer } from '@nestjs/common';

export class TestBlog {
  static storage: Map<string, TestBlog> = new Map();

  constructor(
    private app: HttpServer,
    public id: string,
    public name: string,
  ) {}
}
