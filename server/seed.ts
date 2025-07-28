import { db } from "./db";
import { salesData, products, customers } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Sample sales data
  const sampleSalesData = [
    { region: "North America", customerName: "Acme Corp", productName: "Widget A", salesAmount: "2500.00", dateCreated: new Date("2024-10-15"), transactionCount: 1 },
    { region: "North America", customerName: "Tech Solutions", productName: "Widget B", salesAmount: "1800.00", dateCreated: new Date("2024-10-20"), transactionCount: 1 },
    { region: "Europe", customerName: "Euro Systems", productName: "Widget A", salesAmount: "3200.00", dateCreated: new Date("2024-11-01"), transactionCount: 1 },
    { region: "Europe", customerName: "Nordic Ltd", productName: "Widget C", salesAmount: "2100.00", dateCreated: new Date("2024-11-10"), transactionCount: 1 },
    { region: "Asia Pacific", customerName: "Pacific Trading", productName: "Widget B", salesAmount: "2800.00", dateCreated: new Date("2024-11-15"), transactionCount: 1 },
    { region: "Asia Pacific", customerName: "Orient Corp", productName: "Widget A", salesAmount: "1950.00", dateCreated: new Date("2024-11-20"), transactionCount: 1 },
    { region: "Latin America", customerName: "Sol Industries", productName: "Widget C", salesAmount: "1650.00", dateCreated: new Date("2024-12-01"), transactionCount: 1 },
    { region: "Latin America", customerName: "Mercado Corp", productName: "Widget A", salesAmount: "2200.00", dateCreated: new Date("2024-12-05"), transactionCount: 1 },
    { region: "North America", customerName: "Innovation Inc", productName: "Widget B", salesAmount: "3100.00", dateCreated: new Date("2024-12-10"), transactionCount: 1 },
    { region: "Europe", customerName: "Alpine Group", productName: "Widget A", salesAmount: "2750.00", dateCreated: new Date("2024-12-12"), transactionCount: 1 },
    { region: "Asia Pacific", customerName: "Dragon Enterprises", productName: "Widget C", salesAmount: "2400.00", dateCreated: new Date("2024-12-15"), transactionCount: 1 },
    { region: "North America", customerName: "Future Tech", productName: "Widget A", salesAmount: "1900.00", dateCreated: new Date("2024-12-18"), transactionCount: 1 },
  ];

  // Sample products
  const sampleProducts = [
    { name: "Widget A", category: "Electronics", price: "99.99" },
    { name: "Widget B", category: "Electronics", price: "149.99" },
    { name: "Widget C", category: "Software", price: "199.99" },
    { name: "Pro Widget", category: "Electronics", price: "299.99" },
    { name: "Widget Suite", category: "Software", price: "499.99" },
  ];

  // Sample customers
  const sampleCustomers = [
    { name: "Acme Corp", email: "contact@acme.com", region: "North America", signupDate: new Date("2024-01-15") },
    { name: "Tech Solutions", email: "info@techsol.com", region: "North America", signupDate: new Date("2024-02-20") },
    { name: "Euro Systems", email: "hello@eurosys.eu", region: "Europe", signupDate: new Date("2024-03-10") },
    { name: "Pacific Trading", email: "sales@pacific.com", region: "Asia Pacific", signupDate: new Date("2024-04-05") },
    { name: "Sol Industries", email: "contact@sol.com", region: "Latin America", signupDate: new Date("2024-05-12") },
  ];

  try {
    // Check if data already exists
    const existingSales = await db.select().from(salesData).limit(1);
    if (existingSales.length > 0) {
      console.log("Data already seeded!");
      return;
    }

    // Insert sample data
    await db.insert(salesData).values(sampleSalesData);
    await db.insert(products).values(sampleProducts);
    await db.insert(customers).values(sampleCustomers);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();