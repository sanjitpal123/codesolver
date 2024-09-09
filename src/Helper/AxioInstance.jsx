import axios from 'axios';
import { BaseUrl } from './BaseUrl';


const api = axios.create({
  baseURL: BaseUrl, 
});

export default api;
