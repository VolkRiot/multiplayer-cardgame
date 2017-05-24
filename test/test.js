"use strict";

const request = require('supertest');
const app = require('../app.js');
const server = require('../bin/www');

describe('GET /', function() {
  it('loads web page, and then redirects if not logged in', function(done) {
    request(server)
      .get('/')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302, done);
  });
});

describe('GET /auth/google', function() {
  it('loads web page, then redirects', function(done) {
    request(server)
      .get('/auth/google')
      .expect(302, done);
  });
});

