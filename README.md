# Sokolski dom Novi Sad

Static website for Sokolski dom Novi Sad. Built with Vite.

## Requirements

- Node.js 18+
- pnpm

## Install

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

The prebuild step generates WebP image variants for all photos in `assets/img/`. Output goes to `dist/`.

## Preview build

```bash
pnpm preview
```

## Notes

- WebP variants are committed to the repo. The prebuild step skips files that already exist and only generates new ones when source images are added.
- To force regeneration of a WebP file, delete the corresponding `*-NNNpx.webp` file and run build again.
