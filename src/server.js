import fastify from 'fastify';
import fastifycors from 'fastify-cors';
import { Database } from './database.js';
import dotenv from 'dotenv';

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

const database = new Database();
const app = fastify();

// Configuração do CORS
app.register(fastifycors, {
  origin: '*',
});

// Definir a porta usando a variável de ambiente, com fallback para 3000
const port = process.env.PORT || 3000;  // Se a variável de ambiente PORT não existir, a porta 3000 será usada

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

  database.insert("failures", { 
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

// Iniciar o servidor no endereço 0.0.0.0 e na porta definida
app.listen({
  port: 8080,
  host: '0.0.0.0'  // Certifique-se de que o servidor escuta em 0.0.0.0
}).then(() => {
  console.log(`Servidor rodando na porta ${port}`);
}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});
