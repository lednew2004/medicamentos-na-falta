const usuarios = {
    "1": "Charles",
    "5": "Leonardo",
    "6": "Roniel",
    "7": "Emanuelle",
    "13": "Erik",
    "14": "Yago",
    "17": "Ricardo",
    "18": "Claudenilson",
    "19": "Arynael",
    "20": "Richardson",
    "22": "Crysthys",
    "25": "Wendel"
};

function mostrarNome() {
    const codigo = document.getElementById("codigo").value;
    const nomeColaboradorInput = document.getElementById("nomeColaborador");
    nomeColaboradorInput.value = usuarios[codigo] || '';
}

function moverFoco(event, nextElementId) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById(nextElementId)?.focus();
    }
}

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
    }
}

async function adicionarMedicamento() {
    const codigo = document.getElementById("codigo").value;
    const collaborator = usuarios[codigo];
    const medicine = document.getElementById("medicamento").value.toUpperCase().trim();
    const miligrama = document.getElementById("miligrama").value;
    const quantity = document.getElementById("quantidade").value;
    const lab = document.getElementById("laboratorio").value.toUpperCase().trim();

    if (!collaborator || !medicine || !miligrama || !quantity || !lab) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const queryMedicine = medicine.replace(/\s+/g, "");
    
    const payload = {
        collaborator,
        medicine,
        queryMedicine,
        miligrama,
        quantity,
        lab
    };

    await fetchData("https://medicamentos-na-falta-api.onrender.com/failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    await atualizarTabela();
    document.querySelectorAll("#medicamento, #miligrama, #laboratorio").forEach(input => input.value = '');
}

async function buscarMedicamento() {
    const medicamentoInput = document.getElementById("medicamento");
    const codigo = document.getElementById("codigo").value;
    const colaborador = usuarios[codigo] || '';
    const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];

    if (medicamentoInput.value) {
        const queryMedicine = medicamentoInput.value.toUpperCase().replace(/\s+/g, "");
        const data = await fetchData(`https://medicamentos-na-falta-api.onrender.com/failure?search=${queryMedicine}`);

        Object.values(data).forEach(rows =>
            rows.forEach(dados => atualizarTabela(dados))
        );

    } else if (codigo) {
        tabela.innerHTML = "";
        const data = await fetchData(`https://medicamentos-na-falta-api.onrender.com/failure?collaborator=${colaborador}`);

        Object.values(data).forEach(rows => {
            rows.forEach(dados => {
                const row = tabela.insertRow();
                ["collaborator", "medicine", "miligrama", "quantity", "lab", "date"].forEach((key, i) => {
                    row.insertCell(i).textContent = dados[key];
                });
            });
        });

    } else {
        atualizarTabela();
    }
}

async function removerMedicamento() {
    const queryMedicine = document.getElementById("medicamento").value.toUpperCase().replace(/\s+/g, "");
    const data = await fetchData(`https://medicamentos-na-falta-api.onrender.com/failure?search=${queryMedicine}`);

    Object.values(data).forEach(rows =>
        rows.map(dados => remove(dados.queryMedicine))
    );
}

async function remove(medicine) {
    if (medicine) {
        await fetchData(`https://medicamentos-na-falta-api.onrender.com/failure?search=${medicine}`, { method: "DELETE" });
        atualizarTabela();
    }
}

async function atualizarTabela(dados) {
    const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];
    tabela.innerHTML = "";

    if (dados) {
        const row = tabela.insertRow();
        ["collaborator", "medicine", "miligrama", "quantity", "lab", "date"].forEach((key, i) => {
            row.insertCell(i).textContent = dados[key];
        });
        return;
    }

    const data = await fetchData("https://medicamentos-na-falta-api.onrender.com/failure");
    Object.values(data).forEach(subTable => {
        subTable.forEach(medicine => {
            const row = tabela.insertRow();
            ["collaborator", "medicine", "miligrama", "quantity", "lab", "date"].forEach((key, i) => {
                row.insertCell(i).textContent = medicine[key];
            });
        });
    });
}

async function createOption() {
    const date = document.getElementById("date");
    const data = await fetchData("https://medicamentos-na-falta-api.onrender.com/failure");

    Object.keys(data).forEach(subTable => {
        const option = document.createElement("option");
        option.value = subTable;
        option.textContent = subTable;
        date.appendChild(option);
    });
}

async function printTable() {
    const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];
    const day = dateSelect.value;
    const data = await fetchData("https://medicamentos-na-falta-api.onrender.com/failure");

    Object.entries(data).forEach(([table, rows]) => {
        if (table === day) {
            tabela.innerHTML = "";
            rows.forEach(dados => {
                const row = tabela.insertRow();
                ["collaborator", "medicine", "miligrama", "quantity", "lab", "date"].forEach((key, i) => {
                    row.insertCell(i).textContent = dados[key];
                });
            });
        }
    });
}

const dateSelect = document.getElementById("date");
dateSelect.addEventListener("click", printTable);

document.getElementById("textTranscript").addEventListener("click", async (event) => {
    event.preventDefault();
    const codigoInput = document.getElementById("codigo").value;
    const collaborator = usuarios[codigoInput];
    
    const textSpeech = new webkitSpeechRecognition();
    textSpeech.lang = "pt-BR";
    textSpeech.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        try {
            const response = await fetch('https://medicamentos-na-falta-ia.onrender.com/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ failure: transcript, collaborator }),
            });

            const data = await response.json();
            atualizarTabela()
            console.log(data);
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    textSpeech.start();
});

createOption();
printTable();
atualizarTabela();