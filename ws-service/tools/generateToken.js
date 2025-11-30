#!/usr/bin/env node
const jwt = require('jsonwebtoken');

const secret = process.env.WS_JWT_SECRET || 'CHANGE_ME_IN_PROD';
const clienteId = process.argv[2];

if (!clienteId) {
  console.error('Usage: node tools/generateToken.js <clienteId> [expiresIn]');
  console.error('Example: node tools/generateToken.js 1234 7d');
  process.exit(1);
}

const expiresIn = process.argv[3] || '7d';
const token = jwt.sign({ sub: String(clienteId) }, secret, { expiresIn });
console.log(token);
