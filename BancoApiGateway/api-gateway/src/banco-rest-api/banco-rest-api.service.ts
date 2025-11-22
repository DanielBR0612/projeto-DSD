import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BancoRestApiService {
  private baseUrl = 'http://localhost:8081';

  async get(endpoint: string) {
    const response = await axios.get(`${this.baseUrl}/${endpoint}`);
    return response.data;
  }

  async post(endpoint: string, data: any) {
    const response = await axios.post(`${this.baseUrl}/${endpoint}`, data);
    return response.data;
  }
}
