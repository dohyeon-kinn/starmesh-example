import { All, Controller, HttpStatus, Query, Redirect } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/proxy')
export class ProxyController {
  @All()
  @Redirect()
  @ApiResponse({ status: HttpStatus.FOUND })
  proxy(@Query('url') url: string) {
    return { url, statusCode: HttpStatus.FOUND };
  }
}
