# Two recommended structures for CassidyDC Toolset

## 1. Assessment of the current project

Your separation of **tools** and **standards** is a useful foundation. The main addition should be an explicit model for projects and package relationships.

The repository is still a scaffold: the CLI contains only its executable header, the 12 tool modules are empty, and the seven standards modules contain documentation comments. This gives you room to establish the architecture before restructuring becomes expensive.

The main improvements I recommend are:

- **Separate project type, language, framework, standard, and package layout.** WordPress is a project environment; PHP and Python are languages; React is a framework capability; WordPress/community are standards; root-only/nested/workspaces are layouts.
- **Rename `src/packages` to `src/projects`.** These directories describe generated project setups, rather than npm packages belonging to this repository.
- **Keep project identity independent of package position.** A WordPress plugin can be standalone or a child package. It should reuse the same project definition.
- **Add a resolution and generation layer.** Tool modules should receive resolved settings rather than independently interpreting CLI answers.
- **Separate this package’s own configuration from generated configuration assets.** Root ESLint, Prettier, and Lefthook files configure development of the toolset itself.
- **Treat generated-project dependencies separately from generator dependencies.** The toolset’s `devDependencies` are not the dependency list to install in a consumer project.

Your selected defaults are editable generated files, support for both nested-package layouts, and standards overrides by language and package.

## 2. Recommendation A: evolve the current structure

Keep the existing tools/standards organization and add the missing responsibilities:

```text
src/
  cli.js
  core/
    resolve.js
    plan.js
    apply.js
    contracts.js
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
  layouts/
    single.js
    nested.js
    workspaces.js
  tools/
    eslint/
      index.js
      templates/
    prettier/
      index.js
      templates/
    lefthook/
      index.js
      templates/
    …other tools…
tests/
  unit/
  integration/
  fixtures/
```

Each part has one responsibility:

| Part         | Responsibility                                                                   |
| ------------ | -------------------------------------------------------------------------------- |
| CLI          | Collect answers and arguments; present previews and results.                     |
| Projects     | Supply default languages, capabilities, paths, and tool selections.              |
| Capabilities | Add framework-specific requirements, such as JSX support.                        |
| Standards    | Supply language-specific policies and tool-specific rule settings.               |
| Layouts      | Describe package boundaries and root-to-child script delegation.                 |
| Tools        | Produce configuration, dependency requirements, scripts, and hook contributions. |
| Core         | Resolve choices, detect conflicts, and coordinate writes.                        |

Use tool-native settings inside standards definitions where necessary. For example, a JavaScript standard can contain ESLint rules and Prettier settings; you do not need to invent a universal rule language.

Keep templates small. Static file content belongs in templates; configuration objects and manifests should be assembled as structured data. Avoid complete template sets for every combination of WordPress, React, standards, and package layout.

Drop redundant filenames such as `tool-eslint.js` once they live inside clearly named tool directories.

**Choose this option if you want a straightforward continuation of the organization you have already started.**

## 3. Recommendation B: design from scratch

I would build a **configuration generator with a declarative catalog**, shipped as one npm package.

```text
bin/
  cdc-tools.js
src/
  cli/
    commands/
    prompts/
  engine/
    resolve.js
    plan.js
    apply.js
    package-graph.js
  catalog/
    projects/
    capabilities/
    policies/
    tools/
      eslint/
        definition.js
        render.js
        assets/
      prettier/
        definition.js
        render.js
        assets/
      …other tools…
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
  architecture.md
  adding-a-tool.md
  generated-projects.md
```

The catalog describes **what is available**; the engine determines **what a particular project needs**; platform adapters perform filesystem and package-manager operations.

- **Project entries** describe environments such as a WordPress site, WordPress plugin, generic PHP application, or Python application.
- **Capability entries** add support such as React or TypeScript.
- **Policy entries** select standards and contribute settings to the relevant tools.
- **Tool entries** keep their metadata, rendering logic, assets, dependencies, and supported options together.
- **The package graph** represents the root and selected child packages independently of their physical folder conventions.

A WordPress project could select community policies and React capabilities. A child theme could inherit that setup while overriding JavaScript standards. The engine resolves these selections before asking any tool to render output.

Keep the catalog internal initially. An external plugin API and multiple published packages would add compatibility obligations before the product needs them.

**This is my preferred architecture for the breadth you described.**

## 4. Behavior and interfaces for either design

Use the same generation pipeline:

```text
CLI answers + saved selections + discovered project information
                            ↓
                  Resolved package graph
                            ↓
        Proposed files, manifest changes, dependencies
                            ↓
                   Preview and validation
                            ↓
                         Apply
```

Define internal contracts for `ProjectRequest`, `ResolvedProject`, `ToolContribution`, and `GenerationPlan`. JSDoc types are sufficient for the existing JavaScript codebase.

Expose `cdc-tools init`, `cdc-tools update`, and a non-writing `--dry-run`. Use distinct selectors for projects, languages, tools, standards, and layouts. Replace the documented `--script=wordpress-site` terminology with `--project=wordpress-site`.

Important behavior:

- **Inheritance:** Project definitions provide defaults; explicit user selections override them. Children inherit resolved parent choices unless explicitly overridden.
- **Saved selections:** Store the chosen setup and package paths in a versioned `.cdc-toolset.json`. Detect candidates, but configure only selected packages; exclude dependency and build directories.
- **Editable output:** Generate self-contained files without imports from the toolset. Record generation state separately. On updates, automatically replace unchanged generated content; present conflicts for user-modified content before writing.
- **Manifest preservation:** Preserve unrelated scripts, dependencies, and manifest fields. Conflicting existing script names require resolution rather than silent replacement.
- **Dependency ecosystems:** Track npm, Composer, and Python requirements separately. Show installation commands by default; an explicit `--install` performs installation.
- **Package boundaries:** Generate local commands that exclude registered child packages, plus root aggregate commands that call child scripts. This prevents duplicate linting.
- **Orchestration:** Use workspace targeting for registered npm workspaces and path-based invocation for ordinary nested packages. npm supports running scripts in selected workspaces. [npm workspace documentation](https://docs.npmjs.com/cli/using-npm/workspaces/)
- **Configuration resolution:** Give each package the effective configuration it needs rather than assuming every tool merges parent and child files. ESLint and Prettier document their own lookup behavior. [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files), [Prettier configuration](https://prettier.io/docs/configuration)
- **Git integration:** Model the Git repository boundary separately from the selected project root. Generate one hook integration per Git repository and route staged files to their owning package.
- **Formatting consistency:** Resolve formatting settings once and use them across EditorConfig, Prettier, and lint rules. Report incompatible combinations before generating files.

For packaging, keep `bin` as the CLI entry, remove `main` unless you intentionally offer a programmatic API, and ensure published files include every required generation asset.

## 5. Validation and implementation sequence

Start with one complete path: a standalone WordPress plugin using PHP and JavaScript. Then add child-package orchestration, followed by React and Python support.

Validate behavior with representative fixtures:

- The same project generated under WordPress and community standards.
- A WordPress site with a plugin and theme, including a child-specific override.
- Both npm workspaces and ordinary nested packages.
- Root and child commands checking each selected file once.
- Repeat generation producing no changes.
- Updates preserving edited configuration and unrelated manifest content.
- JavaScript configurations loading in both ESM and CommonJS consumer projects.
- A packed npm artifact containing and successfully locating its templates.

Run generated tools against small fixture projects, alongside unit tests for resolution and planning. Document supported combinations and examples in `README.md`, record completed behavior in `CHANGELOG.md`, and commit each completed implementation increment.
