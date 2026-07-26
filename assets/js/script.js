let jsonData;
let currentTooltipAudio = null;
let currentPlayingButton = null;

function stopCurrentTooltipAudio() {
  if (currentTooltipAudio) {
    currentTooltipAudio.pause();
    currentTooltipAudio = null;
  }
  if (currentPlayingButton) {
    currentPlayingButton.classList.remove("playing");
    $(currentPlayingButton).find(".play-icon").show();
    $(currentPlayingButton).find(".stop-icon").hide();
    currentPlayingButton = null;
  }
}
// START FUNCAO RESIZE
function escalaProporcao(largura, altura) {
  var larguraScreen = $(window).width();
  var alturaScreen = $(window).height();
  var proporcaoAltura = (alturaScreen * 100) / altura;
  var proporcaoLargura = (larguraScreen * 100) / largura;
  var proporcao, larguraAltura, larguraAlturaAuto;

  if (proporcaoAltura < proporcaoLargura) {
    larguraAltura = "height";
    larguraAlturaAuto = "width";
    proporcao = proporcaoAltura / 100;
  } else {
    larguraAltura = "width";
    larguraAlturaAuto = "height";
    proporcao = proporcaoLargura / 100;
  }

  return [proporcao, larguraAltura, larguraAlturaAuto];
}

function resizeBodyConteudo() {
  var proporcao1920 = escalaProporcao(1920, 1080)[0];

  $(".wrapper").css({
    transform: "scale(" + proporcao1920 + ")",
    "transform-origin": "center center",
  });

  if (Number($(window).width()) >= 1920) {
    if ($(window).width() > $(window).height()) {
      $(".centralizar-obj").css({
        width: $(window).width() * (16 / 9),
        height: "auto",
        "padding-top": "56.25%",
      });
    }
  }
  var proporcao900;

  if ($(window).width() < 992) {
    proporcao900 = escalaProporcao(900, 576)[0];
  } else {
    proporcao900 = 1;
  }
}

$(document).ready(function () {
  resizeBodyConteudo();
  $(window).resize(function () {
    resizeBodyConteudo();
  });
});
// END FUNCAO RESIZE

// carrega cena
let cenasArray, linksArray;
let giseleCorrigida = false;
let giseleFalasFinaisJogadas = false;
let giseleFalasFinaisAtivas = false;
let avancarFalasFinais = null;
let startGiseleFalasFinais = null;
function carregarCenas(json) {
  // cria cenas e links no indice
  document.querySelector(".nav-item").innerText = `Cena 1`;
  for (let i = 0; i < json.qtdCenas - 1; i++) {
    const cenaTemplate = document.querySelector(".cena");
    const cloneCena = cenaTemplate.cloneNode(true);
    document.querySelector("main").appendChild(cloneCena);
    const linkIndiceTemplate = document.querySelector(".nav-item");
    const cloneLinkIndice = linkIndiceTemplate.cloneNode(true);
    cloneLinkIndice.innerText = `Cena ${json.cenas[i + 1].id}`;
    document.querySelector(".navbar-nav").appendChild(cloneLinkIndice);
  }

  cenasArray = document.querySelectorAll(".cena");
  linksArray = document.querySelectorAll(".nav-item");

  for (let i = 0; i < json.qtdCenas; i++) {
    const element = cenasArray[i];
    let backgroundPath = `${jsonData.cenas[i].pasta}/${jsonData.cenas[i].background}`;
    element.children[0].style.backgroundImage = `url(assets/cenas/${backgroundPath})`;
    if (json.cenas[i].modal_saida) {
      element.setAttribute("data-modal-saida", json.cenas[i].modal_saida);
    }
    if (json.cenas[i].monotexto == true) {
      element.setAttribute("data-monotexto", true);

      // CRIAR BALOES
      for (let j = 0; j < jsonData.cenas[i].qtdBaloes; j++) {
        const tooltipBtn = document.createElement("button");
        const tooltip = document.createElement("div");
        const tooltipParagraph = document.createElement("p");
        const tooltipCloseBtn = document.createElement("button");

        tooltipCloseBtn.classList.add("btn-tooltip-close");
        tooltipParagraph.innerHTML = jsonData.cenas[i].conteudoBaloes[j];
        tooltipBtn.classList.add("tooltip-btn");
        tooltip.classList.add("hq-tooltip");

        const cenaInterativaId = jsonData.cenas[i].cenaInterativa;
        if (cenaInterativaId == 9 || cenaInterativaId == 11) {
          tooltip.classList.add("hq-tooltip-audio");

          const audioContainer = document.createElement("div");
          audioContainer.classList.add("tooltip-audio-container");

          const avatarColumn = document.createElement("div");
          avatarColumn.classList.add("avatar-audio-column");

          const avatarCircle = document.createElement("div");
          avatarCircle.classList.add("avatar-ana-circle");

          const avatarImg = document.createElement("img");
          avatarImg.src = `assets/cenas/${jsonData.cenas[i].pasta}/avatar-ana.jpeg`;
          avatarImg.alt = "Avatar da Guia Ana";
          avatarCircle.appendChild(avatarImg);

          const playPauseBtn = document.createElement("button");
          playPauseBtn.classList.add("btn-play-pause");
          playPauseBtn.type = "button";
          playPauseBtn.innerHTML = `
            <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg class="stop-icon" viewBox="0 0 24 24" width="24" height="24" fill="white" style="display: none;">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
          `;

          avatarColumn.appendChild(avatarCircle);
          avatarColumn.appendChild(playPauseBtn);

          const textContainer = document.createElement("div");
          textContainer.classList.add("tooltip-text-container");
          textContainer.appendChild(tooltipParagraph);

          audioContainer.appendChild(avatarColumn);
          audioContainer.appendChild(textContainer);

          tooltip.appendChild(audioContainer);

          const audioPath = `assets/cenas/${jsonData.cenas[i].pasta}/audios/audio${j + 1}.mp3`;
          playPauseBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (currentTooltipAudio && currentPlayingButton === playPauseBtn) {
              stopCurrentTooltipAudio();
            } else {
              stopCurrentTooltipAudio();

              const audio = new Audio(audioPath);
              audio.play().catch(function (err) {
                console.error("Erro ao reproduzir áudio:", err);
              });

              currentTooltipAudio = audio;
              currentPlayingButton = playPauseBtn;
              playPauseBtn.classList.add("playing");
              $(playPauseBtn).find(".play-icon").hide();
              $(playPauseBtn).find(".stop-icon").show();

              audio.addEventListener("ended", function () {
                stopCurrentTooltipAudio();
              });
            }
          });
        } else {
          tooltip.appendChild(tooltipParagraph);
        }

        tooltip.appendChild(tooltipCloseBtn);
        cenasArray[i].children[3].appendChild(tooltipBtn);
        cenasArray[i].children[3].appendChild(tooltip);
      }
    }

    if (json.cenas[i].personagemUnico == true) {
      element.setAttribute("data-personagem_unico", true);
    }

    if (json.cenas[i].cenaInterativa == 1) {
      //monta exercicio 1
      element.setAttribute("data-cenainterativa", "1");
      const pasta = document.createElement("div");
      pasta.classList.add("pasta-bg");

      const listaDocs = document.createElement("div");
      listaDocs.classList.add("docs-list-1");
      const ordemServico = document.createElement("button");
      ordemServico.classList.add("ordem-servico");
      const checklistEquips = document.createElement("button");
      const equipsGuia = document.createElement("button");
      const listaPassageiros = document.createElement("button");
      const roteiroViagem = document.createElement("button");
      ordemServico.innerText = "Ordem de serviço";
      checklistEquips.innerText = "Checklist de equipamentos";
      equipsGuia.innerText = "Equipamentos do Guia";
      listaPassageiros.innerText = "Lista de passageiros";
      roteiroViagem.innerText = "Roteiro";

      listaDocs.appendChild(ordemServico);
      listaDocs.appendChild(checklistEquips);
      listaDocs.appendChild(equipsGuia);
      listaDocs.appendChild(listaPassageiros);
      listaDocs.appendChild(roteiroViagem);

      pasta.appendChild(listaDocs);
      cenasArray[i].children[3].appendChild(pasta);

      // Define data for the Bootstrap Modals
      const modalData = [
        {
          id: "modal-ordem-serv",
          title: "Ordem de Serviço",
          body: `
            <div class="text-center">
              <img src="assets/cenas/Cena_04/documentos/ordem-de-servico.png" class="img-fluid" style="max-width: 600px;" alt="Ordem de serviço" />
            </div>
          `,
          large: true
        },
        {
          id: "modal-checklist-equips",
          title: "Checklist de equipamentos",
          body: `
            <div class="text-center">
              <img src="assets/cenas/Cena_04/documentos/checklist_veiculo-equipamentos.png" class="img-fluid" style="max-width: 600px;" alt="Checklist de equipamentos" />
            </div>
          `,
          large: true
        },
        {
          id: "modal-equips-guia",
          title: "Lista de equipamentos do Guia",
          body: `
            <p>Alguns documentos que o guia sempre deve levar consigo:</p>
            <ul>
              <li>Crachá do Cadastur;</li>
              <li>Documentos pessoais e licenças;</li>
              <li>Celular carregado e Power Bank;</li>
              <li>Kit de primeiros socorros;</li>
              <li>Rádios comunicadores;</li>
              <li>Lanterna pequena;</li>
              <li>Apito para emergências;</li>
              <li>Relógio de pulso;</li>
              <li>Bloco de anotações e canetas;</li>
              <li>Bandeira, placa ou leque identificador;</li>
              <li>Guarda-chuva portátil ou capa de chuva;</li>
              <li>Protetor solar e repelente.</li>
            </ul>
          `,
          large: false
        },
        {
          id: "modal-lista-passageiros",
          title: "Lista de Passageiros",
          body: `
            <div class="text-center">
              <img src="assets/cenas/Cena_04/documentos/licenca-de-viagem-eletronica.png" class="img-fluid" style="max-width: 600px;" alt="Lista ANTT" />
            </div>
          `,
          large: true
        },
        {
          id: "modal-roteiro-viagem",
          title: "Roteiro da viagem",
          body: `
            <div class="text-center">
              <img src="assets/cenas/Cena_04/documentos/Roteiro_do_guia-2026.png" class="img-fluid" style="max-width: 600px;" alt="Roteiro da viagem" />
            </div>
          `,
          large: true
        }
      ];

      const bsModals = [];
      modalData.forEach((m) => {
        let modalEl = document.getElementById(m.id);
        if (!modalEl) {
          modalEl = document.createElement("div");
          modalEl.className = "modal fade";
          modalEl.id = m.id;
          modalEl.setAttribute("tabindex", "-1");
          modalEl.setAttribute("aria-hidden", "true");
          modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-scrollable ${m.large ? "modal-xl" : ""}">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">${m.title}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  ${m.body}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modalEl);
        }

        const bsModal = new bootstrap.Modal(modalEl);
        bsModals.push(bsModal);

        modalEl.addEventListener("hidden.bs.modal", function () {
          const activeCena = $(".cena.active");
          const totalButtons = activeCena.find(".docs-list-1 button").length;
          const checkedButtons = activeCena.find(".docs-list-1 button.checado").length;
          if (totalButtons > 0 && totalButtons === checkedButtons) {
            $(".btn-next").removeClass("disabled");
          }
        });
      });

      const buttons = element.querySelectorAll(".docs-list-1 button");
      for (let p = 0; p < buttons.length; p++) {
        buttons[p].addEventListener("click", function () {
          $(this).addClass("checado");
          bsModals[p].show();
        });
      }
    }

    if (json.cenas[i].cenaInterativa == 2) {
      element.setAttribute("data-cenainterativa", "2");
      cenasArray[i].classList.add("cena-zap");
      cenasArray[i].classList.add("zap-0");
    }

    if (json.cenas[i].cenaInterativa == 3) {
      element.setAttribute("data-cenainterativa", "3");
      const pasta = document.createElement("div");
      const modaisContainer = document.createElement("div");
      pasta.classList.add("pasta-bg");
      modaisContainer.classList.add("modais-container");

      const listaDocs = document.createElement("div");
      listaDocs.classList.add("docs-list");
      const adesivoRegistro = document.createElement("button");
      const notaFiscal = document.createElement("button");
      const certificadoRegistro = document.createElement("button");
      const laudoInspecao = document.createElement("button");
      const docSeguro = document.createElement("button");
      const cnhD = document.createElement("button");
      const listaPassageirosANTT = document.createElement("button");
      adesivoRegistro.innerText = "Adesivo de registro do veículo";
      notaFiscal.innerText = "Nota fiscal do serviço";
      certificadoRegistro.innerText = "Certificado de Registro e Licenciamento";
      laudoInspecao.innerText = "Laudo de Inspeção técnica";
      docSeguro.innerText = "Documento de Seguro";
      cnhD.innerText = "Carteira Nacional de Habilitação";
      listaPassageirosANTT.innerText = "Lista de passageiros da ANTT";

      listaDocs.appendChild(adesivoRegistro);
      listaDocs.appendChild(notaFiscal);
      listaDocs.appendChild(certificadoRegistro);
      listaDocs.appendChild(laudoInspecao);
      listaDocs.appendChild(docSeguro);
      listaDocs.appendChild(cnhD);
      listaDocs.appendChild(listaPassageirosANTT);

      pasta.appendChild(listaDocs);

      const modalAdesivoRegistro = document.createElement("div");
      modalAdesivoRegistro.classList.add("modal-documentos");
      const modalNotaFiscal = document.createElement("div");
      modalNotaFiscal.classList.add("modal-documentos");
      const modalCertificadoRegistro = document.createElement("div");
      modalCertificadoRegistro.classList.add("modal-documentos");
      const modalLaudoInspecao = document.createElement("div");
      modalLaudoInspecao.classList.add("modal-documentos");
      const modalDocSeguro = document.createElement("div");
      modalDocSeguro.classList.add("modal-documentos");
      const modalCNH = document.createElement("div");
      modalCNH.classList.add("modal-documentos");
      const modalListaPassageirosANTT = document.createElement("div");
      modalListaPassageirosANTT.classList.add("modal-documentos");

      modalAdesivoRegistro.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/Cadastur.png">
            <p><b>Adesivo da Cadastur</b>: Verifique se está presente num local visível do veículo o adesivo de certificação da Cadastur.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalNotaFiscal.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/nota_fiscal.png">
            <p><b>Nota fiscal do serviço</b>: verifique a descrição do trajeto, origem, destino e quilometragem contratada.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalCertificadoRegistro.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/certificado_registro_licenciamento.png">
            <p><b>Certificado de registro e licenciamento</b>: verifique o número da placa e a data de vencimento.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalLaudoInspecao.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/laudo_inspecao.png">
            <p><b>Laudo de inspeção técnica (LIT)</b>: verifique a placa e a data de vencimento.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalDocSeguro.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/documento_seguro.png">
            <p><b>Documento de seguro do veículo</b>: verifique se a data do documento está vigente.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalCNH.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/cnh.png">
            <p><b>Carteira de habilitação (original)</b>: verifique a categoria de habilitação (D) e a data de validade, que precisa estar vigente.</p>
            <button class="modal-documentos-close">OK</button>`;

      modalListaPassageirosANTT.innerHTML = `
            <img class="img-fluid" src="assets/cenas/Cena_11/documentos/lista_passageiros.png">
            <p><b>Lista de passageiros ANTT ou órgão estadual</b>: verifique o destino, a origem, a quantidade de passageiros, a placa do veículo e a conferência dos dados dos passageiros.</p>
            <button class="modal-documentos-close">OK</button>`;

      modaisContainer.appendChild(modalAdesivoRegistro);
      modaisContainer.appendChild(modalNotaFiscal);
      modaisContainer.appendChild(modalCertificadoRegistro);
      modaisContainer.appendChild(modalLaudoInspecao);
      modaisContainer.appendChild(modalDocSeguro);
      modaisContainer.appendChild(modalCNH);
      modaisContainer.appendChild(modalListaPassageirosANTT);

      cenasArray[i].children[3].appendChild(pasta);
      cenasArray[i].children[3].appendChild(modaisContainer);

      $(modaisContainer).find(".modal-documentos").hide();
      $(modaisContainer).hide();

      const docButtons = listaDocs.querySelectorAll("button");
      for (let p = 0; p < docButtons.length; p++) {
        const docBtn = docButtons[p];
        docBtn.addEventListener("click", function () {
          $(this).addClass("checado");
          $(element).find(".modais-container").fadeIn();
          $($(element).find(".modal-documentos")[p]).fadeIn();
        });
      }

      $(modaisContainer).find(".modal-documentos-close").click(function () {
        $(element).find(".modal-documentos").fadeOut();
        $(element).find(".modais-container").fadeOut();

        if (
          $(element).find(".docs-list button").length ==
          $(element).find(".docs-list button.checado").length
        ) {
          $(".btn-next").removeClass("disabled");
        }
      });
    }

    if (json.cenas[i].cenaInterativa == 4) {
      element.setAttribute("data-cenainterativa", "4");
      const cinto = document.createElement("img");
      const lixo = document.createElement("img");
      const microfone = document.createElement("img");
      const wc = document.createElement("img");
      const bordoB = document.createElement("img");

      cinto.setAttribute("src", "assets/cenas/Cena_18/cinto.png");
      cinto.classList.add("cinto-bg");
      lixo.setAttribute("src", "assets/cenas/Cena_18/lixo.png");
      lixo.classList.add("lixo-bg");
      microfone.setAttribute("src", "assets/cenas/Cena_18/microfone.png");
      microfone.classList.add("microfone-bg");
      wc.setAttribute("src", "assets/cenas/Cena_18/wc.png");
      wc.classList.add("wc-bg");
      bordoB.setAttribute(
        "src",
        "assets/cenas/Cena_18/Servico_de_bordo_Bagunca.png",
      );
      bordoB.classList.add("bordo-bg");

      cenasArray[i].children[3].appendChild(cinto);
      cenasArray[i].children[3].appendChild(lixo);
      cenasArray[i].children[3].appendChild(microfone);
      cenasArray[i].children[3].appendChild(wc);
      cenasArray[i].children[3].appendChild(bordoB);
      cenasArray[i].children[3].children[0].classList.add("cinto-tt");
      cenasArray[i].children[3].children[2].classList.add("lixo-tt");
      cenasArray[i].children[3].children[4].classList.add("mic-tt");
      cenasArray[i].children[3].children[6].classList.add("wc-tt");
      cenasArray[i].children[3].children[8].classList.add("bordo-tt");

      $(".cinto-tt").click(() => {
        $(".cinto-bg").fadeOut();
      });
      $(".lixo-tt").click(() => {
        $(".lixo-bg").fadeOut();
      });
      $(".mic-tt").click(() => {
        $(".microfone-bg").fadeOut();
      });
      $(".wc-tt").click(() => {
        $(".wc-bg").fadeOut();
      });
      $(".bordo-tt").click(() => {
        bordoB.setAttribute(
          "src",
          "assets/cenas/Cena_18/Servico_de_bordo_no_lugar.png",
        );
      });
    }

    if (json.cenas[i].cenaInterativa == 5) {
      //monta exercicio 5
      element.setAttribute("data-cenainterativa", "5");
      const pasta = document.createElement("div");
      const modaisContainer = document.createElement("div");
      pasta.classList.add("pasta-bg");
      modaisContainer.classList.add("modais-container");

      const tabela = document.createElement("table");
      tabela.classList.add("tabela-passageiros");
      tabela.innerHTML = `
        <thead>
        <tr>
          <th colspan="4">
          <p class="text-center text-uppercase m-0 p-0">Lista de passageiros</p>
          </th>
        </tr>  
        <tr>
            <th>Nome</th>
            <th>Tipo de documento</th>
            <th>No.documento</th>
            <th>Órgão expeditor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><button class="btn-passageiro"><span class="check-icon"></span>Diego Nunes</button></td>
            <td>CIN</td>
            <td>012.398.889-85</td>
            <td>SSP</td>
          </tr>
          <tr>
            <td><button class="btn-passageiro"><span class="check-icon"></span>Joana Maldonado</button></td>
            <td>CIN</td>
            <td>020.972.237-54</td>
            <td>SSP</td>
          </tr>
          <tr>
            <td><button class="btn-passageiro"><span class="check-icon"></span>Maria Oliveira</button></td>
            <td>CIN</td>
            <td>225.958.472-01</td>
            <td>SSP</td>
          </tr>
          <tr>
            <td><button class="btn-passageiro"><span class="check-icon"></span>Gisele Cavalcante</button></td>
            <td>CIN</td>
            <td>224.387.465-44</td>
            <td>SSP</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        
        </tbody>
      `;
      pasta.appendChild(tabela);

      const exemplodelicenca = document.createElement("p");
      exemplodelicenca.classList.add("alert");
      exemplodelicenca.classList.add("alert-info");
      exemplodelicenca.classList.add("text-center");
      exemplodelicenca.classList.add("fs-4");
      exemplodelicenca.classList.add("mt-1");
      exemplodelicenca.innerHTML = "Clique para visualizar um exemplo da <a href='javascript:' data-bs-toggle='modal' data-bs-target='#modal-licenca' style='color: black; text-decoration: underline'>Licença de Viagem Eletrônica</a> completo.";
      pasta.appendChild(exemplodelicenca);

      if (!document.getElementById("modal-licenca")) {
        const modalLicenca = document.createElement("div");
        modalLicenca.classList.add("modal", "fade");
        modalLicenca.id = "modal-licenca";
        modalLicenca.setAttribute("tabindex", "-1");
        modalLicenca.setAttribute("aria-hidden", "true");
        modalLicenca.innerHTML = `
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Licença de Viagem Eletrônica</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="alert alert-warning" role="alert" style="font-size: 18px; font-weight: bold; text-align: center;">
                  Exemplo de documento: Licença de Viagem eletrônica
                </div>
                <img src="assets/cenas/Cena_21_23/documentos/licenca-de-viagem-eletronica.png" class="img-fluid w-100" alt="Licença de Viagem Eletrônica">
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modalLicenca);
      }

      const modalPassageiro1 = document.createElement("div");
      modalPassageiro1.classList.add("modal-documentos");
      const modalPassageiro2 = document.createElement("div");
      modalPassageiro2.classList.add("modal-documentos");
      const modalPassageiro3 = document.createElement("div");
      modalPassageiro3.classList.add("modal-documentos");
      const modalPassageiro4 = document.createElement("div");
      modalPassageiro4.classList.add("modal-documentos");

      modalPassageiro1.innerHTML = `
                <div class="modal-content">
                    <img class="img-fluid" src="assets/cenas/Cena_21_23/documentos/i-diego.jpg">
                    <button class="modal-documentos-close">OK</button>
                </div>
            `;
      modalPassageiro2.innerHTML = `
                <div class="modal-content">
                    <img class="img-fluid" src="assets/cenas/Cena_21_23/documentos/i-joana.jpg">
                    <button class="modal-documentos-close">OK</button>
                </div>
            `;
      modalPassageiro3.innerHTML = `
                <div class="modal-content">
                    <img class="img-fluid" src="assets/cenas/Cena_21_23/documentos/i-maria.jpg">
                    <button class="modal-documentos-close">OK</button>
                </div>
            `;
      modalPassageiro4.innerHTML = `
                <div class="modal-content">
                    <img class="img-fluid" src="assets/cenas/Cena_21_23/documentos/i-gisele.jpg">
                    <button class="modal-documentos-close">OK</button>
                </div>
            `;

      modaisContainer.appendChild(modalPassageiro1);
      modaisContainer.appendChild(modalPassageiro2);
      modaisContainer.appendChild(modalPassageiro3);
      modaisContainer.appendChild(modalPassageiro4);

      cenasArray[i].children[3].appendChild(pasta);
      cenasArray[i].children[3].appendChild(modaisContainer);

      $(modaisContainer).find(".modal-documentos").hide();
      $(modaisContainer).hide();

      // Create and append the Ana error feedback overlay
      const anaOverlay = document.createElement("div");
      anaOverlay.classList.add("ana-feedback-overlay");
      const anaImg = document.createElement("img");
      anaImg.src = "assets/cenas/Cena_21_23/Ana2.png";
      const balaoImg = document.createElement("img");
      balaoImg.src = "";
      anaOverlay.appendChild(anaImg);
      anaOverlay.appendChild(balaoImg);

      // Create the custom Avançar button
      const btnAvancarBalao = document.createElement("button");
      btnAvancarBalao.classList.add("btn", "btn-avancar-balao");
      btnAvancarBalao.innerText = "Avançar";
      anaOverlay.appendChild(btnAvancarBalao);

      cenasArray[i].children[3].appendChild(anaOverlay);

      let currentBaloes = [];
      let currentBalaoIndex = 0;
      let onBaloesEnd = null;

      function showAnaBaloes(baloesList, callback) {
        currentBaloes = baloesList;
        currentBalaoIndex = 0;
        onBaloesEnd = callback;
        balaoImg.src = `assets/cenas/Cena_21_23/${currentBaloes[currentBalaoIndex]}`;
        $("nav.controls").fadeOut();
        $(anaOverlay).fadeIn();
      }

      anaOverlay.addEventListener("click", function (event) {
        if (!event.target.classList.contains("btn-avancar-balao")) {
          return;
        }
        if (giseleFalasFinaisAtivas) {
          avancarFalasFinais();
        } else {
          currentBalaoIndex++;
          if (currentBalaoIndex < currentBaloes.length) {
            balaoImg.src = `assets/cenas/Cena_21_23/${currentBaloes[currentBalaoIndex]}`;
          } else {
            $(anaOverlay).fadeOut();
            $("nav.controls").fadeIn();
            if (onBaloesEnd) {
              onBaloesEnd();
            }
          }
        }
      });

      const falasFinais = ["fala_erro_4.png", "fala_erro_5.png", "fala_erro_6.png", "fala_erro_7.png"];
      let finalFalasIndex = 0;

      startGiseleFalasFinais = function () {
        giseleFalasFinaisAtivas = true;
        finalFalasIndex = 0;
        balaoImg.src = `assets/cenas/Cena_21_23/${falasFinais[finalFalasIndex]}`;
        $("nav.controls").fadeOut();
        $(anaOverlay).fadeIn();
      };

      avancarFalasFinais = function () {
        finalFalasIndex++;
        if (finalFalasIndex < falasFinais.length) {
          balaoImg.src = `assets/cenas/Cena_21_23/${falasFinais[finalFalasIndex]}`;
        } else {
          $(anaOverlay).fadeOut();
          $("nav.controls").fadeIn();
          giseleFalasFinaisAtivas = false;
          giseleFalasFinaisJogadas = true;
          // Go to the next scene normally
          resetCena($(".cena.active")[0]);
          const proxTela = $(".cena.active").next(".cena");
          $(".cena.active").fadeOut();
          $(".cena.active").removeClass("active");
          $(proxTela).fadeIn();
          $(proxTela).addClass("active");
          setTimeout(() => {
            cenaAtivada($(".cena.active")[0]);
            sincIndice();
          }, 500);
        }
      };

      function checarFimExercicio5() {
        const totalActivos = $(".cena.active .tabela-passageiros .btn-passageiro").length;
        const totalChecados = $(".cena.active .tabela-passageiros .btn-passageiro.checado").length;
        if (totalActivos === totalChecados && giseleCorrigida) {
          $(".btn-next").removeClass("disabled");
        } else {
          $(".btn-next").addClass("disabled");
        }
      }

      const btnPassageiros = tabela.querySelectorAll(".btn-passageiro");
      for (let p = 0; p < btnPassageiros.length; p++) {
        const btnPass = btnPassageiros[p];
        btnPass.addEventListener("click", function () {
          if (p === 3) {
            // Gisele Cavalcante
            showAnaBaloes(["fala_erro_1.png", "fala_erro_2.png", "fala_erro_3.png"], function () {
              // Apply styling changes:
              const trGisele = tabela.querySelectorAll("tbody tr")[3];
              trGisele.classList.add("linha-gisele-antiga");

              const buttonGisele = trGisele.querySelector(".btn-passageiro");
              if (buttonGisele) {
                buttonGisele.setAttribute("disabled", "true");
                buttonGisele.style.pointerEvents = "none";
                buttonGisele.style.backgroundColor = "none";
                buttonGisele.style.border = "0px";
                buttonGisele.classList.remove("btn-passageiro");
                const checkIcon = buttonGisele.querySelector(".check-icon");
                if (checkIcon) {
                  checkIcon.style.display = "none";
                }
              }

              const tdCpfErrado = trGisele.querySelectorAll("td")[2];
              tdCpfErrado.classList.add("cpf-errado");

              // Create new row
              const emptyRow = tabela.querySelectorAll("tbody tr")[4];
              if (emptyRow) {
                emptyRow.innerHTML = `
                  <td><span class="check-icon-nova"></span>Gisele Cavalcante</td>
                  <td>CIN</td>
                  <td>224.387.456-34</td>
                  <td>SSP</td>
                `;
                emptyRow.classList.add("nova-linha-gisele");
              }

              giseleCorrigida = true;
              checarFimExercicio5();
            });
          } else {
            $(this).addClass("checado");
            $(element).find(".modais-container").fadeIn();
            $($(element).find(".modal-documentos")[p]).fadeIn();
          }
        });
      }

      $(modaisContainer).find(".modal-documentos-close").click(function () {
        $(element).find(".modal-documentos").fadeOut();
        $(element).find(".modais-container").fadeOut();

        checarFimExercicio5();
      });
    }

    if (json.cenas[i].cenaInterativa == 6) {
      element.setAttribute("data-cenainterativa", "6");

      const ponto1 = document.createElement("img");
      const ponto2 = document.createElement("img");
      const ponto3 = document.createElement("img");
      const ponto4 = document.createElement("img");
      const ponto5 = document.createElement("img");
      ponto1.setAttribute("src", "assets/cenas/Cena_31/X_01.png");
      ponto2.setAttribute("src", "assets/cenas/Cena_31/X_02.png");
      ponto3.setAttribute("src", "assets/cenas/Cena_31/X_03.png");
      ponto4.setAttribute("src", "assets/cenas/Cena_31/X_04.png");
      ponto5.setAttribute("src", "assets/cenas/Cena_31/X_05.png");

      const botao1 = document.createElement("button");
      const botao2 = document.createElement("button");
      const botao3 = document.createElement("button");
      const botao4 = document.createElement("button");
      const botao5 = document.createElement("button");
      botao3.classList.add("correto");
      const btnArray = [botao1, botao2, botao3, botao4, botao5];
      btnArray.forEach((el) => {
        el.classList.remove("clicado");
      });
      $(".cena[data-cenainterativa='6'] .marcacao-x").fadeIn();
      document
        .querySelector(".cena[data-cenainterativa='6'] .background")
        .setAttribute(
          "style",
          'background: url("assets/cenas/Cena_31/Fundo.png");',
        );
      $(".cena[data-cenainterativa='6'] .feedback-ana").fadeOut();
      $(".cena[data-cenainterativa='6'] .feedback-positivo").fadeOut();

      const imgArray = [ponto1, ponto2, ponto3, ponto4, ponto5];

      const feedbackPositivoBus = document.createElement("div");
      const feedbackNegativoBus = document.createElement("div");
      const feedbackTextoPositivoBus = document.createElement("img");
      const feedbackTextoNegativoBus = document.createElement("img");
      const feedbackAnaPositivo = document.createElement("img");
      const feedbackAnaNegativo = document.createElement("img");
      feedbackTextoPositivoBus.setAttribute(
        "src",
        "assets/cenas/Cena_31/Feedback_Positivo.png",
      );
      feedbackTextoNegativoBus.setAttribute(
        "src",
        "assets/cenas/Cena_31/Feedback_Negativo.png",
      );
      feedbackAnaPositivo.setAttribute(
        "src",
        "assets/cenas/Cena_31/Personagem_Ana.png",
      );
      feedbackAnaNegativo.setAttribute(
        "src",
        "assets/cenas/Cena_31/Personagem_Ana.png",
      );
      feedbackPositivoBus.classList.add("feedback-positivo");
      feedbackPositivoBus.classList.add("feedback");
      feedbackNegativoBus.classList.add("feedback-negativo");
      feedbackNegativoBus.classList.add("feedback");
      feedbackPositivoBus.appendChild(feedbackAnaPositivo);
      feedbackPositivoBus.appendChild(feedbackTextoPositivoBus);
      feedbackNegativoBus.appendChild(feedbackTextoNegativoBus);
      feedbackNegativoBus.appendChild(feedbackAnaNegativo);
      const feedbackArray = [feedbackPositivoBus, feedbackNegativoBus];

      const btnFecharNegativo = document.createElement("button");
      btnFecharNegativo.innerText = "Fechar";
      btnFecharNegativo.classList.add("btn");
      btnFecharNegativo.addEventListener("click", function () {
        $(this).parents(".feedback").fadeOut();
      });

      imgArray.forEach((element) => {
        element.classList.add("marcacao-x");
        cenasArray[i].children[3].appendChild(element);
      });

      for (let o = 0; o < btnArray.length; o++) {
        const btnElement = btnArray[o];
        cenasArray[i].children[3].appendChild(btnElement);
        btnElement.addEventListener("click", function () {
          const marcador = document.querySelectorAll(
            ".cena.active .marcacao-x",
          )[o];
          if (btnElement.classList.contains("correto")) {
            document
              .querySelector(".cena.active .background")
              .setAttribute(
                "style",
                'background: url("assets/cenas/Cena_31/Estacionou_Certo.png");',
              );
            $(".cena.active .feedback-ana").fadeIn();
            $(".cena.active .feedback-positivo").fadeIn();
            $(".btn-next").removeClass("disabled");
            $(".cena.active .marcacao-x").fadeOut();
          } else {
            $(marcador).fadeOut();
            $(this).fadeOut();
            $(".cena.active .feedback-ana").fadeIn();
            $(".cena.active .feedback-negativo").fadeIn();
          }

          btnElement.classList.add("clicado");
        });
      }

      feedbackArray.forEach((element) => {
        cenasArray[i].children[3].appendChild(element);
        $(element).hide();
      });

      feedbackNegativoBus.appendChild(btnFecharNegativo);
    }

    if (json.cenas[i].cenaInterativa == 7) {
      element.setAttribute("data-cenainterativa", "7");

      const caminho1 = document.createElement("div");
      const caminho1b = document.createElement("div");
      const caminho1c = document.createElement("div");
      const caminho2 = document.createElement("div");
      caminho1.setAttribute(
        "style",
        'background-image: url("assets/cenas/Cena_37/Seta_01_Correta.png");',
      );
      caminho1b.setAttribute(
        "style",
        'background-image: url("assets/cenas/Cena_37/Seta_02_Correta.png");',
      );
      caminho1c.setAttribute(
        "style",
        'background-image: url("assets/cenas/Cena_37/Seta_03_Correta.png");',
      );
      caminho2.setAttribute(
        "style",
        'background-image: url("assets/cenas/Cena_37/Seta_01_Errada.png");',
      );
      caminho1.classList.add("caminho");
      caminho1.classList.add("active");
      caminho1b.classList.add("caminho");
      caminho1b.classList.add("correto");
      caminho1c.classList.add("caminho");
      caminho1c.classList.add("correto");
      caminho2.classList.add("caminho");
      const btnCaminho1 = document.createElement("button");
      const btnCaminho1b = document.createElement("button");
      const btnCaminho1c = document.createElement("button");
      btnCaminho1.classList.add("correto");
      btnCaminho1b.classList.add("correto");
      btnCaminho1c.classList.add("correto");
      const btnCaminho2 = document.createElement("button");
      const btnCaminhoArray = [
        btnCaminho1,
        btnCaminho1b,
        btnCaminho1c,
        btnCaminho2,
      ];
      const feedbackNegativo = document.createElement("div");
      feedbackNegativo.classList.add("feedback-negativo");
      const feedbackAnaNegativoCaminho = document.createElement("img");
      const feedbackTextoNegativoCaminho = document.createElement("img");
      feedbackTextoNegativoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_37/Fala_FeedBackNegativo.png",
      );
      feedbackAnaNegativoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_37/Personagem_Ana.png",
      );
      feedbackNegativo.appendChild(feedbackTextoNegativoCaminho);
      feedbackNegativo.appendChild(feedbackAnaNegativoCaminho);
      const feedbackPositivo = document.createElement("div");
      feedbackPositivo.classList.add("feedback-positivo");
      const feedbackAnaPositivoCaminho = document.createElement("img");
      const feedbackTextoPositivoCaminho = document.createElement("img");
      feedbackTextoPositivoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_37/Fala_Ana.png",
      );
      feedbackAnaPositivoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_37/Personagem_Ana.png",
      );
      feedbackPositivo.appendChild(feedbackTextoPositivoCaminho);
      feedbackPositivo.appendChild(feedbackAnaPositivoCaminho);

      const btnFecharNegativo = document.createElement("button");
      btnFecharNegativo.innerText = "Fechar";
      btnFecharNegativo.classList.add("btn");
      btnFecharNegativo.addEventListener("click", function () {
        $(this).parents(".feedback-negativo").fadeOut();
      });

      feedbackNegativo.appendChild(btnFecharNegativo);

      btnCaminhoArray.forEach((element) => {
        element.classList.add("btn-caminho");
        element.addEventListener("click", function () {
          if (this.classList.contains("correto")) {
            const nextGrupo = $(".cena.active .personagens .active").next();
            const nextBtn = $(element).next();
            const nextCaminho = $(
              ".cena.active .interativo .caminho.active",
            ).next();
            $(".cena.active .personagens .active").fadeOut();
            $(".cena.active .personagens .active").addClass("hidden");
            $(".cena.active .personagens .active").removeClass("active");
            $(element).fadeOut();
            element.classList.add("clicado");
            $(nextGrupo).addClass("active");
            $(nextGrupo).fadeIn();
            $(nextBtn).fadeIn();
            $(".cena.active .interativo .caminho.active").removeClass("active");
            $(nextCaminho).fadeIn();
            $(nextCaminho).addClass("active");

            if ($(".btn-caminho.clicado").length == 3) {
              $(".cena.active .feedback-positivo").fadeIn();
              $(".btn-next").removeClass("disabled");
              $(".caminho.active:not(.correto)").fadeOut();
              $(".btn-caminho:not(.correto)").fadeOut();
            }
          } else {
            $(feedbackNegativo).fadeIn();
          }
        });
      });

      const grupo1 = document.createElement("img");
      grupo1.setAttribute("src", "assets/cenas/Cena_37/grupo_01.png");
      const grupo2 = document.createElement("img");
      grupo2.setAttribute("src", "assets/cenas/Cena_37/grupo_02.png");
      const grupo3 = document.createElement("img");
      grupo3.setAttribute("src", "assets/cenas/Cena_37/grupo_03.png");
      const grupo4 = document.createElement("img");
      grupo4.setAttribute("src", "assets/cenas/Cena_37/grupo_04.png");
      grupo1.classList.add("grupo-1");
      grupo2.classList.add("grupo-2");
      grupo3.classList.add("grupo-3");
      grupo4.classList.add("grupo-4");
      const grupoArray = [grupo1, grupo2, grupo3, grupo4];
      grupoArray.forEach((element) => {
        cenasArray[i].children[1].appendChild(element);
      });
      cenasArray[i].children[3].appendChild(feedbackNegativo);
      cenasArray[i].children[3].appendChild(feedbackPositivo);
      cenasArray[i].children[3].appendChild(caminho1);
      cenasArray[i].children[3].appendChild(caminho1b);
      cenasArray[i].children[3].appendChild(caminho1c);
      cenasArray[i].children[3].appendChild(caminho2);
      cenasArray[i].children[3].appendChild(btnCaminho1);
      cenasArray[i].children[3].appendChild(btnCaminho1b);
      cenasArray[i].children[3].appendChild(btnCaminho1c);
      cenasArray[i].children[3].appendChild(btnCaminho2);

      $(feedbackNegativo).hide();
      $(feedbackPositivo).hide();
      $(caminho1b).hide();
      $(caminho1c).hide();
      $(btnCaminho1b).hide();
      $(btnCaminho1c).hide();
    }

    if (json.cenas[i].cenaInterativa == 8) {
      element.setAttribute("data-cenainterativa", "8");

      const ponto1 = document.createElement("img");
      const ponto2 = document.createElement("img");
      const ponto3 = document.createElement("img");
      ponto1.setAttribute("src", "assets/cenas/Cena_39/X_01.png");
      ponto2.setAttribute("src", "assets/cenas/Cena_39/X_02.png");
      ponto3.setAttribute("src", "assets/cenas/Cena_39/X_03.png");

      const botaoPonto1 = document.createElement("button");
      botaoPonto1.classList.add("correto");
      const botaoPonto2 = document.createElement("button");
      const botaoPonto3 = document.createElement("button");
      const botaoPontoArray = [botaoPonto1, botaoPonto2, botaoPonto3];
      const imgArray = [ponto1, ponto2, ponto3];

      const feedbackNegativo = document.createElement("div");
      feedbackNegativo.classList.add("feedback-negativo");
      const feedbackAnaNegativoCaminho = document.createElement("img");
      const feedbackTextoNegativoCaminho = document.createElement("img");
      feedbackTextoNegativoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_39/Fala_Feedback_Negativo.png",
      );
      feedbackAnaNegativoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_39/Ana.png",
      );
      feedbackNegativo.appendChild(feedbackTextoNegativoCaminho);
      feedbackNegativo.appendChild(feedbackAnaNegativoCaminho);
      const feedbackPositivo = document.createElement("div");
      feedbackPositivo.classList.add("feedback-positivo");
      const feedbackAnaPositivoCaminho = document.createElement("img");
      const feedbackTextoPositivoCaminho = document.createElement("img");
      feedbackTextoPositivoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_39/Fala_FeedBack.png",
      );
      feedbackAnaPositivoCaminho.setAttribute(
        "src",
        "assets/cenas/Cena_39/Ana.png",
      );
      feedbackPositivo.appendChild(feedbackTextoPositivoCaminho);
      feedbackPositivo.appendChild(feedbackAnaPositivoCaminho);

      const anaPosicionada = document.createElement("img");
      anaPosicionada.setAttribute("src", "assets/cenas/Cena_39/Ana_01.png");

      const btnFecharNegativo = document.createElement("button");
      btnFecharNegativo.innerText = "Fechar";
      btnFecharNegativo.classList.add("btn");
      btnFecharNegativo.addEventListener("click", function () {
        $(this).parents(".feedback-negativo").fadeOut();
      });

      feedbackNegativo.appendChild(btnFecharNegativo);

      imgArray.forEach((element) => {
        cenasArray[i].children[3].appendChild(element);
      });

      botaoPontoArray.forEach((element) => {
        element.classList.add("botao-posicao-guia");
        cenasArray[i].children[3].appendChild(element);

        element.addEventListener("click", function () {
          if (element.classList.contains("correto")) {
            $(feedbackPositivo).fadeIn();
            $(anaPosicionada).fadeIn();
            $(".btn-next").removeClass("disabled");
          } else {
            $(feedbackNegativo).fadeIn();
          }
        });
      });

      cenasArray[i].children[3].appendChild(feedbackNegativo);
      cenasArray[i].children[3].appendChild(feedbackPositivo);
      cenasArray[i].children[3].appendChild(anaPosicionada);
      $(anaPosicionada).hide();
      $(feedbackNegativo).hide();
      $(feedbackPositivo).hide();
    }

    if (json.cenas[i].cenaInterativa == 9) {
      element.setAttribute("data-cenainterativa", "9");
    }

    if (json.cenas[i].cenaInterativa == 10) {
      element.setAttribute("data-cenainterativa", "10");

      const containerExercicio = document.createElement("div");
      const containerBtns = document.createElement("div");
      const containerDialogo = document.createElement("div");
      containerBtns.classList.add("container-dialogo-buttons");
      containerDialogo.classList.add("container-dialogo");
      containerExercicio.classList.add("container-exercicio-ordem-infos");
      const containerExercicioInstrucao = document.createElement("p");
      containerExercicioInstrucao.innerText =
        "Ajude a selecionar as informações que devem ser transmitidas ao grupo, na ordem correta. Clique ou toque nas informações na ordem em que elas devem ser passadas ao grupo.";

      const feedbackNegativo = document.createElement("img");
      feedbackNegativo.setAttribute(
        "src",
        "assets/cenas/Cena_45_46_47_48/Ana_Feedback_Negativo.png",
      );
      feedbackNegativo.classList.add("feedback-negativo");
      cenasArray[i].children[3].appendChild(feedbackNegativo);
      $(feedbackNegativo).hide();

      const fraseBotao1 = document.createElement("button");
      const fraseBotao2 = document.createElement("button");
      const fraseBotao3 = document.createElement("button");
      const fraseBotao4 = document.createElement("button");
      const fraseBotao5 = document.createElement("button");
      const fraseBotaoArray = [
        fraseBotao1,
        fraseBotao2,
        fraseBotao3,
        fraseBotao4,
        fraseBotao5,
      ];
      fraseBotao1.innerText =
        "Chegamos ao Museu Histórico! Esse Museu foi fundado em 1954, e revela através de seu acervo a histórias da cidade. Aqui vocês vão encontrar uma artefatos indígenas, móveis do período colonial, e artigos pessoais de figuras importantes, como o fundador da cidade Antônio Mendes de Sá.";
      fraseBotao2.innerText =
        "Nossa visita terá duração de 1h. Antes de iniciar, caso desejem ir ao banheiro, eles estão ao fundo do corredor a esquerda.";
      fraseBotao3.innerText = "Espero todos aqui, começamos in 15min.";
      fraseBotao4.innerText =
        "Vamos começar? Esse é o Pedro, monitor do Museu que irá conduzir a visita.";
      fraseBotao5.innerText =
        "Caso, alguém não deseje acompanhar, deve encontrar o grupo em 1h, ou seja, às 16h na entrada do Museu.";

      for (let p = 0; p < fraseBotaoArray.length; p++) {
        const element = fraseBotaoArray[p];

        element.classList.add("opcao-frase");
        element.classList.add(`opcao-${p}`);
        containerBtns.appendChild(element);

        element.addEventListener("click", function () {
          if ($(".container-dialogo").children().length == p) {
            console.log("frase correta");
            console.log(p);
            $(".cena.active .container-dialogo").append($(this));
          } else {
            element.classList.add("errada");
            console.log("tocar audio de feedback...");
            $(".cena.active .feedback-negativo").fadeIn();
            setTimeout(() => {
              $(".cena.active .feedback-negativo").fadeOut();
              element.classList.remove("errada");
            }, 2000);
          }
          if ($(".cena.active .container-dialogo").children().length == 4) {
            $(".btn-next").removeClass("disabled");
          }
        });
      }

      containerExercicio.appendChild(containerExercicioInstrucao);
      containerExercicio.appendChild(containerBtns);
      cenasArray[i].children[3].appendChild(containerExercicio);
      cenasArray[i].children[3].appendChild(containerDialogo);
    }

    if (json.cenas[i].cenaInterativa == 11) {
      element.setAttribute("data-cenainterativa", "11");

      const imagem1 = document.createElement("img");
      const imagem2 = document.createElement("img");
      const imagem3 = document.createElement("img");
      const imagem4 = document.createElement("img");
      const imagem5 = document.createElement("img");
      imagem1.setAttribute("src", "assets/cenas/Cena_51/bigua.png");
      imagem2.setAttribute("src", "assets/cenas/Cena_51/capivara.png");
      imagem3.setAttribute("src", "assets/cenas/Cena_51/cidade.png");
      imagem4.setAttribute("src", "assets/cenas/Cena_51/lago.png");
      imagem5.setAttribute("src", "assets/cenas/Cena_51/vegetacao.png");
      const imagemArray = [imagem1, imagem2, imagem3, imagem4, imagem5];

      imagemArray.forEach((element) => {
        cenasArray[i].children[3].appendChild(element);
      });
    }

    // monta cena de seleçao de capitulos
    if (json.cenas[i].selecaoCapitulos == true) {
      element.setAttribute("data-selecao_capitulos", true);

      const seletorContainer = document.createElement("div");
      seletorContainer.className = "seletores-container";
      const seletores = [
        "Etapa 1 <br> Pré-viagem",
        "Etapa 2 <br> Conferência dos documentos do veículo",
        "Etapa 3 <br> Conferência do veículo",
        "Etapa 4 <br> Embarque dos passageiros",
        "Etapa 5 <br> Chegada na cidade",
        "Etapa 6 <br> Condução do grupo",
        "Etapa 7 <br> Apresentação do atrativo",
        "Etapa 8 <br> Gestão de tempo",
        "Etapa 9 <br>Passeio de barco",
      ];
      seletores.forEach(function (element) {
        const botao = document.createElement("button");
        botao.className = "seletor-capitulo";
        botao.innerHTML = element;
        seletorContainer.appendChild(botao);
      });

      const textoEtapas = document.createElement("p");

      if (i == 1) {
        textoEtapas.innerText =
          'Clique em "Avançar" para continuar, ou selecione uma das etapas da viagem:';
      } else {
        textoEtapas.innerText =
          'Você finalizou mais uma etapa! Clique em "Avançar" para continuar, ou selecione uma das etapas da viagem:';
      }
      cenasArray[i].children[2].appendChild(textoEtapas);
      $(textoEtapas).hide();
      //seta as cenas que devem ser carregadas
      seletorContainer.children[0].dataset.nrcena = 3;
      seletorContainer.children[1].dataset.nrcena = 8;
      seletorContainer.children[2].dataset.nrcena = 14;
      seletorContainer.children[3].dataset.nrcena = 18;
      seletorContainer.children[4].dataset.nrcena = 23;
      seletorContainer.children[5].dataset.nrcena = 28;
      seletorContainer.children[6].dataset.nrcena = 32;
      seletorContainer.children[7].dataset.nrcena = 34;
      seletorContainer.children[8].dataset.nrcena = 39;

      cenasArray[i].children[3].appendChild(seletorContainer);
    }

    for (let j = 0; j < json.cenas[i].personagens.length; j++) {
      if (json.cenas[i].personagens.length > 0) {
        const personagem = document.createElement("img");
        personagem.src = `assets/cenas/${json.cenas[i].pasta}/${json.cenas[i].personagens[j]}`;
        personagem.classList.add("hidden");
        cenasArray[i].children[1].appendChild(personagem);
      }
    }

    for (let j = 0; j < json.cenas[i].texto.length; j++) {
      const balao = document.createElement("img");
      balao.src = `assets/cenas/${json.cenas[i].pasta}/${json.cenas[i].texto[j]}`;
      balao.classList.add("hidden");
      cenasArray[i].children[2].appendChild(balao);
    }

    const link = linksArray[i];
    $(link).click(function () {
      resetCena($(".cena.active")[0]);
      $(".cena.active").fadeOut();
      $(".cena.active").removeClass("active");

      $($(".cena")[i]).addClass("active");
      $($(".cena")[i]).fadeIn();

      $(".nav-item.active").removeClass("active");
      $(this).addClass("active");
      $(this).addClass("visited");

      if (
        $(".cena.active").prev(".cena").length > 0 &&
        $(".btn-prev").hasClass("disabled")
      ) {
        $(".btn-prev").removeClass("disabled");
      }

      if ($(".cena.active").prev(".cena").length == 0) {
        $(".btn-prev").addClass("disabled");
      }

      cenaAtivada($(".cena.active")[0]);
      sincIndice();
    });
  }

  $(".cena").hide();
  $($(".cena")[0]).fadeIn();
  $($(".cena")[0]).addClass("active");
  $($(".nav-item")[0]).addClass("active");
  $($(".nav-item")[0]).addClass("visited");
  $(".btn-prev").addClass("disabled");

  $(".seletores-container").hide();

  $(".btn-fullscreen").click(function () {
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  });

  $(".btn-prev").click(function () {
    resetCena($(".cena.active")[0]);

    // APLICAR APENAS EM .CENAS E NAO HQ-UI
    const telaAnterior = $(".cena.active").prev(".cena");
    $(telaAnterior).fadeIn();
    $(".cena.active").fadeOut();
    $(".cena.active").removeClass("active");
    $(telaAnterior).addClass("active");

    setTimeout(() => {
      cenaAtivada($(".cena.active")[0]);
      sincIndice();
    }, 1000);

    if ($(".cena.active").prev(".cena").length == 0) {
      $(".btn-prev").addClass("disabled");
    }
  });

  $(".btn-next").click(function () {
    // APLICAR APENAS EM .CENAS E NAO HQ-UI
    // $(this).addClass('disabled');
    if ($(".btn-prev").hasClass("disabled")) {
      $(".btn-prev").removeClass("disabled");
    }

    if ($(".cena.active").attr("data-cenainterativa") == "5") {
      if (giseleFalasFinaisAtivas) {
        avancarFalasFinais();
        return;
      }
      if (!giseleFalasFinaisJogadas) {
        startGiseleFalasFinais();
        return;
      }
    }

    if ($(".cena.active .texto img.hidden").length > 0) {
      carregaTexto();
    } else if ($(".cena.active").next().length > 0) {
      resetCena($(".cena.active")[0]);

      const proxTela = $(".cena.active").next(".cena");
      $(".cena.active").fadeOut();
      $(".cena.active").removeClass("active");
      $(proxTela).fadeIn();
      $(proxTela).addClass("active");
      setTimeout(() => {
        cenaAtivada($(".cena.active")[0]);
        sincIndice();
      }, 500);
    } else if ($(".cena.active").next().length == 0) {
      //MOSTRA MODAL
      $(".cena:last-of-type .content").fadeIn();
      $(".btn-next").addClass("disabled");
    }
  });

  $(".tooltip-btn").click(function () {
    stopCurrentTooltipAudio();
    $(".hq-tooltip").fadeOut();

    const tooltip = $(this).next(".hq-tooltip");
    tooltip.fadeIn();
    $(this).addClass("visited");

    // Automatically trigger audio playback if the tooltip contains a play/pause button
    const playPauseBtn = tooltip.find(".btn-play-pause");
    if (playPauseBtn.length > 0) {
      playPauseBtn.click();
    }

    // Checa se ja abriu todos na pagina
    if (
      $(".cena.active .visited").length ==
      $(".cena.active .interativo .tooltip-btn").length &&
      $(".btn-next").hasClass("disabled")
    ) {
      setTimeout(() => {
        $(".btn-next").removeClass("disabled");
        carregaTexto();

        const modalSaida = $(".cena.active").attr("data-modal-saida");
        if (modalSaida) {
          const modalEl = document.querySelector(modalSaida);
          if (modalEl) {
            if (typeof $(modalSaida).modal === "function") {
              $(modalSaida).modal("show");
            } else if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
              const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
              modalInstance.show();
            }
          }
        }
      }, 1000);
    }
  });

  $(".btn-tooltip-close").click(function () {
    stopCurrentTooltipAudio();
    $(this).parent().fadeOut();
  });

  $(".cena .texto img").fadeOut();
  $(".cena .personagens img").fadeOut();
  $(".cena .personagens img").addClass("hidden");
  $(".cena .personagens img").removeClass("active");

  $(".btn-iniciar").click(function () {
    $(".tela-iniciar").fadeOut();
    $(".hq-ui footer").fadeIn();
    setTimeout(() => {
      carregaTexto();
    }, 500);
  });

  $(".hq-tooltip").hide();

  const modalFinal = document.createElement("div");
  modalFinal.classList.add("content");
  const pFinal = document.createElement("p");
  pFinal.innerText =
    "Parabéns! Você chegou ao final da viagem. Clique no botão abaixo para reiniciar.";
  const btnFinal = document.createElement("button");
  btnFinal.innerText = "Reiniciar";
  btnFinal.classList.add("btn");
  modalFinal.appendChild(pFinal);
  modalFinal.appendChild(btnFinal);
  document.querySelector(".cena:last-of-type").appendChild(modalFinal);
  $(".cena:last-of-type .content").hide();

  //reseta e reinicia
  $(".cena:last-of-type .content button").click(function () {
    resetCenaInterativa5();
    resetCenaInterativa6();
    resetCenaInterativa7();
    resetCenaInterativa8();
    resetCenaInterativa10();
    $(".tooltip-btn.visited").removeClass("visited");
    $(".texto img").hide();
    $(".texto img").addClass("hidden");
    $(".texto img").removeClass("active");
    $(".personagens img").hide();
    $(".personagens img").addClass("hidden");
    $(".personagens img").removeClass("active");
    $(".cena.active").fadeOut();
    $(".cena.active").removeClass("active");

    $($(".cena")[0]).addClass("active");
    $($(".cena")[0]).fadeIn();
    $(".nav-item.active").removeClass("active");

    $(".cena:last-of-type .content").hide();
    sincIndice();

    $(".btn-prev").addClass("disabled");
    $(".btn-next").removeClass("disabled");
    carregaTexto();
  });

  $(".hq-ui footer").hide();

  $(".seletor-capitulo").click(function () {
    resetCena($(".cena.active")[0]);

    //carrega primeira cena do capitulo
    const proxTela = `${this.dataset.nrcena}`
      ? $(`.cena:nth-of-type(${this.dataset.nrcena})`)
      : null;
    if (proxTela) {
      $(".cena.active").fadeOut();
      $(".cena.active").removeClass("active");
      $(proxTela).fadeIn();
      $(proxTela).addClass("active");
      setTimeout(() => {
        cenaAtivada($(".cena.active")[0]);
        sincIndice();
      }, 500);
    }
  });
}

// pega dados do arquivo json
fetch("assets/js/config.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("error loading js/config.json");
    }
    return response.json();
  })
  .then((data) => {
    jsonData = data;
    carregarCenas(jsonData);
  });

function carregaTexto() {
  if (document.querySelector(".cena.active").dataset.monotexto == "true") {
    //desabilita btn next caso nao tenha aberto todos os tooltips
    if (
      $(".cena.active .interativo .visited").length <
      $(".cena.active .interativo .tooltip-btn").length
    ) {
      $(".btn-next").addClass("disabled");
    } else {
      if ($(".cena.active .texto img.hidden").length > 0) {
        $(".cena.active .texto img:not(.hidden)").fadeOut();
        $($(".cena.active .texto img.hidden")[0]).fadeIn();
        $($(".cena.active .texto img.hidden")[0]).removeClass("hidden");
      }
      if ($(".cena.active .personagens img.active").length < 2) {
        $($(".cena.active .personagens img.hidden")[0]).fadeIn();
        $($(".cena.active .personagens img.hidden")[0]).addClass("active");
        $($(".cena.active .personagens img.hidden")[0]).removeClass("hidden");
        if (
          document.querySelector(".cena.active").dataset.personagem_unico ==
          "true" &&
          $(".cena.active .personagens img.active").length == 2
        ) {
          $($(".cena.active .personagens img.active")[0]).hide();
        }
      } else if (
        $(".cena.active .personagens img.active").length == 2 &&
        $(".cena.active .personagens img.active:last").next().length > 0
      ) {
        $($(".cena.active .personagens img.active")[0]).fadeOut();
        $($(".cena.active .personagens img.active")[0]).removeClass("active");

        $($(".cena.active .personagens img.hidden")[0]).fadeIn();
        $($(".cena.active .personagens img.hidden")[0]).addClass("active");
        $($(".cena.active .personagens img.hidden")[0]).removeClass("hidden");
      }
    }
  } else {
    if ($(".cena.active .texto img.hidden").length > 0) {
      $($(".cena.active .texto img.hidden")[0]).fadeIn();
      $($(".cena.active .texto img.hidden")[0]).removeClass("hidden");
    }
    if ($('.cena.active .texto p[style="display: none;"]').length > 0) {
      $($('.cena.active .texto p[style="display: none;"]')[0]).fadeIn();
    }
    if ($(".cena.active .personagens img.hidden").length > 0) {
      $($(".cena.active .personagens img.hidden")[0]).fadeIn();
      $($(".cena.active .personagens img.hidden")[0]).addClass("active");
      $($(".cena.active .personagens img.hidden")[0]).removeClass("hidden");
    }

    if (
      $('.cena.active .interativo div[style="display: none;"').length > 0 &&
      $(".cena.active")[0].dataset.cenainterativa == undefined
    ) {
      $('.cena.active .interativo div[style="display: none;"').fadeIn();
    }

    if ($(".cena.active").hasClass("cena-zap")) {
      if ($($(".cena-zap .texto")[0]).children(".hidden").length == 2) {
        $(".cena-zap .texto img:nth-of-type(2)").css("top", 300);
      }
      if ($($(".cena-zap .texto")[0]).children(".hidden").length == 1) {
        $(".cena-zap .texto img:nth-of-type(2)").css("top", 130);
        $(".cena-zap .texto img:nth-of-type(3)").css("top", 130);
      }
      if ($($(".cena-zap .texto")[0]).children(".hidden").length == 0) {
        $(".cena-zap .texto img:nth-of-type(2)").css("top", -75);
        $(".cena-zap .texto img:nth-of-type(3)").css("top", -90);
        $(".cena-zap .texto img:nth-of-type(4)").css("top", -90);
      }
    }
  }
}

function sincIndice() {
  const a = document.querySelectorAll(".cena");
  $(".nav-item.active").removeClass("active");
  for (let i = 0; i < a.length; i++) {
    if ($(a[i]).hasClass("active")) {
      $($(".nav-item")[i]).addClass("active");
      $($(".nav-item")[i]).addClass("visited");
      const progressWidth = ((i + 1) / jsonData.qtdCenas) * 100;
      $(".progress").width(`${progressWidth}%`);
    }
  }
}

function resetCenaInterativa6() {
  const cena6 = $(".cena[data-cenainterativa='6']");
  if (cena6.length > 0) {
    const backgroundEl = cena6.find(".background")[0];
    if (backgroundEl) {
      backgroundEl.setAttribute(
        "style",
        'background: url("assets/cenas/Cena_31/Fundo.png");',
      );
    }
    cena6.find(".marcacao-x").show().css("opacity", "");
    cena6
      .find(".interativo > button:not(.btn)")
      .show()
      .css("opacity", "")
      .removeClass("clicado");
    cena6.find(".feedback").hide().css("opacity", "");
    cena6.find(".feedback-ana").hide().css("opacity", "");
    cena6.find(".feedback-positivo").hide().css("opacity", "");
    cena6.find(".feedback-negativo").hide().css("opacity", "");
  }
}

function resetCenaInterativa7() {
  const cena7 = $(".cena[data-cenainterativa='7']");
  if (cena7.length > 0) {
    cena7
      .find(".personagens img")
      .hide()
      .css("opacity", "")
      .addClass("hidden")
      .removeClass("active");

    const caminhos = cena7.find(".caminho");
    if (caminhos.length >= 4) {
      caminhos.removeClass("active");
      $(caminhos[0]).show().css("opacity", "").addClass("active");
      $(caminhos[1]).hide().css("opacity", "");
      $(caminhos[2]).hide().css("opacity", "");
      $(caminhos[3]).show().css("opacity", "");
    }

    const botoes = cena7.find(".btn-caminho");
    if (botoes.length >= 4) {
      botoes.removeClass("clicado");
      $(botoes[0]).show().css("opacity", "");
      $(botoes[1]).hide().css("opacity", "");
      $(botoes[2]).hide().css("opacity", "");
      $(botoes[3]).show().css("opacity", "");
    }

    cena7.find(".feedback-negativo").hide().css("opacity", "");
    cena7.find(".feedback-positivo").hide().css("opacity", "");
  }
}

function resetCenaInterativa8() {
  const cena8 = $(".cena[data-cenainterativa='8']");
  if (cena8.length > 0) {
    cena8.find("img[src*='Ana_01.png']").hide().css("opacity", "");
    cena8.find(".feedback-negativo").hide().css("opacity", "");
    cena8.find(".feedback-positivo").hide().css("opacity", "");
  }
}

function resetCenaInterativa10() {
  const cena10 = $(".cena[data-cenainterativa='10']");
  if (cena10.length > 0) {
    const btnContainer = cena10.find(".container-dialogo-buttons");
    if (btnContainer.length > 0) {
      for (let p = 0; p < 5; p++) {
        const btn = cena10.find(`.opcao-${p}`);
        if (btn.length > 0) {
          btn.removeClass("errada").css("opacity", "");
          btnContainer.append(btn);
        }
      }
    }
    cena10.find(".feedback-negativo").hide().css("opacity", "");
  }
}

function resetCenaInterativa5() {
  giseleCorrigida = false;
  giseleFalasFinaisJogadas = false;
  giseleFalasFinaisAtivas = false;

  const cena5 = $(".cena[data-cenainterativa='5']");
  if (cena5.length > 0) {
    const newRow = cena5.find(".nova-linha-gisele");
    if (newRow.length > 0) {
      newRow.removeClass("nova-linha-gisele").html("<td></td><td></td><td></td><td></td>");
    }

    const oldRow = cena5.find(".linha-gisele-antiga");
    if (oldRow.length > 0) {
      oldRow.removeClass("linha-gisele-antiga");

      const tdCpfErrado = oldRow.find(".cpf-errado");
      tdCpfErrado.removeClass("cpf-errado");

      const buttonGisele = oldRow.find("button");
      buttonGisele.removeAttr("disabled");
      buttonGisele.css("pointer-events", "");
      buttonGisele.css("text-decoration", "");
      buttonGisele.addClass("btn-passageiro");
      buttonGisele.removeClass("checado");

      const checkIcon = oldRow.find(".check-icon");
      checkIcon.show().css("display", "");
    }

    cena5.find(".btn-passageiro").removeClass("checado");
    cena5.find(".ana-feedback-overlay").hide();
    $("nav.controls").show();
  }
}

function resetCenaInterativa1() {
  const cena1 = $(".cena[data-cenainterativa='1']");
  if (cena1.length > 0) {
    cena1.find(".docs-list-1 button").removeClass("checado");
  }
}

function resetCenaInterativa2() {
  const cenaZap = $(".cena-zap");
  if (cenaZap.length > 0) {
    cenaZap.find(".texto").children().css("top", "");
    cenaZap.find(".texto").children().addClass("hidden");
    cenaZap.find(".texto").children().hide();
  }
}

function resetCenaInterativa3() {
  const cena3 = $(".cena[data-cenainterativa='3']");
  if (cena3.length > 0) {
    cena3.find(".docs-list button").removeClass("checado");
    cena3.find(".modal-documentos").hide();
    cena3.find(".modais-container").hide();
  }
}

function resetCenaInterativa4() {
  const cena4 = $(".cena[data-cenainterativa='4']");
  if (cena4.length > 0) {
    cena4.find(".cinto-bg").show();
    cena4.find(".lixo-bg").show();
    cena4.find(".microfone-bg").show();
    cena4.find(".wc-bg").show();
    cena4.find(".bordo-bg").attr("src", "assets/cenas/Cena_18/Servico_de_bordo_Bagunca.png");
  }
}

function resetCena(cena) {
  if (!cena) return;
  stopCurrentTooltipAudio();
  const cenaInt = $(cena).attr("data-cenainterativa");
  if (!cenaInt) {
    if ($(cena).attr("data-monotexto") == "true") {
      $(cena).find(".tooltip-btn").removeClass("visited");
      $(cena).find(".hq-tooltip").hide();
    }
    return;
  }

  switch (cenaInt) {
    case "1":
      resetCenaInterativa1();
      break;
    case "2":
      resetCenaInterativa2();
      break;
    case "3":
      resetCenaInterativa3();
      break;
    case "4":
      resetCenaInterativa4();
      break;
    case "5":
      resetCenaInterativa5();
      break;
    case "6":
      resetCenaInterativa6();
      break;
    case "7":
      resetCenaInterativa7();
      break;
    case "8":
      resetCenaInterativa8();
      break;
    case "10":
      resetCenaInterativa10();
      break;
  }

  if ($(cena).attr("data-monotexto") == "true") {
    $(cena).find(".tooltip-btn").removeClass("visited");
    $(cena).find(".hq-tooltip").hide();
  }
}

function cenaAtivada(cena) {
  if (!cena) return;

  resetCena(cena);

  const cenaInt = $(cena).attr("data-cenainterativa");
  if (cenaInt !== undefined && cenaInt !== "" && cenaInt !== "2") {
    $(".btn-next").addClass("disabled");
  } else {
    $(".btn-next").removeClass("disabled");
  }

  $(cena).find(".texto img").hide().addClass("hidden");
  $(cena).find(".personagens img").hide().addClass("hidden").removeClass("active");
  carregaTexto();
}

// (X / Y) * 100 = P%

// Função para fechar o menu hambúrguer de seleção de cenas
function fecharMenuCenas() {
  const menuEl = document.getElementById("navbarSupportedContent");
  if (menuEl && menuEl.classList.contains("show")) {
    if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(menuEl);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    } else {
      menuEl.classList.remove("show");
    }
  }
}

// Evento para fechar o menu ao clicar em uma cena (nav-item)
$(document).on("click", ".navbar-collapse .nav-item", function () {
  fecharMenuCenas();
});

// Evento para fechar o menu ao apertar a tecla ESC (Escape)
$(document).on("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    fecharMenuCenas();
  }
});

// Evento para fechar o menu ao clicar fora dele e do botão hambúrguer
$(document).on("click", function (e) {
  const menuEl = $("#navbarSupportedContent");
  const toggler = $(".navbar-toggler");
  if (menuEl.length && menuEl.hasClass("show")) {
    // Se o clique não foi no menu, nem dentro dele, e não foi no toggler, nem dentro dele
    if (!menuEl.is(e.target) && menuEl.has(e.target).length === 0 &&
        !toggler.is(e.target) && toggler.has(e.target).length === 0) {
      fecharMenuCenas();
    }
  }
});
