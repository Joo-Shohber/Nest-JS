import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../../utils/types';
import { CURRENT_USER_KEY } from '../../utils/constants';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const payload: JwtPayloadType = request[CURRENT_USER_KEY];
    return payload;
  },
);
