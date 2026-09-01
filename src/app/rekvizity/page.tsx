import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Реквизиты — Код Энергии',
};

export default function RekvizityPage() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <h1 className="font-serif text-2xl text-ink">Реквизиты</h1>
      <dl className="mt-8 space-y-5 text-ink">
        <div>
          <dt className="text-sm text-ink-soft">ФИО</dt>
          <dd className="mt-1 text-lg">Безрукова Каролина Викторовна</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">ИНН</dt>
          <dd className="mt-1 text-lg">650803211173</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Статус</dt>
          <dd className="mt-1 text-lg">Плательщик налога на профессиональный доход (самозанятая)</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Email для связи</dt>
          <dd className="mt-1 text-lg">karolina_vikrovna@mail.ru</dd>
        </div>
      </dl>
    </main>
  );
}
