'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [currentYear, setCurrentYear] = useState('2026');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const drupalUrl = process.env.NEXT_PUBLIC_DRUPAL_URL;
    if (!drupalUrl) {
      setLoading(false);
      return;
    }

    // Używamy prawidłowej nazwy pola graficznego z Drupala: field_hero_image
    fetch(`${drupalUrl}/jsonapi/node/article?include=field_hero_image,field_category,field_rodzaj_artykulu`)
      .then((res) => res.json())
      .then((json) => {
        const rawArticles = json.data || [];
        const included = json.included || [];

        const enrichedArticles = rawArticles.map((article) => {
          // 1. Obsługa obrazka głównego przez field_hero_image
          const imageId = article.relationships?.field_hero_image?.data?.id;
          const imageObj = included.find((item) => item.id === imageId);
          const imageUrl = imageObj?.attributes?.uri?.url
            ? `${drupalUrl}${imageObj.attributes.uri.url}`
            : null;

          // 2. Pobieranie kategorii głównej z pola field_category
          let categoryName = 'Gry';
          const categoryData = article.relationships?.field_category?.data;
          if (categoryData) {
            const catId = Array.isArray(categoryData) ? categoryData[0]?.id : categoryData.id;
            const catObj = included.find((item) => item.id === catId);
            if (catObj?.attributes?.name) {
              categoryName = catObj.attributes.name;
            }
          }

          // 3. Pobieranie rodzaju artykułu z pola field_rodzaj_artykulu
          let articleType = 'Publicystyka';
          const typeData = article.relationships?.field_rodzaj_artykulu?.data;
          if (typeData) {
            const typeId = Array.isArray(typeData) ? typeData[0]?.id : typeData.id;
            const typeObj = included.find((item) => item.id === typeId);
            if (typeObj?.attributes?.name) {
              articleType = typeObj.attributes.name;
            }
          }

          return {
            id: article.id,
            title: article.attributes?.title || 'Bez tytułu',
            bodyHtml: article.attributes?.body?.processed || '',
            summary: article.attributes?.body?.summary || '',
            category: categoryName,
            articleType: articleType,
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

  // Filtrowanie artykułów po kategorii lub rodzaju artykułu
  const filteredArticles = selectedCategory === 'Wszystkie'
    ? articles
    : articles.filter(article => 
        article.category.toLowerCase() === selectedCategory.toLowerCase() ||
        article.articleType.toLowerCase() === selectedCategory.toLowerCase()
      );

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

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

          {/* Menu kategorii i formatów */}
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-[#B8AFA3]">
            {['Wszystkie', 'Retrospektywa', 'Lore', 'Poradnik', 'Analiza', 'Gry', 'Pokémon', 'Piłka nożna', 'Popkultura'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pb-1 transition border-b-2 text-xs uppercase tracking-wider ${
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
        ) : filteredArticles.length === 0 ? (
          <div className="bg-[#16130F] border border-[#2A231B] p-12 rounded-xl text-center">
            <p className="text-xl font-serif text-[#D4AF37] mb-2">Brak wpisów dla wyboru: „{selectedCategory}”</p>
            <p className="text-sm text-[#8C8275]">Opublikuj artykuł w tej taksonomii w Drupalu lub wybierz inną kategorię.</p>
          </div>
        ) : (
          <>
            {/* 1. SEKCJA HERO - TEMAT NUMERU */}
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
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                        {featuredArticle.articleType}
                      </span>
                      <span className="bg-black/70 backdrop-blur text-[#E8E2D9] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded border border-[#3D3224]">
                        {featuredArticle.category}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
                      Opublikowano: {featuredArticle.created}
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

            {/* 2. SIATKA ARTYKUŁÓW + SIDEBAR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between border-b border-[#2A231B] pb-4 mb-8">
                  <h2 className="text-xl font-serif font-bold uppercase tracking-wider text-white">
                    {selectedCategory === 'Wszystkie' ? 'Najnowsze w Karczmie' : `Filtr: ${selectedCategory}`}
                  </h2>
                  <span className="text-xs text-[#8C8275]">
                    Wyników: {filteredArticles.length}
                  </span>
                </div>

                {gridArticles.length === 0 ? (
                  <p className="text-sm text-[#8C8275] italic">
                    Brak pozostałych wpisów w tym widoku.
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {article.articleType}
                            </span>
                            <span className="text-[11px] text-[#8C8275]">• {article.category}</span>
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

              {/* SIDEBAR */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-[#16130F] border border-[#2A231B] p-6 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                    O Karczmie Wschodniej
                  </h3>
                  <p className="text-sm text-[#A89F93] leading-relaxed mb-4">
                    Magazyn o grach, retrogamingu, głębokim lore oraz popkulturze. Rozpalamy ognisko dla poszukiwaczy dobrej publicystyki.
                  </p>
                  <div className="h-px bg-[#2A231B] my-4" />
                  <p className="text-xs text-[#8C8275]">
                    Nowe materiały, analizy i poradniki regularnie.
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
                        <div>
                          <Link
                            href={`/artykul/${item.id}`}
                            className="text-sm font-medium text-[#D1C9BE] group-hover:text-white leading-snug transition block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-[#D4AF37]">
                            {item.articleType} • {item.category}
                          </span>
                        </div>
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