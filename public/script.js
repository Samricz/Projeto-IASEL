const formChat = document.getElementById("formChat");
const campoMensagem = document.getElementById("mensagem");
const areaMensagens = document.getElementById("areaMensagens");
const botaoEnviar = document.getElementById("botaoEnviar");
const botaoNovaConversa = document.getElementById("novaConversa");
const statusCarregamento = document.getElementById("statusCarregamento");

const mensagemInicial =
    "Oi! Eu sou a SEL 💜 Uma mentora virtual criada para apoiar " +
    "meninas e mulheres que estão aprendendo Python e Banco de Dados. " +
    "Qual é a sua dúvida?";

let messages = [
    {
        role: "assistant",
        content: mensagemInicial
    }
];

let previousResponseId = null;


function adicionarMensagem(texto, autor) {
    const role = autor === "sel" ? "assistant" : "user";

    messages.push({
        role: role,
        content: texto
    });

    const elementoMensagem = document.createElement("article");

    elementoMensagem.classList.add(
        "mensagem",
        autor === "sel" ? "mensagem-sel" : "mensagem-usuario"
    );

    const avatar = document.createElement("div");
    avatar.classList.add("avatar-mensagem");
    avatar.textContent = autor === "sel" ? "S" : "V";

    const conteudo = document.createElement("div");
    conteudo.classList.add("conteudo-mensagem");

    const nome = document.createElement("strong");
    nome.textContent = autor === "sel" ? "SEL" : "Você";

    const paragrafo = document.createElement("p");
    paragrafo.textContent = texto;

    conteudo.appendChild(nome);
    conteudo.appendChild(paragrafo);

    elementoMensagem.appendChild(avatar);
    elementoMensagem.appendChild(conteudo);

    areaMensagens.appendChild(elementoMensagem);

    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}


function definirCarregamento(carregando) {
    statusCarregamento.hidden = !carregando;
    botaoEnviar.disabled = carregando;
    campoMensagem.disabled = carregando;
    botaoNovaConversa.disabled = carregando;
}


formChat.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const mensagem = campoMensagem.value.trim();

    if (mensagem === "") {
        return;
    }

    adicionarMensagem(mensagem, "usuario");

    campoMensagem.value = "";

    definirCarregamento(true);

    try {
        const respostaHttp = await fetch("/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                mensagem: mensagem,
                previousResponseId: previousResponseId
            })
        });

        const dados = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(
                dados.erro || "Não foi possível obter uma resposta."
            );
        }

        previousResponseId = dados.responseId;

        adicionarMensagem(dados.response, "sel");
    } catch (erro) {
        adicionarMensagem(
            `Desculpe, aconteceu um erro: ${erro.message}`,
            "sel"
        );
    } finally {
        definirCarregamento(false);
        campoMensagem.focus();
    }
});


botaoNovaConversa.addEventListener("click", () => {
    messages = [];
    previousResponseId = null;

    areaMensagens.innerHTML = "";

    adicionarMensagem(mensagemInicial, "sel");

    campoMensagem.value = "";
    campoMensagem.focus();
});


campoMensagem.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        formChat.requestSubmit();
    }
});