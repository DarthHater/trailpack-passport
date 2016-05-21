'use strict'
const Trailpack = require('trailpack')
const lib = require('./lib')
const _ = require('lodash')

module.exports = class PassportTrailpack extends Trailpack {

  /**
   * Check express4 is used and verify session configuration
   */
  validate() {
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack work only for express !'))
    }

    if (!this.app.config.session) {
      return Promise.reject(new Error('No configuration found at config.session !'))
    }

    const strategies = this.app.config.session.strategies
    if (!strategies || (strategies && Object.keys(strategies).length == 0)) {
      return Promise.reject(new Error('No strategies found at config.session.strategies !'))
    }

    if (strategies.jwt && _.get(this.app, 'config.session.jwt.tokenOptions.secret') === 'mysupersecuretoken') {
      return Promise.reject(new Error('You need to change the default token !'))
    }

    return Promise.all([
      lib.Validator.validatePassportsConfig(this.app.config.session)
    ])
  }

  /**
   * Initialise passport functions and load strategies
   */
  configure() {
    lib.Passports.init(this.app)
    lib.Passports.loadStrategies(this.app)
  }

  constructor(app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

