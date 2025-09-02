
import WorldMap from '@/components/WorldMap';
import { Card } from '@/components/ui/card';

export default function BrowseMapPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse by Map</h1>
        <p className="text-sm text-muted-foreground">
          Click on a country to explore its political leaders.
        </p>
      </div>

      <Card>
        <div className="p-4">
          <WorldMap />
        </div>
      </Card>
       <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Currently, only data for India is available. More countries will be added soon.
        </p>
      </div>
    </div>
  );
}
