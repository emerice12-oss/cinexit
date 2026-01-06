'use client';

import { useEffect, useState } from 'react';

export function useStats() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setData);
  }, []);

  return data;
}
