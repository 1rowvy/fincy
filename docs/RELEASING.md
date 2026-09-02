# Releasing

## Cutting a release

1. Bump the version in `package.json`, `src-tauri/Cargo.toml` and
   `src-tauri/tauri.conf.json` (keep them in sync).
2. Commit, then push a matching tag:

   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. `.github/workflows/release.yml` runs on `windows-latest`, builds the installer
   with `tauri-action`, signs the updater artifacts and creates a **draft**
   GitHub Release with a `latest.json` manifest attached.
4. Review the draft and **publish** it. Clients only see the update once the
   release is published and not marked as a prerelease.

## Auto-update

- The app polls
  `https://github.com/1rowvy/fincy/releases/latest/download/latest.json` on
  startup and from Settings.
- The updater public key is in `src-tauri/tauri.conf.json` under
  `plugins.updater.pubkey`.
- CI signs with the `TAURI_SIGNING_PRIVATE_KEY` repository secret (full contents
  of the private key produced by `tauri signer generate`). The key has no
  password, and GitHub can't store an empty secret, so the workflow passes an
  empty `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` inline.
- **Back up the private key.** Losing it means no client can verify future
  updates and everyone has to reinstall manually.

## Regenerating the signing key

```bash
npx tauri signer generate -w ~/.tauri/fincy-updater.key
```

Then update `plugins.updater.pubkey` in `tauri.conf.json` with the new public key
and replace the `TAURI_SIGNING_PRIVATE_KEY` secret.
