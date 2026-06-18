/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /* ---- circular deps ---- */
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependency detected. Use dependency inversion to break the cycle.",
      from: {},
      to: { circular: true },
    },
    /* ---- orphans ---- */
    {
      name: "no-orphans",
      severity: "warn",
      comment: "This module is likely not used (anymore?). Either use it or remove it.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$",
          "[.]d[.]ts$",
          "(^|/)tsconfig[.]json$",
          "(^|/)(?:babel|webpack)[.]config[.](?:js|cjs|mjs|ts|cts|mts|json)$",
        ],
      },
      to: {},
    },
    /* ---- unresolved ---- */
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment:
        "This module depends on a module that cannot be found. If it's an npm module add it to package.json.",
      from: {},
      to: { couldNotResolve: true },
    },
    /* ---- no-deprecated-core ---- */
    {
      name: "no-deprecated-core",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["core"],
        path: [
          "^(v8/tools/codemap)$",
          "^(v8/tools/consarray)$",
          "^(v8/tools/csvparser)$",
          "^(v8/tools/logreader)$",
          "^(v8/tools/profile_view)$",
          "^(v8/tools/profile)$",
          "^(v8/tools/sourcemap)$",
          "^(v8/tools/splaytree)$",
          "^(v8/tools/tickprocessor-driver)$",
          "^(v8/tools/tickprocessor)$",
          "^(node-inspect/lib/_inspect)$",
          "^(node-inspect/lib/internal/inspect_client)$",
          "^(node-inspect/lib/internal/inspect_repl)$",
          "^(async_hooks)$",
          "^(punycode)$",
          "^(domain)$",
          "^(constants)$",
          "^(sys)$",
          "^(_linklist)$",
          "^(_stream_wrap)$",
        ],
      },
    },
    /* ---- not-to-dev-dep ---- */
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment:
        "This module depends on an npm package from devDependencies. Move it to dependencies if it ships to production.",
      from: {
        path: "^(src)",
        pathNot: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$",
      },
      to: {
        dependencyTypes: ["npm-dev"],
        dependencyTypesNot: ["type-only"],
        pathNot: ["node_modules/@types/"],
      },
    },
    /* ---- not-to-spec ---- */
    {
      name: "not-to-spec",
      severity: "error",
      from: {},
      to: {
        path: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$",
      },
    },
    /* ---- LAYER BOUNDARIES ---- */
    {
      name: "domain-must-not-depend-on-application",
      comment: "Domain layer must not depend on Application layer",
      severity: "error",
      from: { path: "src/modules/[^/]+/domain/" },
      to: { path: "src/modules/[^/]+/application/" },
    },
    {
      name: "domain-must-not-depend-on-infrastructure",
      comment: "Domain layer must not depend on Infrastructure",
      severity: "error",
      from: { path: "src/modules/[^/]+/domain/" },
      to: { path: "src/modules/[^/]+/infrastructure/" },
    },
    {
      name: "domain-must-not-depend-on-presentation",
      comment: "Domain layer must not depend on Presentation",
      severity: "error",
      from: { path: "src/modules/[^/]+/domain/" },
      to: { path: ["src/app/", "src/modules/[^/]+/presentation/"] },
    },
    {
      name: "domain-must-not-depend-on-shared-infrastructure",
      comment: "Domain layer must not depend on shared infrastructure",
      severity: "error",
      from: { path: "src/modules/[^/]+/domain/" },
      to: { path: "src/shared/infrastructure/" },
    },
    {
      name: "application-must-not-depend-on-infrastructure-directly",
      comment: "Application layer must depend on domain abstractions, not infrastructure",
      severity: "error",
      from: { path: "src/modules/[^/]+/application/" },
      to: { path: "src/modules/[^/]+/infrastructure/" },
    },
    {
      name: "application-must-not-depend-on-presentation",
      comment: "Application layer must not depend on presentation",
      severity: "error",
      from: { path: "src/modules/[^/]+/application/" },
      to: { path: ["src/app/", "src/modules/[^/]+/presentation/"] },
    },
    {
      name: "infrastructure-must-not-depend-on-application",
      comment: "Infrastructure layer must not depend on application use-cases",
      severity: "error",
      from: { path: "src/modules/[^/]+/infrastructure/" },
      to: { path: "src/modules/[^/]+/application/" },
    },
    {
      name: "pages-and-components-must-not-depend-on-infrastructure-directly",
      comment:
        "Presentation pages/components must use actions or application services instead of importing infrastructure directly",
      severity: "error",
      from: { path: "src/app/(?!actions/)" },
      to: { path: ["src/modules/[^/]+/infrastructure/", "src/shared/infrastructure/"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.d\\.ts$" },
    includeOnly: "^src",
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx"],
      mainFields: ["main", "types", "typings"],
    },
    skipAnalysisNotInRules: true,
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
