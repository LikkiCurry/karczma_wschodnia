'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [currentYear, setCurrentYear] = useState('2026');

  useEffect(() => {
    // Bezpieczne ustawienie roku w przeglądarce
    setCurrentYear(new Date().getFullYear());

    const drupalUrl = process.env.NEXT_PUBLIC_DRUPAL_URL;
    if (!drupalUrl) {
      setLoading(false);
      return;
    }

    fetch(`${drupalUrl}/jsonapi/node/article`)
      .then((res) => res.json())
      .then((json) => {
        const rawArticles = json.data || [];
        const included = json.included || [];

        const enrichedArticles = rawArticles.map((article) => {
          const imageId = article.relationships?.field_image?.data?.id;
          const imageObj = included.find((item) => item.id === imageId);
          const imageUrl = imageObj?.attributes?.uri?.url
            ? `${drupalUrl}${imageObj.attributes.uri.url}`
            : null;

          return {
            id: article.id,
            title: article.attributes?.title || 'Bez tytułu',
            bodyHtml: article.attributes?.body?.processed || '',
            summary: article.attributes?.body?.summary || '',
            created: article.attributes?.created
              ? new Date(article.attributes.created).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '',
            imageUrl,
          };
        });

        setArticles(enrichedArticles);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych:', err);
        setLoading(false);
      });
  }, []);

  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#0D0B09] text-[#E8E2D9] font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* GÓRNY PASEK NAWIGACJI */}
      <nav className="sticky top-0 z-50 bg-[#0D0B09]/95 backdrop-blur border-b border-[#2A231B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl">🍻</span>
            <div>
              <span className="block text-2xl font-serif font-bold tracking-wide text-[#D4AF37] group-hover:text-[#F0CE5D] transition">
                KARCZMA WSCHODNIA
              </span>
              <span className="block text-[11px] uppercase tracking-[0.2em] text-[#8C8275]">
                Magazyn o Popkulturze & Grach
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#B8AFA3]">
            {['Wszystkie', 'Gry', 'Retrospektywy', 'Poradniki', 'Tropami Fikcji'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pb-1 transition border-b-2 ${
                  selectedCategory === cat
                    ? 'text-[#D4AF37] border-[#D4AF37]'
                    : 'border-transparent hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* GŁÓWNA ZAWARTOŚĆ PORTALU */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#8C8275] font-serif italic">Otwieranie ksiąg Karczmy...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-[#16130F] border border-[#2A231B] p-12 rounded-xl text-center">
            <p className="text-xl font-serif text-[#D4AF37] mb-2">Kroniki są jeszcze puste</p>
            <p className="text-sm text-[#8C8275]">Opublikuj pierwszy wpis w Drupalu, aby zapełnić okładkę.</p>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <section className="mb-14">
                <div className="group relative bg-[#16130F] border border-[#2A231B] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl hover:border-[#4A3D2F] transition">
                  <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] bg-[#1F1A14] overflow-hidden">
                    {featuredArticle.imageUrl ? (
                      <img
                        src={featuredArticle.imageUrl}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#231D16] to-[#120F0C]">
                        <span className="text-6xl opacity-20">⚔️</span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                      Temat Numeru
                    </span>
                  </div>

                  <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
                      Publicystyka • {featuredArticle.created}
                    </div>
                    <Link href={`/artykul/${featuredArticle.id}`}>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight mb-4 group-hover:text-[#D4AF37] transition">
                        {featuredArticle.title}
                      </h1>
                    </Link>
                    <div
                      className="text-[#A89F93] text-sm sm:text-base leading-relaxed line-clamp-4 mb-6"
                      dangerouslySetInnerHTML={{
                        __html: featuredArticle.summary || featuredArticle.bodyHtml,
                      }}
                    />
                    <div>
                      <Link
                        href={`/artykul/${featuredArticle.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#D4AF37] hover:text-white transition"
                      >
                        Czytaj pełny tekst <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between border-b border-[#2A231B] pb-4 mb-8">
                  <h2 className="text-xl font-serif font-bold uppercase tracking-wider text-white">
                    Najnowsze w Karczmie
                  </h2>
                  <span className="text-xs text-[#8C8275]">
                    Liczba wpisów: {articles.length}
                  </span>
                </div>

                {gridArticles.length === 0 ? (
                  <p className="text-sm text-[#8C8275] italic">
                    Dodaj więcej artykułów w Drupalu, aby zapełnić siatkę redakcyjną.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {gridArticles.map((article) => (
                      <article
                        key={article.id}
                        className="group bg-[#16130F] border border-[#2A231B] rounded-xl overflow-hidden flex flex-col hover:border-[#4A3D2F] transition shadow-lg"
                      >
                        <Link
                          href={`/artykul/${article.id}`}
                          className="block relative aspect-video bg-[#1F1A14] overflow-hidden"
                        >
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#1E1913] to-[#14110D]">
                              <span className="text-3xl opacity-25">📜</span>
                            </div>
                          )}
                        </Link>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="text-[11px] uppercase tracking-wider text-[#D4AF37] mb-2">
                            Artykuł • {article.created}
                          </div>
                          <Link href={`/artykul/${article.id}`}>
                            <h3 className="text-xl font-serif font-bold text-white leading-snug mb-3 group-hover:text-[#D4AF37] transition">
                              {article.title}
                            </h3>
                          </Link>
                          <div
                            className="text-[#9E9589] text-sm leading-relaxed line-clamp-3 mb-4 flex-1"
                            dangerouslySetInnerHTML={{
                              __html: article.summary || article.bodyHtml,
                            }}
                          />
                          <Link
                            href={`/artykul/${article.id}`}
                            className="text-xs font-semibold uppercase tracking-wider text-[#B8AFA3] group-hover:text-[#D4AF37] transition mt-auto pt-3 border-t border-[#241E17]"
                          >
                            Otwórz wpis →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-[#16130F] border border-[#2A231B] p-6 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                    O Karczmie Wschodniej
                  </h3>
                  <p className="text-sm text-[#A89F93] leading-relaxed mb-4">
                    Miejsce przy ognisku dla fanów klasycznych gier, retrospektyw, ukrytych motywów fabularnych i głębokiej popkultury.
                  </p>
                  <div className="h-px bg-[#2A231B] my-4" />
                  <p className="text-xs text-[#8C8275]">
                    Nowe teksty i materiały wideo co tydzień.
                  </p>
                </div>

                <div className="bg-[#16130F] border border-[#2A231B] p-6 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white border-b border-[#2A231B] pb-3 mb-4">
                    Na skróty w kronikach
                  </h3>
                  <ul className="space-y-4">
                    {articles.slice(0, 5).map((item, idx) => (
                      <li key={item.id} className="flex gap-3 items-start group">
                        <span className="text-lg font-serif font-bold text-[#D4AF37]/60 group-hover:text-[#D4AF37]">
                          0{idx + 1}
                        </span>
                        <Link
                          href={`/artykul/${item.id}`}
                          className="text-sm font-medium text-[#D1C9BE] group-hover:text-white leading-snug transition"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#2A231B] bg-[#0A0807] mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#756D62]">
          <div>© {currentYear} Karczma Wschodnia. Wszelkie prawa zastrzeżone.</div>
          <div>Napędzane przez Drupal Headless & Next.js</div>
        </div>
      </footer>
    </div>
  );
}