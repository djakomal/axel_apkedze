import PosterCard from './PosterCard';

const PosterGrid = ({ posters, onPosterClick, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)]?.map((_, index) => (
          <div key={index} className="bg-card rounded-lg shadow-soft overflow-hidden">
            <div className="w-full h-64 content-loading" />
            <div className="p-4 space-y-3">
              <div className="h-6 content-loading rounded" />
              <div className="h-4 content-loading rounded w-3/4" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-24 content-loading rounded" />
                <div className="h-8 w-24 content-loading rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posters?.map((poster, index) => (
        <div
          key={poster?.id}
          className="contextual-micro-interaction show"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PosterCard
            poster={poster}
            onPosterClick={onPosterClick}
          />
        </div>
      ))}
    </div>
  );
};

export default PosterGrid;