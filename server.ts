import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Menu Data
  const menuItems = [
    { id: 1, name: "Classic Popcorn", price: 8.5, category: "Snacks", description: "Freshly popped with premium butter.", image: "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=400&h=300&fit=crop" },
    { id: 2, name: "Nachos with Extra Cheese", price: 10.0, category: "Snacks", description: "Crispy chips with warm jalapeño cheese dip.", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&h=300&fit=crop" },
    { id: 3, name: "Gourmet Hot Dog", price: 9.0, category: "Snacks", description: "All-beef frank with your choice of toppings.", image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?q=80&w=400&h=300&fit=crop" },
    { id: 4, name: "Large Soda", price: 6.5, category: "Drinks", description: "Refreshing fountain drink of your choice.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&h=300&fit=crop" },
    { id: 5, name: "Craft Iced Tea", price: 7.0, category: "Drinks", description: "House-made blend with a hint of lemon.", image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=400&h=300&fit=crop" },
    { id: 6, name: "Blockbuster Combo", price: 22.0, category: "Combos", description: "Large popcorn, 2 large sodas, and a candy pack.", image: "https://images.unsplash.com/photo-1585647347384-2593bcac5503?q=80&w=400&h=300&fit=crop" }
  ];

  let liveOrders: any[] = [];

  // API Routes
  app.get("/api/menu", (req, res) => {
    res.json(menuItems);
  });

  app.post("/api/menu", (req, res) => {
    const newItem = { ...req.body, id: Date.now() };
    menuItems.push(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/menu/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = menuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      menuItems[index] = { ...req.body, id };
      res.json(menuItems[index]);
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  });

  app.delete("/api/menu/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = menuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      menuItems.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  });

  app.get("/api/orders/live", (req, res) => {
    res.json(liveOrders);
  });

  app.post("/api/order", (req, res) => {
    const { items, total, seatNumber } = req.body;
    const randomSuffix = Math.floor(Math.random() * 900000) + 100000;
    const orderId = `SEAT-${seatNumber}-${randomSuffix}`;
    const newOrder = { 
      id: orderId, 
      items, 
      total, 
      seatNumber, 
      status: 'Preparing', 
      timestamp: new Date().toLocaleTimeString() 
    };
    liveOrders.push(newOrder);
    
    res.status(201).json({ 
      success: true, 
      orderId, 
      estimatedTime: "1 min",
      message: "Order placed successfully! Lightning fast delivery in progress."
    });
  });

  app.put("/api/orders/:id/deliver", (req, res) => {
    const { id } = req.params;
    const index = liveOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      liveOrders[index].status = 'Delivered';
      liveOrders[index].deliveredAt = Date.now();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.put("/api/orders/:id/confirm", (req, res) => {
    const { id } = req.params;
    const index = liveOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      liveOrders.splice(index, 1); // Final removal from system
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CinemaCravings Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
