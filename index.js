const express = require("express")
const solc = require("solc")
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const question  = require("./models/Question");
const { compileMotokoCode } = require("./Compiler/MotokoCompiler");
const mo = require('motoko');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const connect = 'mongodb+srv://anuragsidhu:test123@cluster0.nnj9xje.mongodb.net/panel'

app.post('/compile', (req, res) => {
    const solCode = req.body.solCode;

    // Compile the Solidity code
    const { bytecode, abi, errors , contract , outputData } = compileSolidityCode(solCode);

    if (errors) {
        res.status(400).json({ errors });
    } else {
        res.json({ bytecode, abi , contract , outputData });
    }
});

function compileSolidityCode(solCode) {
    // Define the Solidity source code
    const input = {
        language: 'Solidity',
        sources: {
            'contract.sol': {
                content: solCode,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    // Compile the Solidity code
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    const outputData = JSON.stringify(output,null,2)

    // Check for compilation errors
    if (output.errors) {
        const errors = output.errors.map(error => error.formattedMessage);
        return { errors };
    }

    // Extract and return the compiled contract bytecode and ABI
    const contractName = Object.keys(output.contracts['contract.sol'])[0];
    const bytecode = output.contracts['contract.sol'][contractName].evm.bytecode.object;
    const abi = output.contracts['contract.sol'][contractName].abi;
    const contract = output.contracts['contract.sol'][contractName];

    return { bytecode, abi ,contract,outputData};
}


app.post('/motoko', async (req, res) => {
    const { solCode } = req.body;
    if (!solCode) {
      return res.status(400).json({ error: 'No code provided' });
    }
  
    try {
        mo.write('Main.mo', `
        ${solCode}
      `)
      const runOutput = mo.run('Main.mo');

      // Assuming runOutput contains the result "Hello, World!"
      res.json({ result: runOutput });
    //   res.json(mo.candid('Main.mo') );
    } catch (error) {
      res.status(500).json({ error: 'Compilation failed', details: error.message });
    }
  });

mongoose.connect(connect)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });
app.listen(port, () => {
    console.log("listening on port 8080");
})


app.post("/Create",async(req,res)=>{
try {
    const { Name, Level, Description, StarterCode, Output } = req.body;

    const createData = await question.create({
        Name,
        Description,
        StarterCode,
        Level,
        Output
    })

   return res.status(201).json(createData);

} catch (error) {
  return  res.status(500).json({ error: 'Compilation failed', details: error.message });
}
})

app.get("/Question",async( req , res)=>{
    try {
        const getData = await question.find()
        return res.status(201).json(getData);
    } catch (error) {
       return  res.status(500).json({ error: 'Compilation failed', details: error.message });
    }
})

app.get("/Question/:id",async(req,res)=>{
    try {
        const id = req.params.id;
        const getData = await question.findById(id)
        return res.status(201).json(getData);
    } catch (error) {
        return  res.status(500).json({ error: 'Compilation failed', details: error.message });
    }
})

