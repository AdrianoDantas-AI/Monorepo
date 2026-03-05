const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const renderButton = (options: {
  label: string;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
}): string => {
  const variant = options.variant ?? "primary";
  const label = escapeHtml(options.label);
  const content = `<span>${label}</span>`;

  if (options.href) {
    return `<a class="ui-button ui-button--${variant}" href="${escapeHtml(options.href)}">${content}</a>`;
  }

  return `<button class="ui-button ui-button--${variant}" type="button">${content}</button>`;
};

export const renderBadge = (options: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "info";
}): string => {
  const tone = options.tone ?? "neutral";
  return `<span class="ui-badge ui-badge--${tone}">${escapeHtml(options.label)}</span>`;
};

export const renderInput = (options: {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  value?: string;
  type?: "text" | "search" | "number" | "datetime-local";
}): string => `
<label class="ui-field" for="${escapeHtml(options.id)}">
  <span class="ui-field__label">${escapeHtml(options.label)}</span>
  <input
    class="ui-input"
    id="${escapeHtml(options.id)}"
    name="${escapeHtml(options.name ?? options.id)}"
    type="${escapeHtml(options.type ?? "text")}"
    value="${escapeHtml(options.value ?? "")}"
    placeholder="${escapeHtml(options.placeholder ?? "")}"
  />
</label>
`;

export const renderCard = (options: {
  title: string;
  subtitle?: string;
  body: string;
}): string => `
<section class="ui-card">
  <header class="ui-card__header">
    <h2 class="ui-card__title">${escapeHtml(options.title)}</h2>
    ${options.subtitle ? `<p class="ui-card__subtitle">${escapeHtml(options.subtitle)}</p>` : ""}
  </header>
  <div class="ui-card__body">${options.body}</div>
</section>
`;

export const renderEmptyState = (options: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}): string => `
<div class="ui-empty-state">
  <h3>${escapeHtml(options.title)}</h3>
  <p>${escapeHtml(options.description)}</p>
  ${
    options.actionHref && options.actionLabel
      ? renderButton({ label: options.actionLabel, href: options.actionHref, variant: "secondary" })
      : ""
  }
</div>
`;

export const renderErrorState = (options: {
  title: string;
  description: string;
  retryHref?: string;
}): string => `
<div class="ui-error-state">
  <h3>${escapeHtml(options.title)}</h3>
  <p>${escapeHtml(options.description)}</p>
  ${options.retryHref ? renderButton({ label: "Tentar novamente", href: options.retryHref, variant: "primary" }) : ""}
</div>
`;

export const renderSkeleton = (lines = 3): string => `
<div class="ui-skeleton" aria-hidden="true">
  ${Array.from({ length: lines }, (_, index) => `<span class="ui-skeleton__line ui-skeleton__line--${index + 1}"></span>`).join("")}
</div>
`;
