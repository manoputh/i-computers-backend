import order from "../models/Order.js";
import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
   if (req.user == null) {
      res.status(401).json({
         message: "Unauthorized",
      });
      return;
   }

   //ORD00001
   try {
      const latestOrder = await order.findOne().sort({ date: -1 });

      let orderID = "ORD000001";

      if (latestOrder != null) {
         let latestOrderID = latestOrder.orderID; //"ORD000012"
         let latestOrderNumberString = latestOrderID.replace("ORD", ""); //"000012"
         let latestOrderNumber = parseInt(latestOrderNumberString); //12

         let newOrderNumber = latestOrderNumber + 1; //13
         let newOrderNumberString = newOrderNumber.toString().padStart(6, "0"); //"000013"

         orderID = "ORD" + newOrderNumberString; //"ORD000013"
      }

      const items = [];
      let total = 0;

      for (let i = 0; i < req.body.items.length; i++) {
         const product = await Product.findOne({ productID: req.body.items[i].productID });
         if (product == null) {
            return res.status(404).json({
               message: "Product Not Found: " + req.body.items[i].productID,
            });
         }

         items.push({
            productID: product.productID,
            name: product.name,
            price: product.price,
            quantity: req.body.items[i].quantity,
            image: product.images[0],
         });

         // await Product.updateOne(
         //    { productID: product.productID },
         //    {stock: product.stock - req.body.items[i].quantity}
         // );

         total += product.price * req.body.items[i].quantity;
      }

      let name = req.body.name;
      if (name == null) {
         name = req.user.firstName + " " + req.user.lastName;
      }

      const newOrder = new order({
         orderID: orderID,
         email: req.user.email,
         name: name,
         address: req.body.address,
         total: total,
         items: items,
         phone: req.body.phone,
      });

      await newOrder.save();

      return res.status(201).json({
         message: "Order Placed Successfully",
         order: newOrder,
      });
   } catch (error) {
      return res.status(500).json({
         message: "Error Placing Order",
         error: error.message,
      });
   }
}

export async function getOrders(req, res) {
   if (req.user == null) {
      res.status(401).json({
         message: "Unauthorized",
      });
      return;
   }

   if (isAdmin(req)) {
      const orders = await order.find().sort({ date: -1 });
      res.status(200).json({
         orders: orders,
      });
   } else {
      const orders = await order.find({ email: req.user.email }).sort({ date: -1 });
      res.status(200).json({
         orders: orders,
      });
   }
}
