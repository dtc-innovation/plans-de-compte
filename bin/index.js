#!/usr/bin/env node

// Provide options as a parameter or options file.
require = require("esm")(module);
module.exports = require("./plans-de-compte.js").default;
