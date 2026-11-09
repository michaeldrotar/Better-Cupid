# BetterCupid

**Retired, nonfunctional, and unmaintained.** BetterCupid no longer works with the current OkCupid website. This repository is kept for historical and educational reference only. Do not install it for active use; no further updates or support are planned.

## Project summary

BetterCupid began in 2011 as an unofficial Chrome extension that added interface enhancements to OkCupid. It grew from small userscripts into a modular extension, with features over its lifetime including photo zoom, a recently visited profile list, photo browsing, and question search and filtering.

The project explored Chrome extension APIs, DOM manipulation, persistent settings, and a Gulp-based build process. It was an independent fan project and was not endorsed by or affiliated with OkCupid.

## Engineering takeaways

- **Third-party markup is a fragile dependency.** Changes to OkCupid's layout repeatedly broke features. Extensions that modify another site's DOM need defensive checks and a way to fail without blocking the underlying page.
- **Module boundaries help organize features.** The module system grouped behavior, settings, templates, and styles, with shared loading and dependency handling.
- **Storage choices need migration plans.** The project moved from page `localStorage` to Chrome sync storage and then Chrome local storage. Quotas, data formats, and cross-tab updates all affected that design.
- **Build tooling can simplify delivery.** Gulp combined JavaScript, styles, templates, and assets into the extension package, replacing earlier runtime loading workarounds.

These are lessons from a historical implementation, not a recommendation to reuse its architecture or dependencies unchanged. The source uses Manifest V2 and an old toolchain and is not a supported starting point for a current Chrome extension.

## History

The source code and commit history are preserved. The [original README and detailed changelog](https://github.com/michaeldrotar/Better-Cupid/blob/7b3af8f1aeef08357b25ba816677dd61a8c3abfa/README.md) remain available in Git history.

## License

BetterCupid is licensed under the [MIT License](LICENSE).
