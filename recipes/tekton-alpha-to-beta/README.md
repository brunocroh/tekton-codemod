# Tekton Alpha to Beta Migration Codemod

Automatically migrates Tekton Pipeline YAML files from `v1alpha1` to `v1beta1` API version following the [official Tekton migration guide](https://tekton.dev/docs/pipelines/migrating-v1alpha1-to-v1beta1/).

## Installation

```bash
# Install from registry
codemod run tekton-alpha-to-beta

# Or run locally
codemod run -w workflow.yaml
```

## What This Codemod Does

This codemod performs the following transformations on your Tekton YAML files:

### 1. Parameter Structure Migration

**Before (v1alpha1):**

```yaml
spec:
  inputs:
    params:
      - name: ADDR
        description: Address to curl
        type: string
```

**After (v1beta1):**

```yaml
spec:
  params:
    - name: ADDR
      description: Address to curl
      type: string
```

The codemod moves `spec.inputs.params` directly to `spec.params` and removes the `inputs` wrapper.

### 2. Resources Structure Migration

**Before (v1alpha1):**

```yaml
spec:
  inputs:
    resources:
      - name: source-repo
        type: git
  outputs:
    resources:
      - name: built-image
        type: image
```

**After (v1beta1):**

```yaml
spec:
  resources:
    inputs:
      - name: source-repo
        type: git
    outputs:
      - name: built-image
        type: image
```

The codemod restructures resource definitions by:

- Moving `spec.inputs.resources` → `spec.resources.inputs`
- Moving `spec.outputs.resources` → `spec.resources.outputs`
- Consolidating both input and output resources under a single `spec.resources` block

## Files Processed

This codemod processes:

- `**/*.yml` files
- `**/*.yaml` files

## Migration Details

The transformations align with Tekton's v1beta1 API changes:

1. **Parameter Flattening**: Parameters are moved from the nested `inputs.params` structure to a flat `params` array at the spec level.

2. **Resource Consolidation**: Input and output resources are consolidated under a single `resources` object with separate `inputs` and `outputs` arrays.

3. **Structure Cleanup**: Removes the now-obsolete `inputs` and `outputs` top-level sections when they only contained params or resources.

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

## Important Notes

- This codemod handles the structural changes from v1alpha1 to v1beta1
- Always review the transformed files before committing changes
- Test your pipelines after migration to ensure they work as expected

## License

MIT
