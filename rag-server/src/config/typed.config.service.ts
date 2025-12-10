// config/typed.config.service.ts
import { ConfigService } from '@nestjs/config';
import { ConfigTypes } from './config.types';
// import { Injectable } from '@nestjs/common';

// @Injectable()
export class TypedConfigService extends ConfigService<ConfigTypes> {}
