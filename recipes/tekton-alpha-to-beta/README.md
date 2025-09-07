# tekton-alpha-to-beta

Migrating From Tekton v1alpha1 to Tekton v1beta1 

## Installation

```bash
# Install from registry
codemod run tekton-alpha-to-beta

# Or run locally
codemod run -w workflow.yaml
```

## Usage

This codemod transforms yaml code by:

- Converting `var` declarations to `const`/`let`
- Removing debug statements
- Modernizing syntax patterns

## Development

```bash
# Test the transformation
npm test

# Validate the workflow
codemod validate -w workflow.yaml

# Publish to registry
codemod login
codemod publish
```

## License

MIT 