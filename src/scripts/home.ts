// Homepage behaviour. Every feature is an enhancement: without scripts the page is complete and readable.
// Motion (concept «Рух»): rotating search hint, stock matrix fill, mobile action bar. All respect reduced motion.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- burger menu: close on anchor click and Escape ---------- */
function initMenu(): void {
  const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
  if (!menu) return;
  menu.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link) menu.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector<HTMLElement>("summary")?.focus();
    }
  });
}

/* ---------- search hint rotation (stops on focus and with reduced motion) ---------- */
function initHints(input: HTMLInputElement): void {
  const hints = Array.from(document.querySelectorAll<HTMLElement>("[data-search-hints] > *"));
  if (hints.length < 2 || reduceMotion.matches) return;
  let index = 0;
  let timer = 0;
  const step = (): void => {
    hints[index]?.classList.remove("is-active");
    index = (index + 1) % hints.length;
    hints[index]?.classList.add("is-active");
  };
  const start = (): void => { if (!timer) timer = window.setInterval(step, 3000); };
  const stop = (): void => { window.clearInterval(timer); timer = 0; };
  input.addEventListener("focus", stop);
  input.addEventListener("blur", () => { if (!input.value) start(); });
  reduceMotion.addEventListener("change", () => (reduceMotion.matches ? stop() : start()));
  start();
}

/* ---------- local search over the facts shown on this page ---------- */
interface Entry { name: string; type: string; href: string; haystack: string; }

const normalise = (s: string): string => s.toLowerCase().replace(/[’'ʼ`]/g, "").replace(/[\s\-_.,/()]+/g, "");

function buildIndex(): Entry[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-search-name]")).map((el) => {
    const name = el.dataset.searchName ?? "";
    return {
      name,
      type: el.dataset.searchType ?? "",
      href: el.dataset.searchHref ?? `#${el.id}`,
      haystack: normalise(`${name} ${el.dataset.searchKeys ?? ""}`),
    };
  });
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function initSearch(): void {
  const form = document.querySelector<HTMLFormElement>("[data-search-form]");
  const input = form?.querySelector<HTMLInputElement>("input[type=search]");
  const out = document.querySelector<HTMLElement>("[data-search-results]");
  if (!form || !input || !out) return;
  const index = buildIndex();
  const contact = document.querySelector<HTMLElement>("#search-empty");

  const render = (raw: string): void => {
    const q = raw.trim();
    out.replaceChildren();
    if (q.length < 2) { out.hidden = true; return; }
    const words = q.split(/\s+/).map(normalise).filter(Boolean);
    const found = index.filter((e) => words.every((w) => e.haystack.includes(w))).slice(0, 8);
    out.hidden = false;
    if (found.length) {
      const list = el("ul", "search-results__list");
      for (const f of found) {
        const li = el("li", "search-results__item");
        const a = el("a");
        a.href = f.href;
        a.append(el("span", "search-results__name", f.name), el("span", "search-results__type", f.type));
        li.append(a);
        list.append(li);
      }
      out.append(list);
    } else {
      out.append(el("p", "search-results__name", `За запитом «${q}» на цій сторінці нічого немає.`));
      if (contact) out.append(...Array.from(contact.cloneNode(true).childNodes));
    }
    out.append(el("p", "search-results__note", "Пошук працює по моделях, розділах і позиціях на цій сторінці; пошук по всьому каталогу з’явиться в повній версії сайту."));
  };

  let debounce = 0;
  input.addEventListener("input", () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => render(input.value), 150);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render(input.value);
    out.querySelector<HTMLAnchorElement>("a")?.focus();
  });

  // Quick model chips fill the field instead of jumping away.
  document.querySelectorAll<HTMLAnchorElement>("[data-quick-model]").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      input.value = chip.dataset.quickModel ?? "";
      render(input.value);
      input.focus();
    });
  });

  // Header search icon focuses the field.
  document.querySelectorAll<HTMLAnchorElement>("[data-focus-search]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      input.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      input.focus({ preventScroll: true });
    });
  });

  initHints(input);
}

/* ---------- shipping clock: Kyiv time, Mon–Fri before 14:00 ---------- */
function initClock(): void {
  const box = document.querySelector<HTMLElement>("[data-ship-clock]");
  const status = box?.querySelector<HTMLElement>("[data-ship-status]");
  if (!box || !status) return;
  const fallback = status.textContent ?? "";
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Kyiv", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  const update = (): void => {
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
    const weekday = parts.weekday ?? "";
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const workday = !["Sat", "Sun"].includes(weekday);
    const left = 14 * 60 - minutes;
    if (workday && left > 0) {
      const h = Math.floor(left / 60);
      const m = left % 60;
      const span = h > 0 ? `${h} год ${m} хв` : `${m} хв`;
      status.textContent = `Сьогодні ще встигаєте: до 14:00 залишилось ${span}.`;
      box.classList.add("is-open");
    } else {
      status.textContent = fallback;
      box.classList.remove("is-open");
    }
  };
  update();
  window.setInterval(update, 60_000);
}

/* ---------- stock matrix fill: cells mark themselves once on entering the screen ---------- */
function initMatrix(): void {
  const rows = document.querySelectorAll<HTMLElement>("[data-matrix]");
  if (!rows.length) return;
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    rows.forEach((r) => r.classList.add("is-filled"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-filled");
      io.unobserve(e.target);
    }
  }, { threshold: 0.4 });
  rows.forEach((r) => { r.classList.add("is-pending"); io.observe(r); });
}

/* ---------- mobile action bar: appears once the hero is scrolled past ---------- */
function initActionBar(): void {
  const bar = document.querySelector<HTMLElement>("[data-action-bar]");
  const hero = document.querySelector<HTMLElement>("#hero");
  if (!bar || !hero || !("IntersectionObserver" in window)) return;
  bar.classList.add("is-armed");
  const io = new IntersectionObserver(([entry]) => {
    const past = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0;
    bar.classList.toggle("is-shown", past);
    bar.inert = !past;
  });
  bar.inert = true;
  io.observe(hero);
}

initMenu();
initSearch();
initClock();
initMatrix();
initActionBar();
