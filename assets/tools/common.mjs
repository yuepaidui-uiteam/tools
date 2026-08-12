import { LANGS, LANGUAGE_NAMES, applyLanguage } from './i18n.mjs';

export function initToolShell(pageDictionaries = {}) {
  const select = document.querySelector('[data-language-select]');
  if (select && !select.options.length) {
    for (const lang of LANGS) select.add(new Option(LANGUAGE_NAMES[lang], lang));
    select.addEventListener('change', () => applyLanguage(select.value, pageDictionaries));
  }
  return applyLanguage('zh-CN', pageDictionaries);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
