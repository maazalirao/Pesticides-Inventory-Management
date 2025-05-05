import express from "express";
import {
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoicesByStatus,
  getInvoices,
} from "../controllers/invoiceController.js";

const router = express.Router();

// Base routes
router.route("/").post(createInvoice);

router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice);

router.route("/clerk/:clerkId").get(getInvoices);

// Status-specific routes
router.route("/status/:status").get(getInvoicesByStatus);

router.route("/:id/status").patch(updateInvoiceStatus);

export default router;
