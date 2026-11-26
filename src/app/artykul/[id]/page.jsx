'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Komponent wewnętrzny korzystający z useParams
function ArticleContent() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const drupalUrl = process.env.NEXT_PUBLIC_DRUPAL_URL;
    if (!drupalUrl || !params?.id) return;

    fetch(`${drupalUrl}/jsonapi/node/article/${params.id}?include=field_image`)
      .then((res) => res.json())
      .then((json) => {
        const data = json.data;
        const included = json.included || [];

        if (data) {
          const imageId = data.relationships?.field_image?.data?.id;
          const imageObj = included.find((item) => item.id === imageId);
          const imageUrl = imageObj?.attributes?.uri?.url
            ? `${drupalUrl}${imageObj.attributes.uri.url}`
            : null;

          setArticle({
            title: data.attributes?.title || 'Bez tytułu',
            bodyHtml: data.attributes?.body?.processed || '',
            created: data.attributes?.created
              ? new Date(data.attributes.created).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '',
            imageUrl,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params?.id]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {loading ? (
        <p className="text-center text-[#8C8275] py-20 font-serif italic">
          Rozwijanie zwoju...
        </p>
      ) : !article ? (
        <div className="text-center py-20">
          <h1 className="text-2xl font-serif text-[#D4AF37] mb-4">Nie znaleziono wpisu</h1>
          <Link href="/" className="text-sm underline text-[#A89F93]">
            Powrót na stronę główną
          </Link>
        </div>
      ) : (
        <article>
          <header className="mb-8">
            <div className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
              Opublikowano: {article.created}
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight mb-6">
              {article.title}
            </h1>
          </header>

          {article.imageUrl && (
            <div className="mb-10 rounded-xl overflow-hidden border border-[#2A231B] shadow-2xl">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-[#D4AF37]
              prose-p:text-[#D1C9BE] prose-p:leading-relaxed
              prose-a:text-[#D4AF37] prose-strong:text-white
              prose-blockquote:border-l-[#D4AF37] prose-blockquote:bg-[#16130F] prose-blockquote:py-2 prose-blockquote:px-4"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
        </article>
      )}
    </main>
  );
}

// Główny komponent strony owinięty w Suspense, wymagany przez Next.js App Router
export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-[#0D0B09] text-[#E8E2D9] font-sans">
      <nav className="border-b border-[#2A231B] bg-[#0D0B09]/95 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-[#D4AF37] hover:text-white transition flex items-center gap-2"
          >
            ← Wróć do Karczmy Wschodniej
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#756D62]">Czytelnia</span>
        </div>
      </nav>

      <Suspense fallback={<div className="text-center py-20 text-[#8C8275]">Ładowanie strony...</div>}>
        <ArticleContent />
      </Suspense>
    </div>
  );
}