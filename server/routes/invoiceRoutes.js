import express from 'express';
import { 
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoicesByStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

// Base routes
router.route('/')
  .get(getAllInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

// Status-specific routes
router.route('/status/:status')
  .get(getInvoicesByStatus);

router.route('/:id/status')
  .patch(updateInvoiceStatus);

export default router; 