import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res) {
   if (!isAdmin(req)) {
      return res.status(403).json({
         message: "Access denied. Admins only.",
      });
   }

   const product = new Product(req.body);

   product
      .save()
      .then(() => {
         res.json({
            message: "Product created successfully",
         });
         console.log("Product created successfully");
      })
      .catch((error) => {
         res.status(500).json({
            message: "Error creating product",
            error: error.message,
         });
         console.log("Error creating product:", error.message);
      });
}

export async function getAllProducts(req, res) {
   try {
      if (isAdmin(req)) {
         // Product.find().then(
         //     (products)=>{
         //         res.json(products)
         //     }
         // ).catch(
         //     (error)=>{
         //         res.status(500).json({
         //             message : "Error fetching products",
         //             error : error.message
         //         });
         //     }
         // )

         const products = await Product.find();
         //  if (products.length === 0) {
         //     return res.status(404).json({
         //        message: "No products found",
         //     });
         //  }
         res.json(products);
      } else {
         Product.find({ isAvailable: true })
            .then((products) => {
               res.json(products);
               console.log("Fetched products for non-admin user:", products);
            })
            .catch((error) => {
               res.status(500).json({
                  message: "Error fetching products",
                  error: error.message,
               });
            });
      }
   } catch (error) {
      res.status(500).json({
         message: "Error fetching products",
         error: error.message,
      });
   }
}

export function deleteProduct(req, res) {
   if (!isAdmin(req)) {
      return res.status(403).json({
         message: "only admin can delete products.",
      });
   }

   const productID = req.params.productID;

   Product.deleteOne({ productID: productID }).then(() => {
      res.json({
         message: "Product deleted successfully",
      });
   });
}

export function updateProduct(req, res) {
   if (!isAdmin(req)) {
      return res.status(403).json({
         message: "only admin can update products.",
      });
   }

   const productID = req.params.productID;

   Product.updateOne({ productID: productID }, req.body).then(() => {
      res.json({
         message: "Product updated successfully",
      });
   });
}

export function getProductByID(req, res) {
   const productID = req.params.productID;

   Product.findOne({ productID: productID })
      .then((product) => {
         if (product == null) {
            res.status(404).json({
               message: "Product not found",
            });
         } else {
            res.json(product);
         }
      })
      .catch((error) => {
         res.status(500).json({
            message: "Error fetching product",
            error: error.message,
         });
      });
}
