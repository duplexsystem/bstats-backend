import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionService } from '../../database/connection.service';
import { RedisSoftware } from './interfaces/redis-software.interface';

@Injectable()
export class RedisSoftwareService {
  constructor(private connectionService: ConnectionService) {}

  async findSoftwareById(id: number): Promise<RedisSoftware> {
    const fields = [
      'name',
      'url',
      'globalPlugin',
      'metricsClass',
      'examplePlugin',
      'maxRequestsPerIp',
      'defaultCharts',
      'hideInPluginList',
    ];
    const response = await this.connectionService
      .getRedis()
      .hmget(`software:${id}`, fields);

    if (response == null) {
      throw new NotFoundException();
    }

    return {
      name: response[0],
      url: response[1],
      globalPlugin: parseInt(response[2]),
      metricsClass: response[3],
      examplePlugin: response[4],
      maxRequestsPerIp: parseInt(response[5]),
      defaultCharts: JSON.parse(response[6]),
      hideInPluginList: response[7] !== null,
    };
  }

  async findAllSoftwareIds(): Promise<number[]> {
    const response = await this.connectionService
      .getRedis()
      .smembers('software.ids');

    if (response == null) {
      throw new InternalServerErrorException();
    }

    return response.map((s) => parseInt(s));
  }
}