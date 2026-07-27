const appModule = require("../artifacts/api-server/dist/index.cjs");

module.exports = appModule.default || appModule;
