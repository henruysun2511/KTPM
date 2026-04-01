import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Schema } from '@nestjs/mongoose';
import { Expose, ExposeOptions, Transform, TransformFnParams } from 'class-transformer';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); //key:value

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message);

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

export const IS_PUBLIC_PERMISSION = 'isPublicPermission';
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_PERMISSION, true);

export function WithTimestamps() {
  return Schema({ timestamps: true, versionKey: false });
}

export const ExposeId = (options?: ExposeOptions) => (target: object, propertyKey: string) => {
  Transform(({ obj }: TransformFnParams) => obj[propertyKey])(target, propertyKey);
  Expose(options)(target, propertyKey);
};

export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
