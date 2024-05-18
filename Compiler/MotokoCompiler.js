const motoko = require('motoko');

async function compileMotokoCode(motokoSource) {
  try {
    const result = await motoko.compileMotoko(motokoSource);
    return result;
  } catch (error) {
    console.error('Error compiling Motoko code:', error);
    throw error;
  }
}

module.exports = { compileMotokoCode };
