import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config()

const app = fastify()
app.register(fastifyCors, {
    origin: "*"
})


const chaveApi = process.env.key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  

const formatMedicineForQuery = (medicine) => {
    return medicine.replace(/\s+/g, '').toUpperCase();
};

app.post('/api/process', async (request, reply) => {
    const { failure, collaborator } = request.body;
    console.log(failure)
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'user',
                content: `A pessoa disse: ${failure}. Agora, extraia o medicamento, miligrama, quantidade e laboratório da fala e envie em formato JSON com a seguinte estrutura: { "collaborator": "${collaborator}", "medicine": "medicamento", "querymedicine": "caso o medicamento tenha mais de uma palavra, junte-as. Ex: 'buscopan composto', salve 'buscopancomposto'. Se não tiver, ainda assim salve", "miligrama": "miligrama", "quantity": "quantidade", "lab": "laboratório" }`
            }],
        });

        if (response.choices && response.choices[0].message) {
            const message = response.choices[0].message.content;
            const data = JSON.parse(message);

            
            const medicine = data.medicine.toUpperCase().trim();
            const queryMedicine = formatMedicineForQuery(medicine);
            const miligrama = data.miligrama.trim();
            const quantity = data.quantity.trim();
            const lab = data.lab.toUpperCase().trim();

            const result = {
                collaborator,
                medicine,
                queryMedicine,
                miligrama,
                quantity,
                lab
            };

            await fetch("https://medicamentos-na-falta-api.onrender.com/failure", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(result),
            });

            reply.send(result);
        }
    } catch (error) {
        reply.status(500).send({ error: error.message });
    }
});

app.listen({
    port: 3030,
    host: '0.0.0.0'  
  }).then(() => {
    console.log(`Servidor rodando na porta 3030`);
  }).catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
  });