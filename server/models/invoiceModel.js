import mongoose from "mongoose";

const invoiceSchema = mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      address: {
        type: String,
      },
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: [
        "draft",
        "sent",
        "paid",
        "cancelled",
        "overdue",
        "Pending",
        "Paid",
        "Cancelled",
        "Overdue",
      ],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
