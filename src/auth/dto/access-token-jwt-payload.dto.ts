//TODO подумать может тот payload что помещается в JWT токен стоит для него сделать шаблонную структуру или dto что бы переиспользовать? или пусть захардкоженно будет?
export class AccessTokenJwtPayloadDto {
  userId: string;
}
