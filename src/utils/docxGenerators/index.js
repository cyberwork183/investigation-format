/**
 * index.js
 * Unified DOCX generator engine for all investigation documents.
 */

import { generateOfficialDocx as generateForm3Docx, downloadDocxBlob as downloadForm3Blob } from '../docxGenerator.js';
import { generateRemandDocx } from './generateRemandDocx.js';
import { generateMedicalDocx } from './generateMedicalDocx.js';
import { generateLockupPsDocx } from './generateLockupPsDocx.js';
import { generateLockupAcpDocx } from './generateLockupAcpDocx.js';
import { generateCustodyTransferDocx } from './generateCustodyTransferDocx.js';
import { generateArrestPermissionDocx } from './generateArrestPermissionDocx.js';
import { downloadBlob } from './commonDocxUtils.js';

export {
  generateForm3Docx,
  downloadForm3Blob,
  generateRemandDocx,
  generateMedicalDocx,
  generateLockupPsDocx,
  generateLockupAcpDocx,
  generateCustodyTransferDocx,
  generateArrestPermissionDocx,
  downloadBlob
};

/**
 * Universal document generator dispatcher
 */
export async function generateDocumentDocx(docId, formData, extraData = {}) {
  switch (docId) {
    case 'form3':
      return await generateForm3Docx(formData, extraData.photoBuffer);
    case 'remand':
      return await generateRemandDocx(formData);
    case 'medical':
      return await generateMedicalDocx(formData);
    case 'lockup_ps':
      return await generateLockupPsDocx(formData);
    case 'lockup_acp':
      return await generateLockupAcpDocx(formData);
    case 'custody_transfer':
      return await generateCustodyTransferDocx(formData);
    case 'arrest_permission':
      return await generateArrestPermissionDocx(formData);
    default:
      throw new Error(`Unknown document type: ${docId}`);
  }
}

/**
 * Universal document downloader with appropriate standard filename
 */
export function downloadDocumentDocx(docId, blob, formData = {}) {
  const datePart = (formData.letterDate || formData.date || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const codeOrCrime = (formData.crimeNo || formData.accusedCode || 'Doc').replace(/[^a-zA-Z0-9_-]/g, '_');

  let filename = `${docId}_${codeOrCrime}_${datePart}.docx`;

  switch (docId) {
    case 'form3':
      filename = `Form_III_Arrest_Memo_${formData.accusedCode || 'A1'}_${datePart}.docx`;
      break;
    case 'remand':
      filename = `PCR_Remand_Application_Crime_${codeOrCrime}_${datePart}.docx`;
      break;
    case 'medical':
      filename = `Medical_Examination_Letter_${codeOrCrime}_${datePart}.docx`;
      break;
    case 'lockup_ps':
      filename = `Lockup_Placement_PS_Letter_${codeOrCrime}_${datePart}.docx`;
      break;
    case 'lockup_acp':
      filename = `Lockup_Placement_ACP_Letter_${codeOrCrime}_${datePart}.docx`;
      break;
    case 'custody_transfer':
      filename = `Accused_Custody_Transfer_Letter_${codeOrCrime}_${datePart}.docx`;
      break;
    case 'arrest_permission':
      filename = `Permission_To_Arrest_Application_${codeOrCrime}_${datePart}.docx`;
      break;
  }

  downloadBlob(blob, filename);
}
