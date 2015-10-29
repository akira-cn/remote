module.exports = {
  entry: {
    "remote-server": "./src/remote-server.js",
    "remote-client": "./src/remote-client.js",
  },
  output: {
    library: '',
    libraryTarget: "umd",
    path: "./dist",
    filename: "[name].umd.js"
  }
}