import { useEffect, useState } from 'react';
import { healthService, type HealthStatus } from '../services/health.service';

export const BackendStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking', message: 'Checking...' });

  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthService.checkHealth(3000);
      setHealth(result);
    };

    checkHealth();
    // Optionally check periodically
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'text-green-400';
      case 'unhealthy':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return '●';
      case 'unhealthy':
        return '●';
      default:
        return '●';
    }
  };

  return (
    <div className={`text-xs ${getStatusColor()} flex items-center gap-1`}>
      <span>{getStatusIcon()}</span>
      <span>
        Backend: {health.status}
        {health.responseTime && ` (${health.responseTime}ms)`}
      </span>
    </div>
  );
};

