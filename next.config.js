const netlifyPlugin = require('@netlify/next');

module.exports = {
  ...netlifyPlugin.default,
  reactStrictMode: true,

};


//42