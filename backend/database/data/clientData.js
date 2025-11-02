import mongoose from "mongoose";
const URL = "mongodb://127.0.0.1:27017/financeDB";
import Client from "../models/client.js";
import Admin from "../models/admin.js";

async function main() {
  await mongoose.connect(URL);
}

main()
  .then((res) => {
    console.log("database connect successfully");
  })
  .catch((err) => {
    console.log("Error", err);
  });

const clients = [
  {
    name: "keshva",
    contactNumber: 9876543210,
    email: "alice@example.com",
    loanAmount: 5000,
    startDate: new Date("2025-09-01"),
    dueDate: new Date("2025-12-01"),
    paymentStatus: "Pending",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "Bob",
    contactNumber: 9123456780,
    email: "bob@example.com",
    loanAmount: 10000,
    startDate: new Date("2025-09-05"),
    dueDate: new Date("2025-12-05"),
    paymentStatus: "Paid",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "niyati",
    contactNumber: 9988776655,
    email: "charlie@example.com",
    loanAmount: 7500,
    startDate: new Date("2025-09-10"),
    dueDate: new Date("2025-12-10"),
    paymentStatus: "Overdue",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "Lee",
    contactNumber: 9871234560,
    email: "david@example.com",
    loanAmount: 6000,
    startDate: new Date("2025-09-12"),
    dueDate: new Date("2025-12-12"),
    paymentStatus: "Pending",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "Eva",
    contactNumber: 9123987654,
    email: "eva@example.com",
    loanAmount: 12000,
    startDate: new Date("2025-09-15"),
    dueDate: new Date("2025-12-15"),
    paymentStatus: "Paid",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "Frank",
    contactNumber: 9876541230,
    email: "frank@example.com",
    loanAmount: 8500,
    startDate: new Date("2025-09-18"),
    dueDate: new Date("2025-12-18"),
    paymentStatus: "Pending",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
  {
    name: "Grace",
    contactNumber: 9123459876,
    email: "grace@example.com",
    loanAmount: 9500,
    startDate: new Date("2025-09-20"),
    dueDate: new Date("2025-12-20"),
    paymentStatus: "Overdue",
    agentId: "68ceb6ef23077f1a8078bfe0",
  },
];

const result = await Client.deleteMany({});

const insertedClients = await Client.insertMany(clients);
console.log(insertedClients.length, "clients inserted");

for (const client of insertedClients) {
  await Admin.findByIdAndUpdate(client.agentId, {
    $push: { Clients: client._id },
  });
}
