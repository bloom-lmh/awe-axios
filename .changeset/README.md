# Changesets

Use Changesets to manage version bumps and releases for all published packages in this workspace.

## Common workflow

1. `npm run changeset`
2. Select the affected packages and change types
3. Commit the generated markdown file
4. When ready to release, run `npm run version-packages`
5. Review the updated package versions and changelog entries
6. Publish with `npm run release`
