import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  message: string;
  responseTime?: number;
}

export const healthService = {
  /**
   * Check backend health with a quick timeout
   * @param timeoutMs - Timeout in milliseconds (default: 5000ms)
   * @returns Health status
   */
  async checkHealth(timeoutMs: number = 5000): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Create a separate axios instance with a shorter timeout for health checks
      const healthCheckClient = axios.create({
        baseURL: API_URL,
        timeout: timeoutMs,
      });

      const response = await healthCheckClient.get('/health');
      const responseTime = Date.now() - startTime;

      if (response.data?.status === 'healthy') {
        return {
          status: 'healthy',
          message: 'Backend is responsive',
          responseTime,
        };
      }

      return {
        status: 'unhealthy',
        message: 'Backend returned unexpected status',
        responseTime,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          status: 'unhealthy',
          message: `Backend did not respond within ${timeoutMs}ms`,
          responseTime,
        };
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return {
          status: 'unhealthy',
          message: 'Cannot connect to backend. Is it running?',
          responseTime,
        };
      }

      return {
        status: 'unhealthy',
        message: error.response?.data?.detail || error.message || 'Unknown error',
        responseTime,
      };
    }
  },

  /**
   * Quick health check with default 3 second timeout
   */
  async quickCheck(): Promise<boolean> {
    const result = await this.checkHealth(3000);
    return result.status === 'healthy';
  },
};

