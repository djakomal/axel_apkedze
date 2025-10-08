
import { useState } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const handleError = (e) => {
    if (retryCount < maxRetries) {
      // Tentative de rechargement avec un délai progressif
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        e.target.src = src + '?retry=' + new Date().getTime();
      }, 1000 * retryCount);
    } else {
      setImgError(true);
      // Utiliser une image de secours en base64 au lieu d'un chemin de fichier
      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRUVFRUUiLz48cGF0aCBkPSJNNzUgNjVIMTI1VjEzNUg3NVY2NVoiIGZpbGw9IiNBQUFBQUEiLz48cGF0aCBkPSJNODYuMzYzNiA5Ny43MjczQzkwLjA5MDkgOTcuNzI3MyA5My4xODE4IDk0LjYzNjQgOTMuMTgxOCA5MC45MDkxQzkzLjE4MTggODcuMTgxOCA5MC4wOTA5IDg0LjA5MDkgODYuMzYzNiA4NC4wOTA5QzgyLjYzNjQgODQuMDkwOSA3OS41NDU1IDg3LjE4MTggNzkuNTQ1NSA5MC45MDkxQzc5LjU0NTUgOTQuNjM2NCA4Mi42MzY0IDk3LjcyNzMgODYuMzYzNiA5Ny43MjczWiIgZmlsbD0iIzY2NjY2NiIvPjxwYXRoIGQ9Ik0xMjAgMTIwTDEwMCAxMDBMODAgMTIwTDcwIDExMEw2MCAxMjBIODVIMTAwSDEyMFoiIGZpbGw9IiM2NjY2NjYiLz48L3N2Zz4=";
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${imgError ? 'opacity-70' : ''}`}
      loading="lazy"
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
}

export default Image;
