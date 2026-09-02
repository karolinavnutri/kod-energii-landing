'use client';

import { useEffect, useRef, useState } from 'react';
import { TIERS, TIER_ORDER, ACCESS_DURATION_MONTHS, type TierId } from '@/lib/pricing';
import './course-landing.css';

function useRevealOnScroll() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return rootRef;
}

function useCountdown(deadlineISO: string) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const deadline = new Date(deadlineISO).getTime();
    function tick() {
      const diffMs = deadline - Date.now();
      if (diffMs <= 0) {
        setLabel('');
        return;
      }
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diffMs / (60 * 60 * 1000)) % 24);
      setLabel(days > 0 ? `${days} дн. ${hours} ч.` : `${hours} ч.`);
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [deadlineISO]);

  return label;
}

const ARROW_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const STRIPE_WIDTHS = [2, 1, 3, 1, 2, 1, 4, 1, 2];

function CodeStripes({ className = '' }: { className?: string }) {
  return (
    <span className={`code-stripes ${className}`} aria-hidden="true">
      {STRIPE_WIDTHS.map((w, i) => (
        <span key={i} style={{ width: w }} />
      ))}
    </span>
  );
}

// A hand-placed (not random, so server/client render identically) scatter of 0/1
// glyphs — the "digital rain dissolving into nature" motif, built as our own SVG
// rather than reusing the watermarked stock photos as reference.
const RAIN_GLYPHS = [
  { x: 4, y: 16, t: '01', s: 11 },
  { x: 30, y: 9, t: '1', s: 9 },
  { x: 54, y: 22, t: '0', s: 10 },
  { x: 78, y: 12, t: '10', s: 11 },
  { x: 12, y: 40, t: '0', s: 9 },
  { x: 40, y: 46, t: '11', s: 10 },
  { x: 66, y: 38, t: '1', s: 11 },
  { x: 90, y: 48, t: '01', s: 9 },
  { x: 8, y: 68, t: '1', s: 10 },
  { x: 34, y: 74, t: '0', s: 11 },
  { x: 58, y: 64, t: '10', s: 9 },
  { x: 84, y: 76, t: '0', s: 10 },
  { x: 18, y: 96, t: '01', s: 9 },
  { x: 46, y: 102, t: '1', s: 11 },
  { x: 70, y: 92, t: '0', s: 10 },
  { x: 96, y: 104, t: '11', s: 9 },
];

function codeRainBackground(color: string) {
  const glyphs = RAIN_GLYPHS.map(
    (g) => `<text x='${g.x}' y='${g.y}' font-family='monospace' font-size='${g.s}' fill='${color}'>${g.t}</text>`,
  ).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='110'>${glyphs}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function CodeRain({
  color = '#8fd17a',
  opacity = 0.5,
  blend = 'screen' as const,
}: {
  color?: string;
  opacity?: number;
  blend?: 'screen' | 'normal' | 'soft-light' | 'multiply';
}) {
  return (
    <div
      className="code-rain-layer"
      aria-hidden="true"
      style={{ backgroundImage: codeRainBackground(color), opacity, mixBlendMode: blend }}
    />
  );
}

const PROGRAM = [
  {
    week: '01',
    title: 'ГГН-ось — нервная система и кортизол',
    status: 'ready' as const,
    description:
      'Как устроена твоя нервная система, определение своего типа дисфункции (гипо-реактивный / гипер-реактивный / смешанный) через расширенный тест, персональный протокол с практиками и БАДами под тип.',
    photo: 'https://images.unsplash.com/photo-1695186376192-225e563b02e0?w=400&q=75&fit=crop&auto=format',
  },
  {
    week: '02',
    title: 'ЖКТ и питание',
    status: 'progress' as const,
    description:
      'Урок по висцеральному массажу от приглашённого специалиста, определение типа питания по Аюрведе, схемы восстановления для всех отделов ЖКТ.',
    photo: 'https://images.unsplash.com/photo-1536511397145-ad62741fdf3c?w=400&q=75&fit=crop&auto=format',
  },
  {
    week: '03',
    title: 'Гликация и сахар',
    status: 'progress' as const,
    description:
      'Работа с датчиком глюкозы (по желанию — можно пройти неделю и без него), что такое гликация и почему это ускоряет старение, практические рычаги стабилизации сахара.',
    photo: 'https://images.unsplash.com/photo-1568387022280-92935eb78c5a?w=400&q=75&fit=crop&auto=format',
  },
  {
    week: '04',
    title: 'Антиэйдж и ФМД-протокол',
    status: 'progress' as const,
    description:
      'Лекция от приглашённого специалиста по ФМД, меню для протокола, совместное прохождение протокола в группе, варианты меню под разные типы.',
    photo: 'https://images.unsplash.com/photo-1758221056836-e5b235180762?w=400&q=75&fit=crop&auto=format',
  },
];

const REVIEWS = [
  { src: '/images/reviews/review-03.jpg' },
  { src: '/images/reviews/review-06.jpg' },
  { src: '/images/reviews/review-05.jpg' },
  { src: '/images/reviews/review-07.png' },
  { src: '/images/reviews/review-09.png' },
  { src: '/images/reviews/review-08.png' },
  { src: '/images/reviews/review-02.jpg' },
];

function TierCard({ tier, popular, discountActive, remaining }: { tier: TierId; popular?: boolean; discountActive: boolean; remaining: number | null }) {
  const data = TIERS[tier];
  const price = discountActive ? data.discountPriceRub : data.normalPriceRub;
  const soldOut = remaining !== null && remaining <= 0;

  const [step, setStep] = useState<'idle' | 'email' | 'loading' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Проверь адрес почты — что-то не так с форматом');
      return;
    }
    setStep('loading');
    setError('');
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email }),
      });
      const data = await response.json();
      if (!response.ok || !data.confirmationUrl) {
        setError(
          data.error === 'sold_out'
            ? 'Места на этом тарифе закончились'
            : 'Оплата пока не подключена — вернись чуть позже',
        );
        setStep('error');
        return;
      }
      window.location.href = data.confirmationUrl;
    } catch {
      setError('Не получилось связаться с оплатой — попробуй ещё раз');
      setStep('error');
    }
  }

  return (
    <div className={`pricing-card${popular ? ' popular' : ''}`}>
      {popular && <CodeRain opacity={0.3} />}
      {popular && <span className="pricing-badge">Популярный выбор</span>}
      <div className="pricing-name">{data.name}</div>
      <div className="pricing-desc">{data.description}</div>
      {discountActive && <div className="pricing-old">{data.normalPriceRub.toLocaleString('ru-RU')} ₽</div>}
      <div className="pricing-price">{price.toLocaleString('ru-RU')} ₽</div>
      <ul className="pricing-features">
        {data.features.map((f) => (
          <li key={f} className="pricing-feature">
            {CHECK_ICON}
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {remaining !== null && !soldOut && <div className="seat-counter">Осталось мест: {remaining} из {data.seatLimit}</div>}
      {soldOut ? (
        <button className="btn" disabled>
          Мест не осталось
        </button>
      ) : step === 'idle' ? (
        <button className="btn" onClick={() => setStep('email')}>
          Купить
        </button>
      ) : (
        <div className="buy-email">
          <input
            type="email"
            placeholder="Твоя почта для доступа"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <button className="btn" onClick={submit} disabled={step === 'loading'}>
            {step === 'loading' ? 'Переходим к оплате…' : 'Оплатить'}
          </button>
          {error && <span className="buy-error">{error}</span>}
        </div>
      )}
    </div>
  );
}

export function CourseLanding({
  discountActive,
  deadlineISO,
  personalRemaining,
}: {
  discountActive: boolean;
  deadlineISO: string;
  personalRemaining: number | null;
}) {
  const rootRef = useRevealOnScroll();
  const countdown = useCountdown(deadlineISO);

  return (
    <div className="landing-root" ref={rootRef}>
      <div className="wrap brand-bar">
        <span className="brand-name">
          <CodeStripes />
          <span className="brand-code">КОД</span> <span className="brand-word">энергии</span>
        </span>
      </div>
      <header className="hero">
        <div className="hero-blob" />
        <div className="hero-blob two" />
        <CodeRain color="#35592f" opacity={0.22} blend="soft-light" />
        <div className="wrap hero-inner">
          <div>
            <span className="kicker">Код Энергии · курс, 4 недели</span>
            <h1>
              Как избавиться от <span className="hl">хронической усталости</span> и вернуть ресурс за 4 недели
            </h1>
            <p className="lead">
              4 недели системной работы с четырьмя причинами хронической усталости: нервная система, ЖКТ, сахар,
              старение и восстановление. Не разовый лайфхак, а рабочий протокол под тебя.
            </p>
            {discountActive && countdown && (
              <div className="countdown">
                Цена для участников интенсива действует ещё <strong>{countdown}</strong>
              </div>
            )}
            <div>
              <a href="#pricing" className="btn" style={{ width: 'auto', display: 'inline-flex' }}>
                Смотреть тарифы
              </a>
            </div>
          </div>
          <div className="hero-photo">
            <img src="/images/author/karolina.jpg" alt="Каролина Герасимова" />
          </div>
        </div>
      </header>

      <section className="mosaic-section">
        <div className="wrap mosaic reveal">
          <div className="mosaic-tile mosaic-a">
            <img
              src="https://images.unsplash.com/photo-1568387022280-92935eb78c5a?w=900&q=80&fit=crop&auto=format"
              alt=""
            />
            <CodeRain color="#1f3a1c" opacity={0.35} blend="multiply" />
          </div>
          <div className="mosaic-tile mosaic-b mosaic-quote">
            <CodeRain />
            <span>Не выгорание.
Система.</span>
          </div>
          <div className="mosaic-tile mosaic-c">
            <img
              src="https://images.unsplash.com/photo-1536511397145-ad62741fdf3c?w=700&q=80&fit=crop&auto=format"
              alt=""
            />
          </div>
          <div className="mosaic-tile mosaic-d mosaic-stat">
            <span className="mosaic-stat-num">4×4</span>
            <span>недели · причины усталости</span>
          </div>
          <div className="mosaic-tile mosaic-e">
            <img
              src="https://images.unsplash.com/photo-1758221056836-e5b235180762?w=700&q=80&fit=crop&auto=format"
              alt=""
            />
          </div>
          <div className="mosaic-tile mosaic-f mosaic-banner">
            <img
              src="https://images.unsplash.com/photo-1695186376192-225e563b02e0?w=1400&q=75&fit=crop&auto=format"
              alt=""
            />
            <CodeRain opacity={0.6} />
            <span className="mosaic-banner-text">Вернуть ресурс.</span>
          </div>
        </div>
      </section>

      <section className="pillars">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Что входит в каждую неделю</span>
            <h2>Урок, действие, материалы — без перегруза</h2>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card reveal">
              <span className="pillar-num">01</span>
              <h3>Видео-урок недели</h3>
              <p>Разбор одной системы организма за раз — без перегруза теорией сразу по всем направлениям.</p>
            </div>
            <div className="pillar-card reveal">
              <span className="pillar-num">02</span>
              <h3>Домашнее действие</h3>
              <p>Конкретный шаг под неделю — встраивается в день, а не требует отдельных часов.</p>
            </div>
            <div className="pillar-card reveal">
              <span className="pillar-num">03</span>
              <h3>Материалы для скачивания</h3>
              <p>Протоколы, чек-листы и схемы — остаются под рукой, не только на время урока.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="program">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Программа по неделям</span>
            <h2>Четыре системы — одна за другой</h2>
          </div>
          <div className="program-list reveal">
            {PROGRAM.map((item) => (
              <div key={item.week} className="program-item">
                <div className="program-photo">
                  <img src={item.photo} alt="" />
                </div>
                <div className="week-label">{item.week}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className={`program-status ${item.status}`}>
                  {item.status === 'ready' ? 'Готово' : 'В записи'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="value">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Что ты получишь</span>
            <h2>Бонусы для всех тарифов</h2>
          </div>
          <div className="value-grid reveal">
            <div className="value-item">
              <span className="num">01</span>
              <p>Сборник рецептов под стабильный сахар.</p>
            </div>
            <div className="value-item">
              <span className="num">02</span>
              <p>Чек-лист «какие анализы сдать», чтобы разговор с врачом был предметным.</p>
            </div>
            <div className="value-item">
              <span className="num">03</span>
              <p>Доступ в чат ещё 2–4 недели после окончания курса.</p>
            </div>
            <div className="value-item">
              <span className="num">04</span>
              <p>Материалы курса остаются доступны {ACCESS_DURATION_MONTHS} месяца — можно проходить в своём темпе.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="recognize">
        <CodeRain opacity={0.35} />
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Узнаёшь себя?</span>
            <h2>Пора копать глубже, а не гадать заново?</h2>
          </div>
          <div className="pain-list reveal">
            <div className="pain-item">
              {ARROW_ICON}
              <span>После интенсива стало легче — но непонятно, что делать дальше, чтобы не откатиться назад через месяц.</span>
            </div>
            <div className="pain-item">
              {ARROW_ICON}
              <span>Уже испробовано всё: высыпаться, БАДы наугад, модные диеты — эффект держится неделю, потом снова всё сначала.</span>
            </div>
            <div className="pain-item">
              {ARROW_ICON}
              <span>Причина явно не одна — но неясно, с чего начинать: с нервов, с ЖКТ, с сахара.</span>
            </div>
            <div className="pain-item">
              {ARROW_ICON}
              <span>Кортизол, гликация, ФМД-протоколы — тема интересна, но без системы легко потеряться в том, что из этого касается лично тебя.</span>
            </div>
            <div className="pain-item">
              {ARROW_ICON}
              <span>Где-то внутри тревога: а вдруг это не просто усталость, а то, что будет только прогрессировать со временем.</span>
            </div>
            <div className="pain-item">
              {ARROW_ICON}
              <span>Вложиться в решение — да. Платить снова за очередной курс с общими советами «для всех» — уже нет.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="competitors">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Чем это отличается</span>
            <h2>Чем отличается от других курсов и гайдов?</h2>
          </div>
          <div className="comp-inner reveal">
            <p>
              Разовые БАДы и диеты наугад — можно пить магний, коллаген, сидеть на модной диете, но если непонятно,
              какая именно система разладилась, эффект держится пару недель, потом всё возвращается.
            </p>
            <p>
              Общие гайды в духе «10 привычек для энергии» — читаются легко, но ни одна привычка не приживается,
              потому что советы не учитывают, что происходит именно внутри у тебя.
            </p>
            <p>
              «Энергия за 7 дней» дала первый честный взгляд на проблему — но это только начало: 7 дней про быстрые
              практические шаги, без глубокого разбора причин и без тем, которых там вообще не было — ЖКТ,
              гликация, антиэйдж-протоколы.
            </p>
            <p className="final">
              «Код Энергии» — это не ещё один список советов и не 7-дневный старт, а 4 недели системной работы со
              всеми причинами усталости сразу: разобраться, что именно разладилось, и получить протокол под это, а
              не под «всех».
            </p>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Тарифы</span>
            <h2>{discountActive ? 'Цена для участников интенсива' : 'Тарифы курса'}</h2>
          </div>
          <div className="pricing-grid reveal">
            {TIER_ORDER.map((id) => (
              <TierCard
                key={id}
                tier={id}
                popular={id === 'support'}
                discountActive={discountActive}
                remaining={id === 'personal' ? personalRemaining : null}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="doubts">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Если остались сомнения</span>
            <h2>Скорее всего, ты уже думаешь об этом</h2>
          </div>
          <div className="doubts-list reveal">
            <details className="doubt" open>
              <summary>
                А если не будет времени на курс?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Формат — 1 урок в неделю (60–90 минут) + одно домашнее действие в день, которое встраивается в уже
                существующий распорядок, а не требует отдельных часов. Даже при плотном графике реально проходить
                курс в своём темпе — доступ остаётся {ACCESS_DURATION_MONTHS} месяца после покупки.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Чем это отличается от интенсива?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Интенсив — это быстрые практические действия на 7 дней, без разбора, почему именно так работает и
                что происходит лично у тебя. Курс — это теория по каждому направлению, твой личный тип (не общий
                совет, а протокол под тебя), и темы, которых в интенсиве вообще не было — подробная работа с ЖКТ,
                антиэйдж и ФМД-протокол.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Уже пробовал(а) БАДы/диеты без толку — почему тут будет по-другому?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Разовые БАДы и диеты не работают, если не понятно, какая именно система не в порядке — курс
                начинается с диагностики (какая система слабое звено), и всё дальнейшее строится вокруг этого, а не
                наугад.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Датчик глюкозы (неделя 3) — это обязательно и дорого?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Датчик участники покупают сами, по рекомендации, что именно брать. Если пока не готовы к этой трате —
                можно проходить неделю 3 без датчика, по общим принципам, эффект будет чуть менее персонализированным,
                но тема всё равно рабочая.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Сложный случай / несколько диагнозов — курс подойдёт?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Курс — это общая система, не замена индивидуальной консультации при серьёзных диагнозах. При сложном
                анамнезе рекомендуется тариф с личным сопровождением (разбор ситуации отдельно) либо предварительная
                консультация перед курсом.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Чем тариф «Старт» отличается от «С сопровождением» — точно нужен чат?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                «Старт» — это только 4 видео-урока, чистая информация. Нет трекера, чтобы видеть реальный прогресс,
                нет чата и сопровождения — мотивацию дойти до конца создавать некому, кроме себя. «С сопровождением»
                закрывает именно это: трекер, который наглядно показывает изменения, и чат с группой — по опыту
                интенсива, именно это удерживает в процессе и не даёт бросить на середине.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Что если пропущу неделю?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Доступ к материалам остаётся {ACCESS_DURATION_MONTHS} месяца, можно проходить в своём темпе, ничего
                не сгорает через неделю.
              </div>
            </details>
            <details className="doubt">
              <summary>
                Где гарантии, что это поможет?<span className="plus">+</span>
              </summary>
              <div className="doubt-answer">
                Если результата совсем не будет чувствоваться, есть возможность обратиться лично, задать вопросы и
                донастроить протокол так, чтобы результат появился. Это не разовая покупка «посмотрел и забыл», а
                работа до реального результата.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="reviews">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">Отзывы</span>
            <h2>Что говорят участники</h2>
          </div>
          <p className="reviews-note reveal">
            Отзывы с интенсива «Энергия за 7 дней» — первого шага, из которого вырос «Код Энергии».
          </p>
          <div className="reviews-carousel reveal">
            {REVIEWS.map((review) => (
              <div key={review.src} className="review-card">
                <div className="review-shot">
                  <img src={review.src} alt="Отзыв участника интенсива «Энергия за 7 дней»" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="author">
        <div className="wrap">
          <div className="author-card reveal">
            <div className="author-photo">
              <img src="/images/author/karolina.jpg" alt="Каролина Герасимова" />
            </div>
            <div className="author-text">
              <span className="kicker">Автор курса</span>
              <h2>Каролина Герасимова</h2>
              <p className="author-role">
                Специалист по энергии и метаболизму, терапевт аюрведы, организатор оздоровительных туров.
              </p>
              <p>
                У меня слабая генетика и чувствительная нервная система с рождения — так было всегда. Хронический
                стресс, соревнования по фитнес-бикини, развод, переезды — в какой-то момент всё это буквально
                сломало. Я знаю, каково это, когда любое изменение отражается на здоровье сильнее, чем у других — и
                знаю, как с этим жить и как этим управлять. Не по учебнику, а на собственном опыте.
              </p>
              <p>
                «Код Энергии» — методика, выросшая из этого опыта: как понять, какая именно система — нервная, ЖКТ,
                обмен сахара или процессы старения — твоё слабое звено, и что с этим делать дальше.
              </p>
              <a href="https://instagram.com/karolina.vnutri" target="_blank" rel="noopener noreferrer" className="author-link">
                @karolina.vnutri →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <img
          className="final-cta-bg"
          src="https://images.unsplash.com/photo-1568387022280-92935eb78c5a?w=1600&q=70&fit=crop&auto=format"
          alt=""
        />
        <div className="wrap">
          <span className="kicker reveal">Пора начать</span>
          <h2 className="reveal">4 недели. Твоя система, твой протокол, твой ответ.</h2>
          <p className="reveal">
            {discountActive && countdown
              ? `Цена для участников интенсива действует ещё ${countdown}.`
              : 'Выбери тариф и начни разбираться в своей энергии системно.'}
          </p>
          <a href="#pricing" className="btn reveal">
            Смотреть тарифы
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}>
          <span>Код Энергии · karolina.vnutri</span>
          <span>Следующий шаг после «Энергии за 7 дней»</span>
        </div>
        <div className="wrap" style={{ width: '100%', marginTop: 8, display: 'flex', gap: 16 }}>
          <a href="/rekvizity" style={{ fontSize: 11, opacity: 0.5 }}>
            Реквизиты
          </a>
          <a href="/oferta" style={{ fontSize: 11, opacity: 0.5 }}>
            Оферта
          </a>
        </div>
      </footer>
    </div>
  );
}
