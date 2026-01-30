import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Gestion spéciale pour les requêtes DevTools et well-known
  if (url.pathname.includes('.well-known') || 
      url.pathname.includes('devtools') ||
      url.pathname.includes('favicon.ico') ||
      url.pathname.includes('robots.txt') ||
      url.pathname.includes('sitemap.xml')) {
    
    // Retourner une réponse vide pour ces requêtes techniques
    return new Response(null, { 
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
  
  // Pour les autres routes, continuer vers la page 404
  return null;
}

export default function CatchAll() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page non trouvée</h2>
          <p className="text-gray-600">
            La page que vous recherchez n'existe pas.
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à l'accueil
          </a>
          
          <div>
            <a
              href="/auth"
              className="text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}