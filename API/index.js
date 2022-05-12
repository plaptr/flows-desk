const express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  Resource = require("resourcejs"),
  Cliente = require("./schemas/Cliente"),
  ContoCassa = require("./schemas/ContoCassa"),
  RPC = require("./schemas/RPC"),
  MovimentiEstrattiConto = require("./schemas/MovimentiEstrattiConto");

const TIPICONTABILITA = { ordinaria: 1, semplificati: 2, forfettari: 3, professionisti: 4 };
const PORT = 4068;
const app = express();

mongoose.connect("mongodb://localhost/flowsdesk");

// Express configuration for POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(PORT, () => {
  // TIPICONTABILITA
  app.get("/contabilita", (req, res) => {
    res.status(200).send(TIPICONTABILITA);
  });

  // Clienti
  Resource(app, "", "clienti", Cliente).rest();

  //Estratti conto
  Resource(app, "", "estratticonto", MovimentiEstrattiConto).post({
    before: async (req, res, next) => {
      await handleNewYear(req.body);
      next();
    },
  });
  app.get("/estratticonto", async (req, res) => {
    const result = await MovimentiEstrattiConto.find();
    res.status(200).send(result);
  });
  app.get("/estratticonto/:cliente", async (req, res) => {
    try {
      const idCliente = req.params.cliente;
      const result = await MovimentiEstrattiConto.find({ id_cliente: idCliente }).distinct("anno");
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
  app.get("/estratticonto/:cliente/:anno", async (req, res) => {
    try {
      const id_cliente = req.params.cliente;
      const anno = req.params.anno;
      const result = await MovimentiEstrattiConto.find({ id_cliente, anno });
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
  app.put("/estratticonto/:id", async (req, res) => {
    try {
      const _id = req.params.id;
      const body = req.body;

      await MovimentiEstrattiConto.updateOne({ _id }, { $set: body });
      const result = await MovimentiEstrattiConto.findById(_id);
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
  app.delete("/estratticonto/:id", async (req, res) => {
    try {
      const _id = req.params.id;
      const body = req.body;

      await MovimentiEstrattiConto.deleteOne({ _id });
      res.status(200).send("Success!");
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

  // RPC
  Resource(app, "", "rpc", RPC).post().put().delete();
  app.get("/rpc", async (req, res) => {
    try {
      const result = await RPC.find().distinct("anno");
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });
  app.get("/rpc/:anno", async (req, res) => {
    try {
      const result = await RPC.find({ anno: req.params.anno });
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });
  app.get("/rpc/:anno/:contabilita", async (req, res) => {
    try {
      const result = await RPC.find({ anno: req.params.anno, sistema_contabilita: req.params.contabilita });
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });

  // Conto cassa
  Resource(app, "", "contocassa", ContoCassa).post().delete();
  app.get("/contocassa", async (req, res) => {
    try {
      const result = await ContoCassa.find().distinct("anno");
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });
  app.get("/contocassa/:anno", async (req, res) => {
    try {
      const anno = req.params.anno;
      const result = await ContoCassa.find({ anno });
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });
  app.get("/contocassa/:anno/:mese", async (req, res) => {
    try {
      const anno = req.params.anno;
      const mese = req.params.mese;
      const result = await ContoCassa.find({ anno, mese });
      res.status(200).send(result);
    } catch (e) {
      res.status(500).send("An error occurred: " + e.message);
    }
  });
});

async function handleNewYear(body) {
  const anno = body.anno;
  const id_cliente = body.id_cliente;
  const anni = await MovimentiEstrattiConto.find({ id_cliente }).distinct("anno");
  if (anno === undefined || anni.includes(anno) || !anni.includes(anno - 1)) return;
  const arrMovimenti = await MovimentiEstrattiConto.find({ anno: anno - 1, id_cliente });
  let totaleMovimenti = [...arrMovimenti].reduce((movimentoPrecedente, movimentoCorrente) => {
    return { importo: parseFloat(movimentoPrecedente.importo) + parseFloat(movimentoCorrente.importo) };
  }).importo;
  await MovimentiEstrattiConto.create({
    anno,
    id_cliente,
    descrizione: "Riporto anno precedente",
    importo: totaleMovimenti,
  });
}

// ** ESTRATTO CONTO CLIENTI ** //
// Mostrare tutti i clienti
// Creare un cliente
// Modificare un cliente
// Eliminare un cliente
// Creare un anno per un cliente
// Eliminare un anno per un cliente
// Modificare i movimenti del cliente per un anno specifico
// Riportare nel nuovo anno i movimenti di un anno precedente per un cliente

// !! REGISTRO PROCEDURE CONTABILI !! //
// Selezionare un anno
// Creare un anno
// Eliminare un anno
// Visualizzare lo stato di una procedura contabile per quell'anno e cliente specifico
// Modificare lo stato di una procedura contabile per quell'anno e cliente specifico
// Cercare un cliente all'interno di un anno specifico

// ?? RUBRICA TELEFONICA ?? //
// Mostrare tutti i clienti
// Eliminare un cliente
// Selezionare un cliente
// Mostrare i contatti e le informazioni per ogni cliente
// Modificare le informazioni di un cliente

// TODO: CONTO CASSA //
// Mostrare tutti gli anni del conto cassa
// Creare un anno
// Eliminare un anno
// Visualizzare tutti i movimenti di un anno
// Modificare i movimenti di un anno
