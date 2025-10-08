import { useState } from 'react';

// No-op hook: realtime disabled
export const useRealtimePosters = () => {
  const [isConnected] = useState(false);
  return { isConnected };
};

export default useRealtimePosters;
