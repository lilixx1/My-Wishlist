
const botaoAdicionar = document.getElementById("botao-adicionar");
const botaoCancelar = document.getElementById("botao-cancelar");
const formularioContainer = document.getElementById("formulario-container");
const formulario = document.getElementById("formulario-produto");
const listaProdutos = document.getElementById("lista-produtos-container");

const campoNome = document.getElementById("nome-produto");
const campoPreco = document.getElementById("preco-produto");
const campoCategoria = document.getElementById("categoria-produto");
const campoImagem = document.getElementById("imagem-produto");
const campoLink = document.getElementById("link-produto");

const totalItens = document.getElementById("total-itens");
const totalComprados = document.getElementById("total-comprados");
const campoOrcamento = document.getElementById("orcamento");

const CHAVE_PRODUTOS = "myWishlist";
const CHAVE_ORCAMENTO = "myWishlistOrcamento";

const botaoOrcamento = document.getElementById("botao-orcamento");
const painelOrcamento = document.getElementById("painel-orcamento");
const formularioOrcamento = document.getElementById("formulario-orcamento");
const campoValorOrcamento = document.getElementById("valor-orcamento");
const cancelarOrcamento = document.getElementById("cancelar-orcamento");
const barraOrcamento = document.getElementById("barra-orcamento");
const resumoOrcamento = document.getElementById("resumo-orcamento");

let produtos = carregarProdutos();
let orcamento = Number(localStorage.getItem(CHAVE_ORCAMENTO)) || 0;

function carregarProdutos() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_PRODUTOS));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarDados() {
    localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos));
    localStorage.setItem(CHAVE_ORCAMENTO, String(orcamento));
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

function atualizarResumo() {
    totalItens.textContent = produtos.length;

    totalComprados.textContent = produtos.filter(
        produto => produto.comprado
    ).length;

    campoOrcamento.textContent = formatarPreco(orcamento);
    campoValorOrcamento.value = orcamento || "";

    const totalComprado = produtos
        .filter(produto => produto.comprado)
        .reduce((soma, produto) => soma + Number(produto.preco), 0);

    if (orcamento <= 0) {
        barraOrcamento.style.width = "0%";
        resumoOrcamento.textContent = "Defina seu orçamento para começar ♡";
        return;
    }

    const restante = orcamento - totalComprado;
    const porcentagem = Math.min((totalComprado / orcamento) * 100, 100);

    barraOrcamento.style.width = `${porcentagem}%`;

    if (restante < 0) {
        resumoOrcamento.textContent =
            `Você ultrapassou o orçamento em ${formatarPreco(Math.abs(restante))}.`;
    } else {
        resumoOrcamento.textContent =
            `Você já gastou ${formatarPreco(totalComprado)} e ainda tem ${formatarPreco(restante)} disponíveis.`;
    }
}

function mostrarProdutos() {
    listaProdutos.replaceChildren();

    atualizarResumo();

    if (produtos.length === 0) {
        const mensagem = criarElemento(
            "p",
            "",
            "Sua wishlist está esperando por você. ♡"
        );

        mensagem.id = "mensagem-vazia";
        listaProdutos.appendChild(mensagem);
        return;
    }

    produtos.forEach(produto => {
        const cartao = criarElemento("article", "cartao-produto");

        if (produto.imagem) {
            const imagem = document.createElement("img");

            imagem.className = "imagem-produto";
            imagem.alt = produto.nome;
            imagem.loading = "lazy";
            imagem.src = produto.imagem;

            imagem.addEventListener("error", () => {
                imagem.hidden = true;
            });

            cartao.appendChild(imagem);
        }

        const conteudo = criarElemento("div", "conteudo-produto");

        const categoria = criarElemento(
            "span",
            "categoria-produto",
            produto.categoria || "Outros"
        );

        const nome = criarElemento("h3", "", produto.nome);

        const preco = criarElemento(
            "p",
            "preco-produto",
            formatarPreco(produto.preco)
        );

        const status = criarElemento(
            "p",
            produto.comprado ? "status comprado" : "status",
            produto.comprado ? "♡ Já comprei!" : "♡ Quero comprar"
        );

        const botoes = criarElemento("div", "acoes-produto");

        const botaoComprar = criarElemento(
            "button",
            "botao-comprar",
            produto.comprado ? "Desmarcar compra" : "Marcar comprado"
        );

        botaoComprar.type = "button";

        botaoComprar.addEventListener("click", () => {
            produto.comprado = !produto.comprado;

            salvarDados();
            mostrarProdutos();
        });

        const botaoExcluir = criarElemento(
            "button",
            "botao-excluir",
            "Excluir"
        );

        botaoExcluir.type = "button";

        botaoExcluir.addEventListener("click", () => {
            const confirmar = confirm(
                `Deseja excluir "${produto.nome}" da sua wishlist?`
            );

            if (!confirmar) {
                return;
            }

            produtos = produtos.filter(
                item => item.id !== produto.id
            );

            salvarDados();
            mostrarProdutos();
        });

        if (produto.link) {
            try {
                const url = new URL(produto.link);

                if (url.protocol === "https:" || url.protocol === "http:") {
                    const linkLoja = document.createElement("a");

                    linkLoja.className = "link-loja";
                    linkLoja.href = url.href;
                    linkLoja.target = "_blank";
                    linkLoja.rel = "noopener noreferrer";
                    linkLoja.textContent = "Ver na loja ↗";

                    conteudo.appendChild(linkLoja);
                }
            } catch {
                // Ignora links inválidos.
            }
        }

        botoes.append(botaoComprar, botaoExcluir);

        conteudo.append(
            categoria,
            nome,
            preco,
            status,
            botoes
        );

        cartao.appendChild(conteudo);
        listaProdutos.appendChild(cartao);
    });
}

function abrirFormulario() {
    formularioContainer.hidden = false;
    campoNome.focus();
}

function fecharFormulario() {
    formulario.reset();
    formularioContainer.hidden = true;
}

botaoAdicionar.addEventListener("click", abrirFormulario);

botaoCancelar.addEventListener("click", fecharFormulario);

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const categoria = campoCategoria.value;
    const imagem = campoImagem.value.trim();
    const link = campoLink.value.trim();

    if (!nome) {
        alert("Digite o nome do produto, vida! ♡");
        campoNome.focus();
        return;
    }

    if (
        campoPreco.value === "" ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        alert("Digite um preço válido para o produto.");
        campoPreco.focus();
        return;
    }

    const produto = {
        id: criarId(),
        nome,
        preco,
        categoria,
        imagem,
        link,
        comprado: false
    };

    produtos.unshift(produto);

    salvarDados();
    mostrarProdutos();
    fecharFormulario();
});

function criarId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Inicializa a página com os dados salvos.
mostrarProdutos();
fecharFormulario();


botaoOrcamento.addEventListener("click", () => {
    painelOrcamento.hidden = false;
    campoValorOrcamento.focus();
});

cancelarOrcamento.addEventListener("click", () => {
    painelOrcamento.hidden = true;
});

formularioOrcamento.addEventListener("submit", evento => {
    evento.preventDefault();

    const valor = Number(campoValorOrcamento.value);

    if (
        campoValorOrcamento.value === "" ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        alert("Digite um orçamento válido, vida! ♡");
        return;
    }

    orcamento = valor;
    salvarDados();
    atualizarResumo();

    painelOrcamento.hidden = true;
});
