// clientController.js
import Client from "../database/models/client.js";
import Loan from "../database/models/loan.js"; // Import Loan model

// ✅ Create Client
export const createClient = async (req, res) => {
  try {
    const lastClient = await Client.findOne().sort({ clientId: -1 });
    const nextClientId = lastClient?.clientId ? lastClient.clientId + 1 : 1;

    const client = new Client({ ...req.body, clientId: nextClientId });
    await client.save();

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all clients (populates documents and calculates total loan amount)
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("documents")
      .sort({ createdAt: 1 });

    // For each client, calculate total loan amount
    for (const client of clients) {
      const loans = await Loan.find({ borrowerId: client._id });
      client.totalLoanAmount = loans.reduce(
        (sum, loan) => sum + (loan.loanAmount || 0),
        0
      );
    }

    res.status(200).json(clients);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update by _id or clientId
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client =
      (await Client.findByIdAndUpdate(id, req.body, { new: true })) ||
      (await Client.findOneAndUpdate({ clientId: id }, req.body, {
        new: true,
      }));

    if (!client) return res.status(404).json({ error: "Client not found" });
    res.status(200).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete by _id or clientId
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client =
      (await Client.findByIdAndDelete(id)) ||
      (await Client.findOneAndDelete({ clientId: id }));

    if (!client) return res.status(404).json({ error: "Client not found" });
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client =
      (await Client.findById(id).populate("documents")) ||
      (await Client.findOne({ clientId: id }).populate("documents"));
    if (!client) return res.status(404).json({ error: "Client not found" });

    // Calculate total loan amount for this client
    const loans = await Loan.find({ borrowerId: client._id });
    client.totalLoanAmount = loans.reduce(
      (sum, loan) => sum + (loan.loanAmount || 0),
      0
    );

    res.status(200).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
