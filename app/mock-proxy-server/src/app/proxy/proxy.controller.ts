import { All, Controller, Header, HttpStatus, Query, Redirect } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('/proxy')
export class ProxyController {
  @All()
  @Header('Cache-Control', 'no-cache')
  @Redirect()
  @ApiResponse({ status: HttpStatus.FOUND })
  proxy(@Query('url') url: string) {
    return { url, statusCode: HttpStatus.FOUND };
  }
}
