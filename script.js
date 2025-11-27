
let agendamentos=[];
const horariosPadrao=["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

function login(){
  let p=perfil.value;
  let u=user.value;
  let s=pass.value;
  if(!p||!u||!s){alert("Preencha tudo");return;}
  if(p==="admin" && (u!=="admin"||s!=="admin")){alert("Admin inválido");return;}
  if(p==="admin") document.querySelector(".admin-only").style.display="block";
  show("menu");
}

function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="agendar") limparFormulario();
  if(id==="consultas") atualizarLista();
  if(id==="admin") atualizarAdmin();
}

function navigate(id){ show(id); }

// calendário
flatpickr("#dataExame", {
  dateFormat: "d/m/Y",
  minDate: "today",
  locale: "pt"
});

// horários livres
function horariosDisponiveisParaData(data){
  const ocupados=agendamentos.filter(a=>a.data===data).map(a=>a.horario);
  return horariosPadrao.filter(h=>!ocupados.includes(h));
}

dataExame.addEventListener("change",()=>{
  atualizarHorariosSelect(dataExame.value);
});

function atualizarHorariosSelect(data){
  horarioExame.innerHTML="<option value=''>Selecione</option>";
  if(!data) return;
  horariosDisponiveisParaData(data).forEach(h=>{
    let opt=document.createElement("option");
    opt.value=h; opt.textContent=h;
    horarioExame.appendChild(opt);
  });
}

function confirmarAgendamento(){
  let n=nomePaciente.value.trim();
  let c=cpfPaciente.value.trim();
  let e=empresa.value.trim();
  let t=tipoExame.value;
  let d=dataExame.value;
  let h=horarioExame.value;

  if(!n||!c||!t||!d||!h){alert("Preencha tudo");return;}

  const existe = agendamentos.some(a=>a.data===d && a.horario===h);
  if(existe){alert("Horário ocupado");return;}

  agendamentos.push({nome:n,cpf:c,empresa:e||"Nenhuma",tipo:t,data:d,horario:h});
  atualizarLista();
  show("consultas");
}

function limparFormulario(){
  nomePaciente.value="";
  cpfPaciente.value="";
  empresa.value="";
  tipoExame.value="";
  dataExame.value="";
  horarioExame.innerHTML="<option value=''>Selecione</option>";
}

function atualizarLista(){
  listaAgendamentos.innerHTML="";
  agendamentos.forEach(a=>{
    let li=document.createElement("li");
    li.textContent=`${a.nome} - ${a.data} ${a.horario}`;
    listaAgendamentos.appendChild(li);
  });
}

function atualizarAdmin(){
  listaAdmin.innerHTML="";
  agendamentos.forEach(a=>{
    let li=document.createElement("li");
    li.textContent=`${a.nome} - ${a.data} ${a.horario}`;
    listaAdmin.appendChild(li);
  });
}

function limparTodosAgendamentos(){
  agendamentos=[];
  atualizarLista();
  atualizarAdmin();
}

function registrarSintomas(){alert("Sintomas registrados")}

