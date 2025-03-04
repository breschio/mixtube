
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import Home from './Home';
import { type Mix } from '@/types';

export default function MixPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mix, setMix] = useState<Mix | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    fetch(`/api/mixes/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Mix not found');
        }
        return res.json();
      })
      .then(mixData => {
        setMix(mixData);
        // Record a view for this mix
        fetch(`/api/mixes/${id}/view`, { method: 'POST' }).catch(e => 
          console.error('Failed to record view:', e)
        );
      })
      .catch(err => {
        console.error('Error loading mix:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Could not load the mix. It may have been deleted or is unavailable.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading mix...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mix not found</h2>
        <p className="mb-4">The mix you're looking for doesn't exist or was removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return Home
        </button>
      </div>
    </div>;
  }

  // Pass the mix to the Home component to load it
  return <Home initialMixId={id} />;
}
