
let agendamentos = [];
const horariosPadrao = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00"
];

// LOGIN
function login(){
  const p = document.getElementById('perfil').value;
  const u = document.getElementById('user').value.trim();
  const s = document.getElementById('pass').value.trim();

  if(!p || !u || !s){
    alert("Preencha perfil, usuário e senha.");
    return;
  }

  if(p === "admin" && (u !== "admin" || s !== "admin")){
    alert("Credenciais de administrador inválidas.");
    return;
  }

  if(p === "admin"){
    document.querySelector(".admin-only").style.display = "block";
  }

  show("menu");
}

// TROCA DE TELAS
function show(id){
  const telas = document.querySelectorAll(".screen");
  telas.forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if(id === "agendar") limparFormulario();
  if(id === "consultas") atualizarLista();
  if(id === "admin") atualizarAdmin();
}

function navigate(id){
  show(id);
}

// CALENDÁRIO + CPF
document.addEventListener("DOMContentLoaded", () => {
  flatpickr("#dataExame", {
    dateFormat: "d/m/Y",
    minDate: "today",
    locale: "pt"
  });

  const cpfInput = document.getElementById("cpfPaciente");
  cpfInput.addEventListener("input", () => {
    // só números
    cpfInput.value = cpfInput.value.replace(/\D/g, "");
  });
});

// HORÁRIOS DISPONÍVEIS
function horariosDisponiveisParaData(data){
  const ocupados = agendamentos
    .filter(a => a.data === data)
    .map(a => a.horario);

  return horariosPadrao.filter(h => !ocupados.includes(h));
}

document.getElementById("dataExame").addEventListener("change", () => {
  atualizarHorariosSelect(document.getElementById("dataExame").value);
});

function atualizarHorariosSelect(data){
  const select = document.getElementById("horarioExame");
  select.innerHTML = "<option value=''>Selecione</option>";

  if(!data) return;

  const livres = horariosDisponiveisParaData(data);
  livres.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    select.appendChild(opt);
  });
}

// VALIDAR NOME
function nomeValido(nome){
  if(nome.length < 5) return false;
  // apenas letras (inclui acentos) e espaços
  return /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/.test(nome);
}

// VALIDAR EMPRESA (sem símbolos/emoji)
function empresaValida(empresa){
  if(!empresa) return true; // opcional
  return /^[A-Za-z0-9À-ÖØ-öø-ÿ ]+$/.test(empresa);
}

// CONVERTER "dd/mm/aaaa" para Date
function parseDataBR(dataBR){
  const [dia, mes, ano] = dataBR.split("/");
  return new Date(parseInt(ano,10), parseInt(mes,10)-1, parseInt(dia,10));
}

// CONFIRMAR AGENDAMENTO
function confirmarAgendamento(){
  const n = document.getElementById('nomePaciente').value.trim();
  let c = document.getElementById('cpfPaciente').value.trim();
  const e = document.getElementById('empresa').value.trim();
  const t = document.getElementById('tipoExame').value;
  const d = document.getElementById('dataExame').value;
  const h = document.getElementById('horarioExame').value;

  // Nome
  if(!nomeValido(n)){
    alert("Digite um nome completo válido (mínimo 5 letras, sem números).");
    return;
  }

  // CPF
  c = c.replace(/\D/g, "");
  if(c.length !== 11){
    alert("Digite um CPF válido com 11 números.");
    return;
  }

  // Empresa
  if(!empresaValida(e)){
    alert("O nome da empresa não pode conter símbolos ou emojis.");
    return;
  }

  if(!t || !d || !h){
    alert("Preencha tipo de exame, data e horário.");
    return;
  }

  // Não permitir finais de semana
  const dataObj = parseDataBR(d);
  const diaSemana = dataObj.getDay(); // 0 domingo, 6 sábado
  if(diaSemana === 0 || diaSemana === 6){
    alert("A clínica não realiza exames aos fins de semana. Escolha um dia útil.");
    return;
  }

  // Não permitir mesmo CPF na mesma data
  const cpfMesmoDia = agendamentos.some(a => a.cpf === c && a.data === d);
  if(cpfMesmoDia){
    alert("Este CPF já possui um agendamento nesta data.");
    return;
  }

  // Não permitir mesmo horário ocupado (backup)
  const existe = agendamentos.some(a => a.data === d && a.horario === h);
  if(existe){
    alert("Este horário já está ocupado. Escolha outro horário.");
    return;
  }

  const novo = {
    id: Date.now(),
    nome: n,
    cpf: c,
    empresa: e || "Nenhuma",
    tipo: t,
    data: d,
    horario: h
  };

  agendamentos.push(novo);
  atualizarLista();
  atualizarAdmin();
  show("consultas");
}

// LIMPAR CAMPOS
function limparFormulario(){
  document.getElementById('nomePaciente').value = "";
  document.getElementById('cpfPaciente').value = "";
  document.getElementById('empresa').value = "";
  document.getElementById('tipoExame').value = "";
  document.getElementById('dataExame').value = "";
  const select = document.getElementById('horarioExame');
  select.innerHTML = "<option value=''>Selecione</option>";
}

// LISTA DE AGENDAMENTOS (CONSULTAS)
function atualizarLista(){
  const lista = document.getElementById("listaAgendamentos");
  const vazio = document.getElementById("semAgendamentos");
  lista.innerHTML = "";

  if(!agendamentos.length){
    vazio.style.display = "block";
    return;
  }
  vazio.style.display = "none";

  agendamentos.forEach(a => {
    const li = document.createElement("li");

    const titulo = document.createElement("div");
    titulo.className = "titulo";
    titulo.textContent = a.nome;

    const detalhes = document.createElement("div");
    detalhes.className = "detalhes";
    detalhes.textContent = `CPF: ${a.cpf} • ${a.tipo} • ${a.data} às ${a.horario}`;

    li.appendChild(titulo);
    li.appendChild(detalhes);
    lista.appendChild(li);
  });
}

// PAINEL ADMIN
function atualizarAdmin(){
  const lista = document.getElementById("listaAdmin");
  const vazio = document.getElementById("semAgendamentosAdmin");
  lista.innerHTML = "";

  if(!agendamentos.length){
    vazio.style.display = "block";
    return;
  }
  vazio.style.display = "none";

  agendamentos.forEach(a => {
    const li = document.createElement("li");

    const titulo = document.createElement("div");
    titulo.className = "titulo";
    titulo.textContent = a.nome;

    const detalhes = document.createElement("div");
    detalhes.className = "detalhes";
    detalhes.textContent = `CPF: ${a.cpf} • ${a.tipo} • ${a.data} às ${a.horario} • Empresa: ${a.empresa}`;

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const btnCancelar = document.createElement("button");
    btnCancelar.className = "btn btn-secondary";
    btnCancelar.textContent = "Cancelar";
    btnCancelar.onclick = () => cancelarAgendamento(a.id);

    acoes.appendChild(btnCancelar);

    li.appendChild(titulo);
    li.appendChild(detalhes);
    li.appendChild(acoes);
    lista.appendChild(li);
  });
}

function cancelarAgendamento(id){
  if(!confirm("Deseja realmente cancelar este agendamento?")) return;
  agendamentos = agendamentos.filter(a => a.id !== id);
  atualizarLista();
  atualizarAdmin();
}

// LIMPAR TODOS AGENDAMENTOS
function limparTodosAgendamentos(){
  if(!agendamentos.length) return;
  if(!confirm("Tem certeza que deseja remover todos os agendamentos?")) return;
  agendamentos = [];
  atualizarLista();
  atualizarAdmin();
}

// SINTOMAS
function registrarSintomas(){
  const texto = document.getElementById("campo-sintomas").value.trim();
  if(!texto){
    alert("Digite os sintomas antes de registrar.");
    return;
  }
  alert("Sintomas registrados.");
  document.getElementById("campo-sintomas").value = "";
}
