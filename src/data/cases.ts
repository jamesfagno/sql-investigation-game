import { OPERATIONS } from "@/data/operations";
import type { CaseTable, Difficulty, GameCase } from "@/lib/types";

const names = [
  "Mara Viana",
  "Caio Torres",
  "Lia Nascimento",
  "Bento Luz",
  "Nina Prado",
  "Ravi Moura",
  "Cora Sales",
  "Davi Paes",
];

const districts = ["Centro", "Porto", "Aurora", "Mercado"];
const roles = ["Analista", "Piloto", "Técnica", "Mensageiro"];
const events = ["acesso", "transferencia", "chamada", "entrega"];
const locations = ["Estacao", "Arquivo", "Hangar", "Terminal"];
const caseNouns = [
  "A Credencial Fantasma",
  "O Pacote sem Remetente",
  "A Frequência Interrompida",
  "O Cofre de Vidro",
  "A Rota Impossível",
  "O Sinal da Aurora",
  "A Testemunha Ausente",
  "O Relógio Parado",
  "A Chave Duplicada",
  "O Arquivo Cinza",
];

const rotate = <T,>(items: T[], offset: number) =>
  items.map((_, index) => items[(index + offset) % items.length]);

function createTables(seed: number): CaseTable[] {
  const shiftedNames = rotate(names, seed % names.length);
  const shiftedDistricts = rotate(districts, seed % districts.length);
  const shiftedRoles = rotate(roles, (seed * 3) % roles.length);

  const agents = shiftedNames.map((name, index) => ({
    id: index + 1,
    nome: name,
    distrito: shiftedDistricts[index % shiftedDistricts.length],
    cargo: shiftedRoles[index % shiftedRoles.length],
    nivel_acesso: ((index * 2 + seed) % 5) + 1,
    ativo: (index + seed) % 3 === 0 ? "nao" : "sim",
  }));

  const records = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    agente_id: ((index * 3 + seed) % agents.length) + 1,
    evento: events[(index + seed) % events.length],
    local: locations[(index * 2 + seed) % locations.length],
    valor: 80 + ((index * 137 + seed * 41) % 920),
    horario: `${String(8 + (index % 12)).padStart(2, "0")}:${index % 2 ? "45" : "15"}`,
  }));

  return [
    {
      name: "agentes",
      label: "Agentes monitorados",
      description: "Cadastro interno de pessoas ligadas à investigação.",
      columns: [
        { name: "id", type: "INTEGER", description: "Identificador único" },
        { name: "nome", type: "STRING", description: "Nome completo" },
        { name: "distrito", type: "STRING", description: "Distrito de atuação" },
        { name: "cargo", type: "STRING", description: "Função registrada" },
        { name: "nivel_acesso", type: "INTEGER", description: "Nível de 1 a 5" },
        { name: "ativo", type: "STRING", description: "sim ou nao" },
      ],
      rows: agents,
    },
    {
      name: "registros",
      label: "Registros de atividade",
      description: "Eventos captados pela central durante a janela da ocorrência.",
      columns: [
        { name: "id", type: "INTEGER", description: "Identificador único" },
        { name: "agente_id", type: "INTEGER", description: "Referência a agentes.id" },
        { name: "evento", type: "STRING", description: "Tipo de atividade" },
        { name: "local", type: "STRING", description: "Ponto de captura" },
        { name: "valor", type: "NUMBER", description: "Valor associado" },
        { name: "horario", type: "STRING", description: "Horário HH:MM" },
      ],
      rows: records,
    },
  ];
}

type CaseChallenge = Pick<
  GameCase,
  "objective" | "clue" | "hints" | "solution" | "starterQuery" | "requiresOrder"
>;

function challengeFor(operationIndex: number, variant: number, tables: CaseTable[]): CaseChallenge {
  const agents = tables[0].rows;
  const records = tables[1].rows;
  const district = String(agents[variant % agents.length].distrito);
  const role = String(agents[(variant + 2) % agents.length].cargo);
  const location = String(records[variant % records.length].local);
  const event = String(records[(variant + 1) % records.length].evento);

  const challenges: Array<Array<() => CaseChallenge>> = [
    [
      () => ({ objective: "Liste o nome e o cargo de todos os agentes.", clue: "O relatório só aceita as duas colunas pedidas.", hints: ["Comece com SELECT.", "Separe nome e cargo por vírgula.", "Os dados estão em agentes."], solution: "SELECT nome, cargo FROM agentes;", starterQuery: "SELECT\n  \nFROM agentes;" }),
      () => ({ objective: "Mostre apenas nome e distrito de todos os agentes.", clue: "Não exponha dados de acesso no relatório.", hints: ["Escolha colunas específicas.", "Use nome, distrito.", "Finalize com FROM agentes."], solution: "SELECT nome, distrito FROM agentes;", starterQuery: "SELECT nome\nFROM agentes;" }),
      () => ({ objective: "Recupere id, nome e nivel_acesso do cadastro de agentes.", clue: "A ordem das colunas importa para o protocolo.", hints: ["A tabela é agentes.", "Selecione três colunas.", "Use id, nome, nivel_acesso."], solution: "SELECT id, nome, nivel_acesso FROM agentes;", starterQuery: "SELECT * FROM agentes;" }),
      () => ({ objective: "Abra todos os campos da tabela registros.", clue: "Aqui o protocolo permite o curinga.", hints: ["O asterisco representa todas as colunas.", "A tabela é registros.", "Use SELECT * FROM registros."], solution: "SELECT * FROM registros;", starterQuery: "SELECT\nFROM registros;" }),
      () => ({ objective: "Liste evento, local e horario de todos os registros.", clue: "Os valores financeiros não devem aparecer.", hints: ["Use três colunas.", "Separe-as por vírgulas.", "Consulte registros."], solution: "SELECT evento, local, horario FROM registros;", starterQuery: "SELECT evento\nFROM registros;" }),
    ],
    [
      () => ({ objective: `Encontre agentes que atuam no distrito ${district}.`, clue: "Textos precisam estar entre aspas simples.", hints: ["Use WHERE após FROM.", "Compare a coluna distrito.", `Use distrito = '${district}'.`], solution: `SELECT nome, distrito FROM agentes WHERE distrito = '${district}';`, starterQuery: "SELECT nome, distrito\nFROM agentes\nWHERE " }),
      () => ({ objective: `Liste agentes com o cargo ${role}.`, clue: "Filtre antes de entregar o relatório.", hints: ["A coluna é cargo.", "Use o operador =.", `Compare cargo com '${role}'.`], solution: `SELECT nome, cargo FROM agentes WHERE cargo = '${role}';`, starterQuery: "SELECT nome, cargo\nFROM agentes\nWHERE cargo = " }),
      () => ({ objective: "Mostre os agentes com nivel_acesso maior ou igual a 4.", clue: "Credenciais 4 e 5 são consideradas elevadas.", hints: ["Use WHERE.", "O operador é >=.", "Compare nivel_acesso >= 4."], solution: "SELECT nome, nivel_acesso FROM agentes WHERE nivel_acesso >= 4;", starterQuery: "SELECT nome, nivel_acesso\nFROM agentes\nWHERE " }),
      () => ({ objective: "Localize todos os agentes inativos.", clue: "A coluna ativo armazena sim ou nao.", hints: ["Consulte a coluna ativo.", "Compare texto com aspas.", "Use ativo = 'nao'."], solution: "SELECT nome, ativo FROM agentes WHERE ativo = 'nao';", starterQuery: "SELECT nome, ativo\nFROM agentes\nWHERE ativo = " }),
      () => ({ objective: "Recupere registros cujo valor seja maior que 500.", clue: "Valores são numéricos e dispensam aspas.", hints: ["A tabela é registros.", "Use WHERE valor > 500.", "Mostre id, evento e valor."], solution: "SELECT id, evento, valor FROM registros WHERE valor > 500;", starterQuery: "SELECT id, evento, valor\nFROM registros\nWHERE " }),
    ],
    [
      () => ({ objective: "Mostre os três agentes com maior nivel_acesso.", clue: "Empates seguem a ordem interna do arquivo.", hints: ["Ordene com ORDER BY.", "Use DESC para os maiores primeiro.", "Limite com LIMIT 3."], solution: "SELECT nome, nivel_acesso FROM agentes ORDER BY nivel_acesso DESC LIMIT 3;", starterQuery: "SELECT nome, nivel_acesso\nFROM agentes\nORDER BY ", requiresOrder: true }),
      () => ({ objective: "Liste os quatro registros de maior valor.", clue: "A central quer somente o topo da lista.", hints: ["Ordene valor em ordem decrescente.", "Use DESC.", "Finalize com LIMIT 4."], solution: "SELECT id, evento, valor FROM registros ORDER BY valor DESC LIMIT 4;", starterQuery: "SELECT id, evento, valor\nFROM registros\nORDER BY valor ", requiresOrder: true }),
      () => ({ objective: "Ordene os agentes por nome em ordem alfabética.", clue: "A ordem crescente é o padrão, mas deixe-a explícita.", hints: ["Use ORDER BY nome.", "ASC indica ordem crescente.", "Não é necessário LIMIT."], solution: "SELECT nome, distrito FROM agentes ORDER BY nome ASC;", starterQuery: "SELECT nome, distrito\nFROM agentes\n", requiresOrder: true }),
      () => ({ objective: "Encontre o registro mais antigo pelo menor id.", clue: "Somente uma linha deve sair do arquivo.", hints: ["Ordene id de forma crescente.", "Use ASC.", "Aplique LIMIT 1."], solution: "SELECT id, evento, horario FROM registros ORDER BY id ASC LIMIT 1;", starterQuery: "SELECT id, evento, horario\nFROM registros\nORDER BY ", requiresOrder: true }),
      () => ({ objective: "Mostre os dois agentes de menor nivel_acesso.", clue: "Comece pelas credenciais mais baixas.", hints: ["Ordene nivel_acesso com ASC.", "Use LIMIT 2.", "Selecione nome e nivel_acesso."], solution: "SELECT nome, nivel_acesso FROM agentes ORDER BY nivel_acesso ASC LIMIT 2;", starterQuery: "SELECT nome, nivel_acesso\nFROM agentes\nORDER BY ", requiresOrder: true }),
    ],
    [
      () => ({ objective: `Liste agentes do distrito ${district} que estejam ativos.`, clue: "As duas condições precisam ser verdadeiras.", hints: ["Use duas comparações.", "Conecte-as com AND.", `distrito = '${district}' AND ativo = 'sim'.`], solution: `SELECT nome, distrito, ativo FROM agentes WHERE distrito = '${district}' AND ativo = 'sim';`, starterQuery: "SELECT nome, distrito, ativo\nFROM agentes\nWHERE " }),
      () => ({ objective: "Encontre agentes cujo nome começa com a letra M.", clue: "% representa qualquer sequência de caracteres.", hints: ["Use LIKE.", "O padrão deve ficar entre aspas.", "Use nome LIKE 'M%'."], solution: "SELECT nome, cargo FROM agentes WHERE nome LIKE 'M%';", starterQuery: "SELECT nome, cargo\nFROM agentes\nWHERE nome " }),
      () => ({ objective: "Liste agentes dos distritos Centro ou Porto.", clue: "Uma lista curta pode ser expressa com IN.", hints: ["Use WHERE distrito IN (...).", "Separe textos por vírgula.", "Use IN ('Centro', 'Porto')."], solution: "SELECT nome, distrito FROM agentes WHERE distrito IN ('Centro', 'Porto');", starterQuery: "SELECT nome, distrito\nFROM agentes\nWHERE distrito " }),
      () => ({ objective: "Encontre agentes inativos ou com nivel_acesso igual a 5.", clue: "Basta uma das condições ser verdadeira.", hints: ["Use OR.", "Compare ativo com 'nao'.", "A outra condição é nivel_acesso = 5."], solution: "SELECT nome, ativo, nivel_acesso FROM agentes WHERE ativo = 'nao' OR nivel_acesso = 5;", starterQuery: "SELECT nome, ativo, nivel_acesso\nFROM agentes\nWHERE " }),
      () => ({ objective: `Localize registros do tipo ${event} captados em ${location}.`, clue: "Cruze tipo e ponto de captura na mesma linha.", hints: ["A tabela é registros.", "Use evento e local no WHERE.", "Conecte as condições com AND."], solution: `SELECT id, evento, local FROM registros WHERE evento = '${event}' AND local = '${location}';`, starterQuery: "SELECT id, evento, local\nFROM registros\nWHERE " }),
    ],
    [
      () => ({ objective: "Conte quantos agentes existem no cadastro.", clue: "O resultado deve se chamar quantidade.", hints: ["Use COUNT(*).", "Dê um alias com AS.", "Use AS quantidade."], solution: "SELECT COUNT(*) AS quantidade FROM agentes;", starterQuery: "SELECT COUNT(*) AS quantidade\nFROM ", }),
      () => ({ objective: "Calcule a média do nivel_acesso dos agentes.", clue: "O resultado deve se chamar media_acesso.", hints: ["Use AVG.", "A coluna é nivel_acesso.", "Use AS media_acesso."], solution: "SELECT AVG(nivel_acesso) AS media_acesso FROM agentes;", starterQuery: "SELECT AVG() AS media_acesso\nFROM agentes;" }),
      () => ({ objective: "Some o valor de todos os registros.", clue: "Nomeie o total como valor_total.", hints: ["Use SUM(valor).", "Consulte registros.", "Use AS valor_total."], solution: "SELECT SUM(valor) AS valor_total FROM registros;", starterQuery: "SELECT SUM(valor) AS valor_total\nFROM ", }),
      () => ({ objective: "Descubra o maior valor entre os registros.", clue: "O resultado deve se chamar maior_valor.", hints: ["Use MAX.", "A coluna é valor.", "Use AS maior_valor."], solution: "SELECT MAX(valor) AS maior_valor FROM registros;", starterQuery: "SELECT MAX() AS maior_valor\nFROM registros;" }),
      () => ({ objective: "Conte quantos registros têm valor maior que 500.", clue: "Agregações também podem usar WHERE.", hints: ["Use COUNT(*).", "Filtre valor > 500.", "Nomeie como quantidade."], solution: "SELECT COUNT(*) AS quantidade FROM registros WHERE valor > 500;", starterQuery: "SELECT COUNT(*) AS quantidade\nFROM registros\nWHERE " }),
    ],
    [
      () => ({ objective: "Conte os agentes de cada distrito.", clue: "O resultado deve trazer distrito e quantidade.", hints: ["Use COUNT(*).", "Agrupe por distrito.", "Use GROUP BY distrito."], solution: "SELECT distrito, COUNT(*) AS quantidade FROM agentes GROUP BY distrito;", starterQuery: "SELECT distrito, COUNT(*) AS quantidade\nFROM agentes\nGROUP BY " }),
      () => ({ objective: "Calcule a média de nivel_acesso por cargo.", clue: "Nomeie a média como media_acesso.", hints: ["Selecione cargo e AVG.", "Agrupe pela coluna não agregada.", "Use GROUP BY cargo."], solution: "SELECT cargo, AVG(nivel_acesso) AS media_acesso FROM agentes GROUP BY cargo;", starterQuery: "SELECT cargo, AVG(nivel_acesso) AS media_acesso\nFROM agentes\n" }),
      () => ({ objective: "Some os valores registrados em cada local.", clue: "O total deve se chamar valor_total.", hints: ["Selecione local e SUM(valor).", "Use a tabela registros.", "Agrupe por local."], solution: "SELECT local, SUM(valor) AS valor_total FROM registros GROUP BY local;", starterQuery: "SELECT local, SUM(valor) AS valor_total\nFROM registros\nGROUP BY " }),
      () => ({ objective: "Conte os registros de cada tipo de evento.", clue: "Nomeie a contagem como quantidade.", hints: ["Selecione evento.", "Adicione COUNT(*).", "Use GROUP BY evento."], solution: "SELECT evento, COUNT(*) AS quantidade FROM registros GROUP BY evento;", starterQuery: "SELECT evento, COUNT(*) AS quantidade\nFROM registros\n" }),
      () => ({ objective: "Mostre distritos que possuem mais de um agente.", clue: "Filtros sobre grupos usam HAVING.", hints: ["Agrupe por distrito.", "Conte com COUNT(*).", "Use HAVING COUNT(*) > 1."], solution: "SELECT distrito, COUNT(*) AS quantidade FROM agentes GROUP BY distrito HAVING COUNT(*) > 1;", starterQuery: "SELECT distrito, COUNT(*) AS quantidade\nFROM agentes\nGROUP BY distrito\nHAVING " }),
    ],
    [
      () => ({ objective: `Liste o nome do agente e o evento dos registros captados em ${location}.`, clue: "agentes.id se conecta a registros.agente_id.", hints: ["Use aliases a e r.", "Faça JOIN registros r.", "Use ON a.id = r.agente_id."], solution: `SELECT a.nome, r.evento FROM agentes a JOIN registros r ON a.id = r.agente_id WHERE r.local = '${location}';`, starterQuery: "SELECT a.nome, r.evento\nFROM agentes a\nJOIN registros r ON " }),
      () => ({ objective: "Mostre nome, local e horário de cada atividade registrada.", clue: "Cada registro aponta para um agente.", hints: ["Una agentes e registros.", "Use a.id = r.agente_id.", "Selecione a.nome, r.local, r.horario."], solution: "SELECT a.nome, r.local, r.horario FROM agentes a JOIN registros r ON a.id = r.agente_id;", starterQuery: "SELECT a.nome, r.local, r.horario\nFROM agentes a\nJOIN registros r ON " }),
      () => ({ objective: `Liste nome e valor para atividades do tipo ${event}.`, clue: "O tipo do evento está em registros.", hints: ["Faça o JOIN pelos ids.", "Filtre r.evento.", `Compare com '${event}'.`], solution: `SELECT a.nome, r.valor FROM agentes a JOIN registros r ON a.id = r.agente_id WHERE r.evento = '${event}';`, starterQuery: "SELECT a.nome, r.valor\nFROM agentes a\nJOIN registros r ON a.id = r.agente_id\nWHERE " }),
      () => ({ objective: "Mostre agente, distrito e evento para registros acima de 500.", clue: "As colunas vêm das duas tabelas.", hints: ["Use JOIN.", "Relacione id e agente_id.", "Filtre r.valor > 500."], solution: "SELECT a.nome, a.distrito, r.evento FROM agentes a JOIN registros r ON a.id = r.agente_id WHERE r.valor > 500;", starterQuery: "SELECT a.nome, a.distrito, r.evento\nFROM agentes a\nJOIN registros r ON " }),
      () => ({ objective: `Conte atividades por agente no ponto ${location}.`, clue: "Agrupe pelo nome depois da junção.", hints: ["Una as tabelas.", "Filtre r.local.", "Use GROUP BY a.nome."], solution: `SELECT a.nome, COUNT(*) AS quantidade FROM agentes a JOIN registros r ON a.id = r.agente_id WHERE r.local = '${location}' GROUP BY a.nome;`, starterQuery: "SELECT a.nome, COUNT(*) AS quantidade\nFROM agentes a\nJOIN registros r ON a.id = r.agente_id\nWHERE " }),
    ],
    [
      () => ({ objective: `Encontre agentes que possuem registros no local ${location}.`, clue: "A subconsulta deve retornar agente_id.", hints: ["Use WHERE id IN.", "Crie um SELECT dentro dos parênteses.", `Filtre local = '${location}'.`], solution: `SELECT nome FROM agentes WHERE id IN (SELECT agente_id FROM registros WHERE local = '${location}');`, starterQuery: "SELECT nome\nFROM agentes\nWHERE id IN (\n  SELECT agente_id\n  FROM registros\n  WHERE \n);" }),
      () => ({ objective: "Liste agentes com nivel_acesso acima da média do cadastro.", clue: "Calcule AVG em uma subconsulta.", hints: ["Compare nivel_acesso com >.", "A subconsulta usa AVG(nivel_acesso).", "As duas consultas leem agentes."], solution: "SELECT nome, nivel_acesso FROM agentes WHERE nivel_acesso > (SELECT AVG(nivel_acesso) FROM agentes);", starterQuery: "SELECT nome, nivel_acesso\nFROM agentes\nWHERE nivel_acesso > (\n  SELECT \n);" }),
      () => ({ objective: "Encontre registros com valor igual ao maior valor registrado.", clue: "MAX pode descobrir o valor de comparação.", hints: ["Use WHERE valor =.", "A subconsulta usa MAX(valor).", "Consulte registros nas duas partes."], solution: "SELECT id, evento, valor FROM registros WHERE valor = (SELECT MAX(valor) FROM registros);", starterQuery: "SELECT id, evento, valor\nFROM registros\nWHERE valor = (\n  SELECT \n);" }),
      () => ({ objective: `Liste agentes ligados a registros do tipo ${event}.`, clue: "Use IN para receber uma lista de ids.", hints: ["A subconsulta retorna agente_id.", "Filtre por evento.", "A consulta externa retorna nome."], solution: `SELECT nome FROM agentes WHERE id IN (SELECT agente_id FROM registros WHERE evento = '${event}');`, starterQuery: "SELECT nome\nFROM agentes\nWHERE id IN (\n  SELECT agente_id\n  FROM registros\n  WHERE \n);" }),
      () => ({ objective: "Mostre registros cujo valor está acima da média geral.", clue: "A média é calculada antes da comparação.", hints: ["Use valor > (...).", "A subconsulta usa AVG(valor).", "Nomeie apenas as colunas solicitadas."], solution: "SELECT id, evento, valor FROM registros WHERE valor > (SELECT AVG(valor) FROM registros);", starterQuery: "SELECT id, evento, valor\nFROM registros\nWHERE valor > (\n  SELECT \n);" }),
    ],
  ];

  return challenges[operationIndex][variant % challenges[operationIndex].length]();
}

function difficultyFor(operationIndex: number): Difficulty {
  if (operationIndex < 2) return "recruta";
  if (operationIndex < 4) return "investigador";
  if (operationIndex < 7) return "especialista";
  return "comandante";
}

export function createCase(id: number): GameCase {
  if (id < 1 || id > 200) throw new RangeError("O id do caso deve estar entre 1 e 200.");

  const operationIndex = Math.floor((id - 1) / 25);
  const variant = (id - 1) % 25;
  const operation = OPERATIONS[operationIndex];
  const tables = createTables(id);
  const challenge = challengeFor(operationIndex, variant, tables);
  const district = districts[(id + operationIndex) % districts.length];

  return {
    id,
    slug: `caso-${String(id).padStart(3, "0")}`,
    code: `RS-${String(id).padStart(3, "0")}`,
    title: caseNouns[(id + operationIndex) % caseNouns.length],
    district,
    difficulty: difficultyFor(operationIndex),
    xp: 80 + operationIndex * 30 + (variant % 5) * 5,
    operationId: operation.id,
    brief: `Uma inconsistência foi detectada no distrito ${district}. O arquivo ${String(id).padStart(3, "0")} contém sinais que só podem ser isolados com uma consulta precisa. Sua análise será anexada ao relatório da ${operation.shortTitle}.`,
    ...challenge,
    tables,
  };
}

export const CASES: GameCase[] = Array.from({ length: 200 }, (_, index) => createCase(index + 1));

export const getCaseBySlug = (slug: string) => CASES.find((gameCase) => gameCase.slug === slug);

export const getCasesByOperation = (operationId: string) =>
  CASES.filter((gameCase) => gameCase.operationId === operationId);
