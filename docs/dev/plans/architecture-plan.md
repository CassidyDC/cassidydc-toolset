# CassidyDC Toolset organization plan

## Proposed structure

```text
bin/
  cdctool.js
src/
  cli/
    commands/
    prompts/
  generator/
    resolve.js
    plan.js
    apply.js
    package-graph.js
    layouts/
      single.js
      nested.js
      workspaces.js
  components/
    projects/
      wordpress/
        site.js
        plugin.js
        theme.js
      node.js
      php.js
      python.js
    capabilities/
      react.js
      typescript.js
    standards/
      javascript/
        community.js
        wordpress.js
      css/
        community.js
        wordpress.js
      php/
        community.js
        wordpress.js
      python/
        community.js
    tools/
      editorconfig/
        definition.js
        render.js
        templates/
      eslint/
        definition.js
        render.js
        templates/
      gitignore/
        definition.js
        render.js
        templates/
      lefthook/
        definition.js
        render.js
        templates/
      markdownlint/
        definition.js
        render.js
        templates/
      parallellint/
        definition.js
        render.js
        templates/
      phpcs/
        definition.js
        render.js
        templates/
      phpstan/
        definition.js
        render.js
        templates/
      prettier/
        definition.js
        render.js
        templates/
      stylelint/
        definition.js
        render.js
        templates/
      vscode/
        definition.js
        render.js
        templates/
      webpack/
        definition.js
        render.js
        templates/
  platform/
    filesystem.js
    npm.js
    composer.js
    python.js
  contracts.js
tests/
  unit/
  integration/
  fixtures/
docs/
  dev/
    plans/
      architecture-plan.md
  architecture.md
  adding-a-tool.md
  generated-projects.md
```

The tree describes the proposed toolset architecture. Each tool's `templates/` directory is optional and should be created only when that integration needs templates.

## Summary

Use the structure in `docs/dev/plans/organization-plan.md`, with `generator/`, `components/`, and `standards/` as the agreed names. Each tool uses `definition.js`, `render.js`, and an optional `templates/` directory.

The package will generate editable development configuration files from selections for project type, languages, capabilities, coding standards, tools, and package layout. It will support standalone projects, ordinary nested packages, and npm workspaces.

This plan defines the organization and responsibilities of the codebase. Individual tool rules and preset values will be specified as those components are implemented.

## Directory and file responsibilities

### Executable entry point

```text
bin/
  cdctool.js
```

| Path         | Responsibility                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bin/`       | Contains executable entry points distributed with the npm package.                                                                                                                   |
| `cdctool.js` | Provides the Node.js executable header, starts the CLI, and translates completion or failure into a process exit code. Keep argument handling and generation logic out of this file. |

Keep the existing public command name, `cdc-tools`, and point its `package.json` `bin` entry to `bin/cdctool.js`. The executable filename does not require renaming the command.

### CLI

```text
src/
  cli/
    commands/
    prompts/
```

| Path        | Responsibility                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`      | Contains the application's implementation and packaged generation templates.                                                                                                                    |
| `cli/`      | Handles terminal interaction: arguments, command dispatch, previews, progress, and readable errors.                                                                                             |
| `commands/` | Implements command workflows. `init` collects a new setup; `update` loads an existing setup and proposes changes. Both call the generator rather than constructing configurations themselves.   |
| `prompts/`  | Collects project, language, capability, standard, tool, and layout selections. Also handles package selection and conflict decisions. Returns structured answers without writing project files. |

Interactive answers and equivalent command-line arguments must produce the same request. Noninteractive operation must not depend on prompt modules.

### Generator

```text
src/
  generator/
    resolve.js
    plan.js
    apply.js
    package-graph.js
    layouts/
      single.js
      nested.js
      workspaces.js
```

| Path               | Responsibility                                                                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generator/`       | Coordinates conversion of user selections into proposed project changes and applies an approved, validated result.                                                                                                                                                         |
| `resolve.js`       | Combines project defaults, capabilities, standards, inherited package settings, and explicit overrides. Validates supported combinations and produces fully resolved settings for every selected package.                                                                  |
| `plan.js`          | Invokes tool renderers and the selected layout strategy. Combines their contributions into proposed files, manifest edits, dependency requirements, installation commands, and conflicts. Reads existing project state through platform adapters but does not write files. |
| `apply.js`         | Checks that planned changes are still applicable, writes conflict-free changes through platform adapters, records successful generation state, and optionally runs requested dependency installations. Reports partial failures accurately.                                |
| `package-graph.js` | Discovers candidate package manifests and represents selected package roots, parent/child relationships, and workspace membership. Tracks the Git repository boundary separately from package boundaries.                                                                  |
| `layouts/`         | Contains strategies for configuration placement, dependency placement, package ownership, and script delegation. Consumes the package graph rather than rediscovering directories.                                                                                         |
| `single.js`        | Generates a setup for one selected package without child-package orchestration. The package runs its own tools directly.                                                                                                                                                   |
| `nested.js`        | Supports independent nested packages. Generates child-local scripts and root delegation using package paths. Keeps dependency installation scoped to the package that needs it.                                                                                            |
| `workspaces.js`    | Supports registered npm workspaces. Generates workspace-aware script delegation and dependency installation instructions, preserving existing workspace declarations.                                                                                                      |

Layout strategies must keep root-local checks separate from aggregate checks. Root-local tools exclude selected child package directories so aggregate commands do not process the same files twice.

A plugin or theme uses the same project definition whether it is standalone, nested, or a workspace.

### Components

```text
src/
  components/
    projects/
    capabilities/
    standards/
    tools/
```

| Path            | Responsibility                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/`   | Contains the selectable definitions and tool implementations used to assemble a setup. Components contribute data and rendered output without independently performing installation or filesystem writes. |
| `projects/`     | Defines defaults appropriate to a project environment.                                                                                                                                                    |
| `capabilities/` | Defines optional additions that can be composed with project defaults.                                                                                                                                    |
| `standards/`    | Defines language-specific coding conventions and the corresponding tool settings.                                                                                                                         |
| `tools/`        | Contains tool metadata, rendering logic, and generation templates.                                                                                                                                        |

Project, capability, and standard definitions reference tools by stable identifiers. The resolver maintains an explicit mapping of supported component identifiers; avoid automatic directory scanning or an external plugin-loading system initially.

### Project definitions

```text
src/components/projects/
  wordpress/
    site.js
    plugin.js
    theme.js
  node.js
  php.js
  python.js
```

| Path         | Responsibility                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wordpress/` | Groups project definitions that share the WordPress environment. It does not impose one standard or layout on every WordPress project.                                                   |
| `site.js`    | Defines defaults for a WordPress site's `wp-content` project, including relevant languages, paths, tools, and plugin/theme discovery hints. Child packages remain explicitly selectable. |
| `plugin.js`  | Defines WordPress plugin defaults, including relevant source paths, environment settings, and tool selections. Supports standalone and child-package use.                                |
| `theme.js`   | Defines WordPress theme defaults, including theme-related source and asset paths. React and TypeScript remain optional capabilities.                                                     |
| `node.js`    | Defines defaults for a general Node.js project, including its JavaScript runtime environment and relevant tools.                                                                         |
| `php.js`     | Defines defaults for a general PHP project without assuming WordPress APIs or conventions.                                                                                               |
| `python.js`  | Defines the Python project environment and Python-specific paths. References supported Python tool components as those integrations are introduced.                                      |

Project definitions provide overridable defaults. Selecting WordPress as the project environment must not prevent selecting community coding standards.

### Capability definitions

```text
src/components/capabilities/
  react.js
  typescript.js
```

| File            | Responsibility                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react.js`      | Adds JSX-related file patterns, lint configuration contributions, and required tooling. It must not automatically select a bundler or application framework. |
| `typescript.js` | Adds TypeScript-related patterns, parser or plugin requirements, and configuration contributions. It can combine with React for TSX support.                 |

Capabilities describe additions to a setup; they do not determine package layout or replace the selected project definition.

### Standards definitions

```text
src/components/standards/
  javascript/
    community.js
    wordpress.js
  css/
    community.js
    wordpress.js
  php/
    community.js
    wordpress.js
  python/
    community.js
```

| Directory or file         | Responsibility                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `javascript/`             | Groups JavaScript coding standards. TypeScript-specific adjustments come from the TypeScript capability and compatible tool settings. |
| `javascript/community.js` | Defines the toolset's documented community JavaScript baseline.                                                                       |
| `javascript/wordpress.js` | Defines the WordPress JavaScript baseline.                                                                                            |
| `css/`                    | Groups stylesheet coding standards.                                                                                                   |
| `css/community.js`        | Defines the community stylesheet baseline.                                                                                            |
| `css/wordpress.js`        | Defines the WordPress stylesheet baseline.                                                                                            |
| `php/`                    | Groups PHP coding standards.                                                                                                          |
| `php/community.js`        | Defines the documented community PHP baseline.                                                                                        |
| `php/wordpress.js`        | Defines the WordPress PHP baseline.                                                                                                   |
| `python/`                 | Groups Python coding standards.                                                                                                       |
| `python/community.js`     | Defines the documented Python conventions and contributions for supported Python tools.                                               |

"Community" means a named, documented baseline chosen by this package; it must not imply that every community follows one standard.

Standards may contain tool-native settings, such as ESLint rules, Prettier options, or PHPCS ruleset contributions. Do not introduce a universal rule language.

Resolve formatting choices consistently across standards, EditorConfig, formatters, and linters. Unsupported combinations must produce a clear diagnostic.

### Tool implementations

```text
src/components/tools/
  eslint/
    definition.js
    render.js
    templates/
  prettier/
    definition.js
    render.js
    templates/
```

Apply this structure to each tool:

| Path            | Responsibility                                                                                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool directory  | Owns one tool's integration, including configuration output, dependencies, scripts, ignore patterns, and hook contributions.                                                                                                           |
| `definition.js` | Declares the tool identifier, supported languages and capabilities, package requirements, available operations, and configuration scope. Contains no filesystem or installation side effects.                                          |
| `render.js`     | Accepts resolved settings and package context; returns configuration content and structured contributions for scripts, manifests, dependencies, and hooks.                                                                             |
| `templates/`    | Holds configuration fragments, parameterized templates, and complete files copied unchanged. Resolve templates relative to the installed module, not the user's current directory. Omit this directory when a tool needs no templates. |

Specific integrations have these responsibilities:

| Tool directory  | Generated behavior                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `editorconfig/` | Editor settings derived from shared formatting choices.                                                             |
| `eslint/`       | JavaScript and TypeScript lint configuration, including selected framework and standard contributions.              |
| `gitignore/`    | Project-appropriate ignore entries while preserving unrelated existing entries.                                     |
| `lefthook/`     | Hook configuration assembled from selected tool contributions, with staged files routed to the appropriate package. |
| `markdownlint/` | Markdown lint configuration, ignores, and scripts.                                                                  |
| `parallellint/` | PHP syntax-checking scripts and applicable configuration.                                                           |
| `phpcs/`        | PHP coding-standard configuration and scripts.                                                                      |
| `phpstan/`      | PHP static-analysis configuration and scripts.                                                                      |
| `prettier/`     | Formatting configuration and ignore patterns consistent with resolved formatting choices.                           |
| `stylelint/`    | Stylesheet lint configuration and related scripts.                                                                  |
| `vscode/`       | Suggested extensions and workspace settings while preserving unrelated user settings.                               |
| `webpack/`      | Build configuration only when explicitly selected; project type alone must not silently enable it.                  |

Other tool renderers contribute hook requirements to the plan. The Lefthook renderer owns serialization of the combined hook configuration.

### Platform adapters

```text
src/
  platform/
    filesystem.js
    npm.js
    composer.js
    python.js
```

| Path            | Responsibility                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform/`     | Isolates filesystem access and ecosystem-specific process execution from generation rules.                                                                                                      |
| `filesystem.js` | Reads manifests and files, resolves paths, checks file state, creates directories, and performs safe writes. Rejects writes outside the selected project boundary unless separately authorized. |
| `npm.js`        | Reads npm package and workspace information, prepares package-scoped installation commands, and executes explicitly requested npm installations.                                                |
| `composer.js`   | Prepares and executes Composer dependency operations for the selected PHP packages.                                                                                                             |
| `python.js`     | Handles Python environment and dependency operations for explicitly supported Python tooling. Reports unsupported environment managers rather than guessing installation behavior.              |

Adapters execute requirements supplied by the generator. They do not choose standards or decide which tools a project needs.

### Shared contracts

```text
src/
  contracts.js
```

Use JSDoc definitions for the internal structures exchanged between subsystems:

| Contract           | Purpose                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `ProjectRequest`   | Normalized CLI answers or saved selections.                                               |
| `PackageGraph`     | Selected package boundaries, relationships, and workspace membership.                     |
| `ResolvedProject`  | Effective settings and selected components for each package.                              |
| `ToolContribution` | Proposed configuration content, scripts, dependencies, and hook requirements from a tool. |
| `GenerationPlan`   | Combined changes, conflicts, diagnostics, and optional installation operations.           |
| `ApplyResult`      | Applied changes, skipped or failed operations, and installation results.                  |

Keep contracts free of execution logic. These are internal interfaces, not a promised public JavaScript API.

### Tests

```text
tests/
  unit/
  integration/
  fixtures/
```

| Path           | Responsibility                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/`       | Contains automated verification of generation behavior.                                                                                      |
| `unit/`        | Tests resolution, inheritance, package relationships, layout strategies, and meaningful tool-rendering cases without external installations. |
| `integration/` | Tests complete CLI workflows, generated manifests and configurations, safe updates, and the published package artifact.                      |
| `fixtures/`    | Contains representative input projects and expected outputs. Tests copy fixtures into temporary directories before applying changes.         |

### Documentation

```text
docs/
  dev/
    plans/
      architecture-plan.md
  architecture.md
  adding-a-tool.md
  generated-projects.md
```

| Path                    | Responsibility                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`                 | Contains architecture, contributor, and generated-project reference material.                                                           |
| `dev/`                  | Groups development planning material.                                                                                                   |
| `plans/`                | Contains proposed implementation and organization plans.                                                                                |
| `architecture-plan.md`  | Records this proposed structure, subsystem responsibilities, and validation requirements.                                               |
| `architecture.md`       | Explains subsystem boundaries, dependency direction, contracts, and the resolution-to-application pipeline.                             |
| `adding-a-tool.md`      | Documents tool definitions, rendering, templates, dependency declarations, script and hook contributions, registration, and testing.    |
| `generated-projects.md` | Shows generated standalone and multi-package examples, configuration ownership, standards overrides, root scripts, and update behavior. |

Keep the organization plan under `docs/dev/plans/`. Use the root `README.md` for installation and usage, and `CHANGELOG.md` for completed user-visible changes.

## Generation flow and ownership

1. The executable starts the CLI command.
2. The CLI collects arguments, saved selections, and any interactive answers.
3. Package discovery identifies candidates; the user's selections establish the package graph.
4. The resolver combines project defaults, standards, capabilities, and package overrides.
5. The planner obtains tool contributions and applies the selected layout strategy.
6. The CLI presents proposed changes and any conflicts.
7. The application step writes validated changes and optionally installs dependencies.

Generated files are self-contained and user-editable. Store reproducible selections in a versioned `.cdc-toolset.json` and generation metadata separately in `.cdc-toolset-state.json`.

Updates may replace unchanged generated content automatically. Modified files and conflicting manifest entries must be presented for resolution before writing. Preserve unrelated manifest fields, scripts, and dependencies.

`--dry-run` performs discovery, resolution, and planning without writing files or installing dependencies. Dependency installation requires explicit `--install`.

The published npm package must include `bin/`, `src/`, and all required templates. Remove `main` unless a public JavaScript API is deliberately introduced.

## Validation and implementation sequence

Implement one complete standalone WordPress plugin setup first, then nested packages and workspaces, followed by additional capabilities and ecosystems.

Required validation includes:

- WordPress and community standards for the same project.
- Language-specific standards and child-package overrides.
- Plugin and theme definitions working across all three layout strategies.
- Aggregate commands checking each selected file once.
- Repeated generation producing no changes.
- Updates preserving edited files and unrelated manifest content.
- Conflicts and dry runs causing no project writes.
- Generated JavaScript configurations working with ESM and CommonJS consumer projects.
- Root hook integration respecting package ownership and Git boundaries.
- Installation failures remaining distinguishable from successful file generation.
- A packed npm artifact successfully locating and using its templates.

Update relevant documentation and commit each completed implementation increment.
