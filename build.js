/* eslint-disable */

const process = require("process")
const fs = require("fs")
const Bundler = require("parcel")

const getOptions = dir => ({
  outDir: `./dist/${dir}`,
  contentHash: false,
  minify: false,
  target: "node",
})

fs.promises.readdir("src/commands")
  .then(dirs => dirs.map(
    d => new Bundler(`src/commands/${d}/*.js`, getOptions(d)),
  ))
  .then(async bundlers => {
    for (const bundler of bundlers) {
      await bundler.bundle()
    }

    process.exit()
  })
