# CassidyDC Toolsets System Design

## How the Toolset works

This CLI creates a toolset based on the arguments passed to it. For example, if you choose WordPress Standards, WordPress Site Script, the toolset created will include all the linting, formatting, and scripting files for a WordPress site, following WordPress standard. You can choose WordPress Modernized Standards to have namespacing, no-yoda expressions, etc. You can also choose community standards and apply that to your WordPress site. It's very customizable.

## Scripts

- WordPress Site (wp-content)
- WordPress Standalone Plugin
- WordPress Standalone Theme

## Standards

- PHP
  - Community
  - WordPress

## Tools

- CSS
  - Prettier
  - Stylelint
- JavaScript
  - ESLint
  - Prettier
- Markdown
  - MarkdownLint
- PHP
  - PHPStan
- Python
  - ??
- React
  - ??
- SCSS
  - Prettier
  - Stylelint
- TypeScript
  - ESLint
