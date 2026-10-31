# Hamburgada

Página de prestação de contas de 31/10/2026, Pix por família e controle manual de pagamentos.

- Total: R$ 1.205,02 / 34 pessoas. Crianças até 6 anos não contabilizadas.
- Rateio em centavos pelo método dos maiores restos. Desempate pela ordem original das famílias.
- R$ 280,00 de salão abatidos da família Josi. Saldo da Josi: R$ 3,53.
- Pix das sete outras famílias para a recebedora: R$ 783,25. A cota de Gutiara é R$ 141,77.
- Os QR Codes têm chave, valor e identificador específico por família; são estáticos.
- Marcação manual no localStorage do navegador. Não há sincronização nem confirmação bancária.
- Backup e restauração em JSON; exportação CSV. Nenhum segredo de acesso é utilizado.

## Publicação

GitHub Pages, pasta `dist`, com o workflow `.github/workflows/pages.yml`.

## Uso

Abra a página e selecione uma família. “Copiar Pix com valor” copia o payload completo; “Copiar chave Pix” copia apenas o CPF. “Link da família” copia uma URL que exibe somente o cartão escolhido. A impressão inclui todos os cartões, um por página, mesmo quando há filtro ativo.

No controle, a organização confere o banco e marca os pagamentos. As marcas só existem no aparelho e navegador em que foram feitas. Faça backup em “Salvar controle”.

Padrão dos códigos: [Manual de Padrões para Iniciação do Pix, Banco Central](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf).
