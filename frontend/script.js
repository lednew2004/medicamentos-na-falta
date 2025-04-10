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
    const codigoInput = document.getElementById("codigo");
    const nomeColaboradorInput = document.getElementById("nomeColaborador");
    const codigo = codigoInput.value;
    
   
    if (usuarios[codigo]) {
        nomeColaboradorInput.value = usuarios[codigo]; 
    } else {
        nomeColaboradorInput.value = '';
    }
}


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
    
    
    if (!nomeColaborador || !medicine || !miligrama || !quantity || !lab) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    
    await fetch("https://medicamentos-na-falta-api.onrender.com/failure", {
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
    
    
    await atualizarTabela();
    
    
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
        
        try{
            const response = await fetch(`https://medicamentos-na-falta-api.onrender.com/failure?search=${queryMedicine}`);
            const data = await response.json()
    
            Object.entries(data).forEach(([subTable, rows]) => {
                rows.forEach(dados => {
                    atualizarTabela(dados)
                    
                })
            })
            
        }catch(erro){
            console.log(erro)
        }
        
       
    }else if(codigoInput.value){
        const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];
        tabela.innerHTML = " "
        
        try{
            
            const response = await fetch(`https://medicamentos-na-falta-api.onrender.com/failure?collaborator=${colaborador}`);
            const data = await response.json()
           Object.entries(data).forEach(([subTable, rows]) => {
               rows.forEach(dados => {
                   
                   const row = tabela.insertRow();
                   
                   row.insertCell(0).textContent = dados.collaborator;
                   row.insertCell(1).textContent = dados.medicine;
                   row.insertCell(2).textContent = dados.miligrama;
                   row.insertCell(3).textContent = dados.quantity;
                   row.insertCell(4).textContent = dados.lab;
                   row.insertCell(5).textContent = dados.date;
                })
            })
        }catch(erro){
            console.log(erro)
        }
        
        return
    }else{
        atualizarTabela()

    }
    
}

async function removerMedicamento() {
    let queryMedicine = "";
    const medicamentoInput = document.getElementById("medicamento");
    
    const medicine = String(medicamentoInput.value.toUpperCase());
    const ArrayOfMedicine = medicine.split(" ")
    ArrayOfMedicine.forEach(palavra => {
        queryMedicine+= palavra.replace(/\+/g, '').trim("")
    })
    
    try{
        const response = await fetch(`https://medicamentos-na-falta-api.onrender.com/failure?search=${queryMedicine}`);
        const data = await response.json()
        
        if(data){
            Object.entries(data).forEach(([subTable, rows]) => {
                rows.forEach(dados => {
                    remove(dados.queryMedicine)
                })
            })
            
        }else{
            console.log("Sem dados")
        }
        
        
        
    }catch(erro){
        console.log(erro)
    }
}

async function remove(medicine){
    try{
        if(medicine){
            await fetch(`https://medicamentos-na-falta-api.onrender.com/failure?search=${medicine}`, {
                method: "DELETE"
            })
            
            atualizarTabela()
        }
        
    }catch(erro){
        console.log(erro)
    }
}

async function atualizarTabela(dados){
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

    
    const response = await fetch("https://medicamentos-na-falta-api.onrender.com/failure");
    const data = await response.json();
    
    try{
        if(!data){
            return console.log(new Error("Sem dados"))
        }
        
        Object.entries(data).forEach(([subTable, rows]) => {
            rows.forEach(medicine => {
                const row = tabela.insertRow();
                
                row.insertCell(0).textContent = medicine.collaborator;
                row.insertCell(1).textContent = medicine.medicine;
                row.insertCell(2).textContent = medicine.miligrama;
                row.insertCell(3).textContent = medicine.quantity;
                row.insertCell(4).textContent = medicine.lab;
                row.insertCell(5).textContent = medicine.date;
            })
        })
        
    }catch(erro){
        console.log(erro)
    }
    
    
    
}

async function createOption(){
    
    const response = await fetch("https://medicamentos-na-falta-api.onrender.com/failure")
    const data = await response.json()
    
    
    Object.entries(data).forEach(([subTable, rows]) => {
        
        const date = document.getElementById("date")

        
        
        const option = document.createElement("option")
        option.value = subTable
        option.textContent = subTable
        date.appendChild(option)
        
    })
}
const dateSelect = document.getElementById("date")

async function PrintTable(){
    

    const tabela = document.getElementById("medicamentosTabela").getElementsByTagName('tbody')[0];

        const day = dateSelect.value
        const response = await fetch("https://medicamentos-na-falta-api.onrender.com/failure")
        const data = await response.json()

        Object.entries(data).forEach(([table, rows]) => {
            
                if(table === day){
                    tabela.innerHTML = ""
                    
                   rows.forEach(dados => {
                       const row = tabela.insertRow();
                       row.insertCell(0).textContent = dados.collaborator;
                       row.insertCell(1).textContent = dados.medicine;
                       row.insertCell(2).textContent = dados.miligrama;
                       row.insertCell(3).textContent = dados.quantity;
                       row.insertCell(4).textContent = dados.lab;
                       row.insertCell(5).textContent = dados.date;
                
                   })
                }
        })
}

dateSelect.addEventListener("click", PrintTable)

createOption()
PrintTable()

atualizarTabela()
