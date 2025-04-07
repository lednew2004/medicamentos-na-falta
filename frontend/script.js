const usuarios = {
    "1": "Charles",
    "5": "Leonardo",
    "17": "Ricardo",
    "13": "Erik",
    "25": "Wendel"
};


function mostrarNome() {
    const codigoInput = document.getElementById("codigo");
    const nomeColaboradorInput = document.getElementById("nomeColaborador");
    const codigo = codigoInput.value;

    // Verifica se o código é válido e exibe o nome correspondente
    if (usuarios[codigo]) {
        nomeColaboradorInput.value = usuarios[codigo]; // Atualiza o campo de nome
    } else {
        nomeColaboradorInput.value = ''; // Limpa o campo de nome caso o código seja inválido
    }
}

// Função para mover o foco para o próximo campo quando pressionar Enter
function moverFoco(event, nextElementId) {
    if (event.key === "Enter") {
        event.preventDefault(); // Impede o comportamento padrão (enviar formulário)
        const nextElement = document.getElementById(nextElementId);
        if (nextElement) {
            nextElement.focus(); // Move o foco para o próximo campo
        }
    }
}

async function adicionarMedicamento() {
    let queryMedicine = "";

    const codigoInput = document.getElementById("codigo");
    const medicamentoInput = document.getElementById("medicamento");
    const miligramaInput = document.getElementById("miligrama");
    const quantidadeOrMlInput = document.getElementById("quantidade");
    const laboratorioInput = document.getElementById("laboratorio");

    const codigo = codigoInput.value;
    const collaborator = usuarios[codigo];

    const medicine = String(medicamentoInput.value.toUpperCase());
    const ArrayOfMedicine = medicine.split(" ")
    ArrayOfMedicine.forEach(palavra => {
        queryMedicine+= palavra.replace(/\+/g, '').trim("")
    })

    const miligrama = miligramaInput.value;
    const quantity = quantidadeOrMlInput.value;
    const lab = laboratorioInput.value.toUpperCase();

    // Valida se todos os campos estão preenchidos
    if (!nomeColaborador || !medicine || !miligrama || !quantity || !lab) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    await fetch("http://localhost:8080/failure", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            collaborator,
            medicine,
            queryMedicine,
            miligrama,
            quantity,
            lab
        })
    });

    // Atualiza a tabela
    await atualizarTabela();

    // Limpa os campos após adicionar
    medicamentoInput.value = '';
    miligramaInput.value = '';
    laboratorioInput.value = '';
}

async function  buscarMedicamento(){
    let queryMedicine = "";

    const medicamentoInput = document.getElementById("medicamento");
    
    const codigoInput = document.getElementById("codigo");
    const colaborador = usuarios[codigoInput.value]
    
    if(medicamentoInput.value){
        
        const medicine = String(medicamentoInput.value.toUpperCase());
        const ArrayOfMedicine = medicine.split(" ")
        ArrayOfMedicine.forEach(palavra => {
            queryMedicine+= palavra.replace(/\+/g, '').trim("")
        })

        const response = await fetch(`http://localhost:8080/failure?search=${queryMedicine}`);
        const data = await response.json()
    
       data.forEach(dados => {
         atualizarTabela(dados)
       })
    }else if(codigoInput.value){
        const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];
        tabela.innerHTML = " "

        const response = await fetch(`http://localhost:8080/failure?collaborator=${colaborador}`);
        const data = await response.json()
        return data.forEach(dados => {

            console.log(dados)

            
        const row = tabela.insertRow();
    
        row.insertCell(0).textContent = dados.collaborator;
        row.insertCell(1).textContent = dados.medicine;
        row.insertCell(2).textContent = dados.miligrama;
        row.insertCell(3).textContent = dados.quantity;
        row.insertCell(4).textContent = dados.lab;
        row.insertCell(5).textContent = dados.date;
        
        return
        })

    }else{
        atualizarTabela()

    }
    
}
async function atualizarTabela(dados){
    console.log(dados)
    const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];

    tabela.innerHTML = " "

    if(dados){
        const row = tabela.insertRow();
    
        row.insertCell(0).textContent = dados.collaborator;
        row.insertCell(1).textContent = dados.medicine;
        row.insertCell(2).textContent = dados.miligrama;
        row.insertCell(3).textContent = dados.quantity;
        row.insertCell(4).textContent = dados.lab;
        row.insertCell(5).textContent = dados.date;
        
        return
    }


    const response = await fetch("http://localhost:8080/failure");
    const data = await response.json();

    data.forEach(medicine => {
        //console.log(medicine)
        const row = tabela.insertRow();
    
        row.insertCell(0).textContent = medicine.collaborator;
        row.insertCell(1).textContent = medicine.medicine;
        row.insertCell(2).textContent = medicine.miligrama;
        row.insertCell(3).textContent = medicine.quantity;
        row.insertCell(4).textContent = medicine.lab;
        row.insertCell(5).textContent = medicine.date;
        
    })
   

}

atualizarTabela()