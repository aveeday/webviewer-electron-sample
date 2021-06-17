# WebViewer - Electron sample

## Issues

### Memory leak

https://youtu.be/97pVZJ_SqiE

memory is not freed when re-creating an webviewer instance

### Slow saving

https://youtu.be/b_IMQn97coE

~4 MB example document:
https://docs.aws.amazon.com/codebuild/latest/userguide/codebuild-user.pdf

saving time: 68 s

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/PDFTron/webviewer-electron-sample.git
cd webviewer-electron-sample
npm install
```

## Run

```
npm start
```

## Build

Since Electron builds are platform specific, please refer to [the guides](https://electronjs.org/docs/development/build-instructions-gn) to learn how to build your project for production.

## WebViewer APIs

See [API documentation](https://www.pdftron.com/documentation/web/guides/ui/apis).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-electron-sample)
