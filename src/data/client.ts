// Facts of the client, only from veon/client.json and audit/screens (positions on the current homepage, 23.11.2026).
// Nothing here is invented: no counts, reviews or extra prices.

export interface Phone { label: string; display: string; tel: string; }

export const phones = {
  kyiv: { label: "Київ", display: "+38 (067) 568-70-20", tel: "+380675687020" },
  dnipro: { label: "Дніпро, також Viber", display: "+38 (067) 634-20-45", tel: "+380676342045" },
  support: [
    { label: "Підтримка", display: "+38 (050) 412-09-11", tel: "+380504120911" },
    { label: "Підтримка", display: "+38 (063) 394-40-72", tel: "+380633944072" },
    { label: "Підтримка", display: "+38 (095) 777-09-91", tel: "+380957770991" },
  ],
} satisfies { kyiv: Phone; dnipro: Phone; support: Phone[] };

export const email = "office@911auto.com.ua";
export const viber = { href: "viber://chat?number=+380676342045", display: "+38 (067) 634-20-45" };
export const legalName = "ФОП Олійник Дмитро Юрійович";

export interface Warehouse { id: string; city: string; region?: string; street: string; hours: string; phone: Phone; }

export const warehouses: Warehouse[] = [
  { id: "kyiv", city: "Київ", region: "Київська обл., Софіївська Борщагівка", street: "вул. Щаслива, 50", hours: "Пн–Пт 09:00–18:00", phone: phones.kyiv },
  { id: "dnipro", city: "Дніпро", street: "вул. Робоча, 152", hours: "Пн–Пт 09:00–18:00", phone: phones.dnipro },
];

/** Mitsubishi models from company.products_services («Lancer IX/X», «Pajero Wagon III/IV» split into names). */
export const mitsubishiModels = [
  "Lancer IX", "Lancer X", "Outlander", "Outlander XL", "Pajero Sport", "Pajero Wagon III", "Pajero Wagon IV",
  "ASX", "Grandis", "L200", "Colt", "Galant", "Carisma", "Space Star",
];
/** The quick row in the hero: the most common names of the list above. */
export const quickModels = ["Lancer X", "Lancer IX", "Outlander XL", "Outlander", "Pajero Sport", "Pajero Wagon IV", "ASX", "L200"];
export const otherBrands = ["Nissan", "Subaru", "Toyota", "Honda", "Mazda"];
export const onOrderBrands = ["Suzuki", "KIA"];

/** Catalog nodes as named on the client's site (audit/screens/uk-desktop-fold.png). */
export const categories: { name: string; detail?: string }[] = [
  { name: "Автохімія, мастила" },
  { name: "Двигун", detail: "навісне обладнання, електрика" },
  { name: "Запчастини для ТО", detail: "ГРМ, ремені, ролики, свічки" },
  { name: "Кузов", detail: "інтер'єр, екстер'єр, електрика" },
  { name: "Передня підвіска, кермове управління" },
  { name: "Підвіска задня" },
  { name: "Гальмівна система" },
  { name: "Гальмівні компоненти Fremax" },
  { name: "Трансмісія" },
  { name: "Фільтри" },
  { name: "Розпродаж" },
];

/** Stock columns exactly as the client's product card shows them (C-004). Their meaning is to be confirmed by the client. */
export const stockColumns = ["Київ", "Київ 3 години", "Дніпро", "1 день", "В дорозі"] as const;

export interface Part {
  id: string; name: string; fit: string; partNo: string; code: string; price: number;
  stock: [boolean, boolean, boolean, boolean, boolean];
  keywords: string;
}

/** Four real positions from the client's homepage carousel (audit/screens/uk-desktop-s02.png, 23.11.2026). */
export const parts: Part[] = [
  { id: "1092a077", name: "Опора двигуна задня MMC", fit: "Lancer IX 1.6, заміна MR519400", partNo: "1092A077", code: "8429", price: 2245, stock: [true, true, true, false, false], keywords: "опора двигуна подушка mr519400 lancer ix" },
  { id: "md050135", name: "Ролик-натяжитель ременя ГРМ MMC", fit: "MPW 2.5D (V64W, V74W), MPS", partNo: "MD050135", code: "8414", price: 2003, stock: [true, true, true, false, false], keywords: "ролик натяжитель ремінь ременя грм pajero wagon pajero sport" },
  { id: "mn119500", name: "Свічка запалювання MMC, іридій", fit: "Lancer IX 2.0, Outlander 2.0", partNo: "MN119500", code: "7576", price: 680, stock: [false, true, false, false, false], keywords: "свічка свічки запалювання іридій lancer ix outlander" },
  { id: "md362861", name: "Натяжитель ременя ГРМ MMC", fit: "MPW III 3.0/3.5, MPW IV 3.0/3.8, MPS", partNo: "MD362861", code: "8300", price: 2558, stock: [true, true, true, false, false], keywords: "натяжитель ремінь ременя грм pajero wagon iii iv pajero sport" },
];
export const pricesDate = "23.11.2026";

/** Direct supply routes (company.business_lines), sorted by speed. maxDays drives the bar length. */
export const routes = [
  { country: "Німеччина", term: "7 днів", maxDays: 7 },
  { country: "ОАЕ", term: "10–14 днів", maxDays: 14 },
  { country: "Оман", term: "14–21 день", maxDays: 21 },
  { country: "Японія", term: "до 45 днів", maxDays: 45 },
];

export const payments = [
  "Готівкою в магазинах у Києві та Дніпрі",
  "Через касу ПриватБанку",
  "Приват24 за IBAN",
  "Термінали самообслуговування ПриватБанку",
];

export const futureNote = "Розділ у розробці";
