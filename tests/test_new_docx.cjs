const fs = require('fs');
const JSZip = require('jszip');

// Import generators by reading the files or running through a node script
const { generateNotice352Docx } = require('../src/utils/docxGenerators/generateNotice352Docx.js');
