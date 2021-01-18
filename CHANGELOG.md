## 0.6.1 (Jan 18, 2021) 
 * fix: [DEP_WEBPACK_DEPRECATION_ARRAY_TO_SET] webpack5 compatibility (PR [#43](https://github.com/fqborges/webpack-fix-style-only-entries/pull/43/commits))

## 0.6.0 (Oct 13, 2020)
 Being overly careful here, this version is not breaking for almost all the existing users. It could possibly break in some edge cases, since it changes how modules are collected (from global to one each compilation) or if you have a workaround for a working webpack multi configuration.
 * BREAKING (POSSIBLY): Use a dedicated cache for every compilation (Prevent arbitrary files deletion when using Webpack with multi configurations) (PR [#39](https://github.com/fqborges/webpack-fix-style-only-entries/pull/39))

## 0.5.2 (Oct 07, 2020)
 * Webpack 5 support using ModuleGraph API (PR [#38](https://github.com/fqborges/webpack-fix-style-only-entries/pull/38))
 * npm audit fix: ([ea9dd7](https://github.com/fqborges/webpack-fix-style-only-entries/commit/ea9dd7bd7ade5b16623064a4850de39545e1e18e))

## 0.5.1 (Jun 13, 2020)
 * Fix Maximum call stack size exceeded (PR [#34](https://github.com/fqborges/webpack-fix-style-only-entries/pull/34))
 * Added CHANGELOG ([3e3767](https://github.com/fqborges/webpack-fix-style-only-entries/commit/3e3767d8998a53d807b5d5b10643d05b800aa79a))

## 0.5.0 (May 18, 2020)

 * fix for [#23](https://github.com/fqborges/webpack-fix-style-only-entries/issues/23) ([37d350](https://github.com/fqborges/webpack-fix-style-only-entries/commit/37d350eec83f49c0b12729a93aa6cf2f96d92d0b))
 * fix for [#24](https://github.com/fqborges/webpack-fix-style-only-entries/issues/24) ([d92bec](https://github.com/fqborges/webpack-fix-style-only-entries/commit/d92bec4be5fe4b97a8651a9206fa2281ce1424be))
 * BREAKING: added styl and sass to default extensions ([247a5c](https://github.com/fqborges/webpack-fix-style-only-entries/commit/247a5c9f963e4d7598539056ab3f709b0558b4ec))
 * added LICENSE.txt ([220e20](https://github.com/fqborges/webpack-fix-style-only-entries/commit/220e20eeb9bc95652a942812a424aadd92ec7d1f))

## 0.4.0 (Sep 8, 2019)
 * feat: add support for module js files (PR [#21](https://github.com/fqborges/webpack-fix-style-only-entries/pull/21))

