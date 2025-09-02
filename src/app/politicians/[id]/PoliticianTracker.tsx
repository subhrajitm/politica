
'use client';

import { useEffect } from 'react';

export default function PoliticianTracker({ politicianId }: { politicianId: string }) {
  useEffect(() => {
    if (politicianId) {
      try {
        const viewed: string[] = JSON.parse(
          localStorage.getItem('recentlyViewed') || '[]'
        );
        const updatedViewed = [
          politicianId,
          ...viewed.filter((id) => id !== politicianId),
        ].slice(0, 4); // Keep only the 4 most recent
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
      } catch (error) {
        console.error("Failed to update recently viewed in localStorage", error);
      }
    }
  }, [politicianId]);

  return null;
}
