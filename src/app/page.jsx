'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rawDebugData, setRawDebugData] = useState(null);

  useEffect(() => {
    const drupalUrl = process.env.NEXT_PUBLIC_DRUPAL_URL;
    
    if (!drupalUrl) {
      setLoading(false);
      return;
    }

    fetch(`${drupalUrl}/jsonapi/node/article`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Dane z Drupala:', data);
        if (data && data.data) {
          setArticles(data.data);
          setRawDebugData(data.data[0]); // Pokażemy strukturę pierwszego artykułu do wglądu
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#0F0D0B] text-[#E5E0D8] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center border-b border-[#3D3224] pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#D4AF37] mb-2">
            🍻 Karczma Wschodnia
          </h1>
          <p className="text-[#9C9387] italic">
            Kroniki, wieści i poradniki ze świata gier
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-serif text-[#D4AF37] mb-6">
            Ostatnie gawędy z ogniska:
          </h2>

          {loading ? (
            <div className="bg-[#1A1612] border border-[#3D3224] p-6 rounded-lg text-center">
              <p className="text-[#9C9387]">Rozpalanie ogniska i łączenie z Drupalem...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-[#1A1612] border border-[#3D3224] p-6 rounded-lg text-center">
              <p className="text-[#9C9387] mb-2">Brak wpisów w kronikach.</p>
              <p className="text-xs text-stone-500">
                Sprawdź w konsoli przeglądarki (F12), czy zapytanie przeszło pomyślnie.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => {
                // Elastyczne pobieranie tytułu i treści z różnych struktur Drupala
                const title = article.attributes?.title || article.title || 'Bez tytułu';
                const bodyObj = article.attributes?.body || article.body;
                const bodyHtml = typeof bodyObj === 'string' ? bodyObj : (bodyObj?.processed || 'Brak treści wpisu.');

                return (
                  <article 
                    key={article.id}
                    className="bg-[#1A1612] border border-[#3D3224] p-6 rounded-lg shadow-md"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">
                      {title}
                    </h3>
                    <div 
                      className="text-[#C4BDB2] text-sm leading-relaxed line-clamp-3 mb-4"
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                    <span className="text-xs font-mono text-[#D4AF37]">
                      ID wpisu: {article.id}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}