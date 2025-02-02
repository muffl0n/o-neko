import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {
  AnimationDriver,
  ɵNoopAnimationDriver as NoopAnimationDriver,
  ɵWebAnimationsDriver as WebAnimationsDriver
} from '@angular/animations/browser';
import {TranslateService} from "@ngx-translate/core";
import {MatPaginatorIntl} from "@angular/material/paginator";
import {Store} from "@ngxs/store";
import {I18nState} from "../store/i18n/i18n.state";

export const configureSvgIcons = (iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) => {
  iconRegistry.addSvgIconResolver((name, namespace) => {
    let iconUrl: string;
    if (namespace === 'mdi') {
      iconUrl = `assets/icons/mdi/${name}.svg`;
    } else if (namespace === '') {
      iconUrl = `assets/icons/two-tone/${name}.svg`;
    }
    return iconUrl ? domSanitizer.bypassSecurityTrustResourceUrl(iconUrl) : null;
  });
};

export const provideAnimationDriverBasedOnUserPreferences = (): AnimationDriver => {
  const noop = new NoopAnimationDriver();
  const driver = new WebAnimationsDriver();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion ? noop : driver;
};

export const configureTranslations = (translate: TranslateService, store: Store) => {
  translate.setDefaultLang('en');
  store.select(I18nState.locale).subscribe(locale => {
    translate.use(locale);
  });
};

export const configureMatPaginatorI18n = (translate: TranslateService): MatPaginatorIntl => {
  return new TranslatedMatPaginatorIntl(translate);
};

class TranslatedMatPaginatorIntl extends MatPaginatorIntl {

  constructor(private translate: TranslateService) {
    super();
    this.initialize();
  }

  private initialize() {
    const firstPage = 'material.paginator.firstPage';
    const previousPage = 'material.paginator.previousPage';
    const nextPage = 'material.paginator.nextPage';
    const lastPage = 'material.paginator.lastPage';
    const itemsPerPage = 'material.paginator.itemsPerPage';
    this.translate.get([
      firstPage,
      previousPage,
      nextPage,
      lastPage,
      itemsPerPage
    ]).subscribe((translations) => {
      this.firstPageLabel = translations[firstPage];
      this.nextPageLabel = translations[nextPage];
      this.previousPageLabel = translations[previousPage];
      this.lastPageLabel = translations[lastPage];
      this.itemsPerPageLabel = translations[itemsPerPage];
      this.changes.next();
    });
    this.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return `0 of ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return this.translate.instant('material.paginator.itemsVisible', {from: startIndex + 1, to: endIndex, length});
    };
  }
}
