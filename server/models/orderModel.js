import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    clerkId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Update inventory when order is placed
orderSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const Inventory = mongoose.model("Inventory");

  for (const item of this.orderItems) {
    // Update product stock
    const product = await Product.findById(item.product);
    if (product) {
      // Only update if the order is new (not already processed)
      if (this.isNew) {
        // Find inventory items for this product
        const inventoryItems = await Inventory.find({ product: item.product });

        let remainingQuantity = item.quantity;
        for (const invItem of inventoryItems) {
          if (remainingQuantity <= 0) break;

          const availableQty = invItem.quantity;
          const deductQty = Math.min(availableQty, remainingQuantity);

          invItem.quantity -= deductQty;
          await invItem.save();

          remainingQuantity -= deductQty;
        }
      }
    }
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
