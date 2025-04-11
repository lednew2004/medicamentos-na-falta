import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = fastify();
app.register(fastifyCors, { origin: "*" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log("Chave API:", process.env.OPENAI_API_KEY); // Para debug

const formatMedicineForQuery = (medicine) => {
  return medicine.replace(/\s+/g, '').toUpperCase();
};

app.post('/api/process', async (request, reply) => {
  const { failure, collaborator } = request.body;
  console.log("Frase recebida:", failure);
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `A pessoa disse: ${failure}. Agora, extraia o medicamento, miligrama, quantidade e laboratório da fala e envie em formato JSON com a seguinte estrutura: { "collaborator": "${collaborator}", "medicine": "medicamento", "querymedicine": "caso o medicamento tenha mais de uma palavra, junte-as. Ex: 'buscopan composto', salve 'buscopancomposto'. Se não tiver, ainda assim salve", "miligrama": "miligrama", "quantity": "quantidade", "lab": "laboratório" }`
      }],
    });

    if (response.choices && response.choices[0].message) {
      const data = JSON.parse(response.choices[0].message.content);

      const result = {
        collaborator,
        medicine: data.medicine.toUpperCase().trim(),
        queryMedicine: formatMedicineForQuery(data.medicine),
        miligrama: data.miligrama.trim(),
        quantity: data.quantity.trim(),
        lab: data.lab.toUpperCase().trim()
      };

      await fetch("https://medicamentos-na-falta-api.onrender.com/failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });

      reply.send(result);
    }
  } catch (error) {
    console.error("Erro:", error.message);
    reply.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3030;
app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    console.log(`Servidor rodando na porta ${PORT}`);
  })
  .catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
  });
