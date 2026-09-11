# chat-widget

Embeddable website chat widget — drop-in `<script>` for any host page.

## Development

This repo uses **yarn**. Do not use npm — peer-dep resolution will fail.

```bash
yarn install
yarn start         # dev server runs on http://localhost:5000
```

## Build

```bash
yarn build
```

Output goes to `build/`. The minified standalone bundles in
[`public/`](public/) (e.g. `chat.js`, `dev-chat.js`) are rebuilt from
[`chatScripts/`](chatScripts/) — they are **not** part of `yarn build`
and must be generated separately when the embed protocol changes.

## License

MIT — see [LICENSE](LICENSE).
