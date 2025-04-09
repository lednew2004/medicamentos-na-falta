import fastify from 'fastify';
import fastifycors from 'fastify-cors';
import { Database } from './database.js';
import dotenv from 'dotenv';


dotenv.config();

const database = new Database();
const app = fastify();


app.register(fastifycors, {
  origin: '*',
});


const port = process.env.PORT || 3000;  

app.post("/failure", (request, response) => {
  const { collaborator, medicine, queryMedicine, miligrama, quantity, lab } = request.body;
  const date = new Date();
  const formatPt = new Intl.DateTimeFormat("pt-br", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);

  const tableDay = new Intl.DateTimeFormat("pt-br", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)

  const subTableName = tableDay;

  database.insert("failures", subTableName, { 
    collaborator,
    medicine,
    queryMedicine,
    miligrama,
    quantity,
    lab,
    date: formatPt,
    failure: true,
  });

  return response.status(202).send();1
});

app.get("/failure", (request, response) => {
  const { search, collaborator } = request.query;
  
  if(search){
    const data = database.select("failures", search ? { queryMedicine: search } : null);
    return response.status(200).send(data);

  }

  const data = database.select("failures", collaborator ? { collaborator: collaborator }: null);
  return response.status(200).send(data);
});

app.put("/failure", (request, response) => {
  const { search } = request.query;
  const { medicine, failure, user } = request.body;

  database.update("failures", search, {
    medicine,
    failure,
    date: null
  });

  return response.status(200).send();
});

app.delete("/failure", (request, response) => {
  const { search } = request.query;

  if (!search) {
    return response.status(400).send({ error: 'O nome do medicamento é necessário.' });
  }

  const deleted = database.delete("failures", search);

  if(deleted){
    return response.status(200).send({ message: `Medicamento ${search} removido com sucesso.` });
  }else{
    return response.status(404).send({ error: `Medicamento ${search} não encontrado.` });
  }
});


app.listen({
  port: 8080,
  host: '0.0.0.0'  
}).then(() => {
  console.log(`Servidor rodando na porta ${port}`);
}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});
