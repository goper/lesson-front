const s=[];(function(){const e=String.raw,t=[{id:"t-001",user_id:"100500",category:"access",text:"Не приходит код подтверждения при входе в аккаунт",created_at:"2026-11-20T06:12:00Z"},{id:"t-002",user_id:"100501",category:"docs",text:"Как оплатить подписку картой, если я не в России",created_at:"2026-11-20T05:40:00Z"},{id:"t-003",user_id:"100502",category:"bug",text:"Тесты проходят локально, а в Хекслете падает AssertionError",created_at:"2026-11-19T21:03:00Z"}],a={results:[{text:"Оплата из-за рубежа: используйте карту иностранного банка или …",filename:"payments/foreign-cards.md",score:.87},{text:"AssertionError в тестах означает, что проверка ожидала другое значение …",filename:"code-errors/assertion-error.md",score:.81}],candidates:9,discovered_indexes:2,judge_used:!0,elapsed_ms:5658},r="За сутки 3 открытых тикета: доступ (1), документация (1), ошибка кода (1). Для вопроса об оплате из-за рубежа подойдёт статья «Оплата из-за рубежа», для AssertionError статья «AssertionError в тестах».";s.push({id:"l8",num:8,minutes:120,title:"Практика: цепочка в Яндекс AI Studio",goal:"Собрать в Yandex Workflows ежедневный дайджест для оператора поддержки: тикеты из YDB, статьи базы знаний через функцию-реранкер, сводка от модели, отправка в Telegram.",blocks:[{t:"p",md:"Практика собирает одну рабочую цепочку. Раз в день она читает из базы YDB тикеты за последние сутки, ищет подходящие статьи базы знаний, просит модель собрать из них сводку и отправляет результат оператору в Telegram. Сначала разберём, как устроен Yandex Workflows и зачем цепочке прослойка-функция, потом подготовим окружение, соберём цепочку по шагам и сделаем три задания."},{t:"iso",title:"Из чего состоит система: четыре слоя",caption:"Нажмите на слой, чтобы прочитать, что в нём происходит. Кнопка «Плоский вид» показывает то же списком.",layers:[{title:"Запуск",cls:"n-start",nodes:[{label:"расписание 09:00",kind:"code"},{label:"кнопка «Запустить»",kind:"human"}],md:"Триггер из урока 3. Расписание раз в день или ручной запуск кнопкой. Входных данных цепочке не нужно: она берёт их сама из базы, поэтому пустой JSON `{}` на входе это нормально."},{title:"Workflow (YaWL)",cls:"",nodes:[{label:"databaseQuery",kind:"code"},{label:"switch",kind:"code"},{label:"httpCall",kind:"code"},{label:"aiStudioAgent",kind:"model"},{label:"telegramBot",kind:"code"}],md:"Сама цепочка, описанная на языке YaWL. Шесть шагов: прочитать тикеты, проверить, что они есть, вызвать функцию-реранкер, вызвать агента для сводки, отправить сообщение, завершить. Состояние запуска это JSON, который каждый шаг пополняет."},{title:"Сервисы облака",cls:"",nodes:[{label:"YDB: таблица tickets",kind:"store"},{label:"Cloud Function reranker",kind:"code"},{label:"два поисковых индекса",kind:"store"},{label:"текстовый агент",kind:"model"}],md:"То, к чему цепочка обращается внутри Яндекс Облака. База тикетов, функция-прослойка, два поисковых индекса с базой знаний и текстовый агент AI Studio, который пишет сводку."},{title:"Внешний мир",cls:"",nodes:[{label:"Telegram Bot API",kind:"ext"},{label:"оператор поддержки",kind:"human"}],md:"Доставка результата из урока 2: HTTP-запрос к Telegram, сообщение приходит оператору. Единственная часть за пределами облака."}]},{t:"flow",title:"Целевая цепочка",cw:180,ch:84,nw:158,legend:["store","decision","code","model","ext"],nodes:[{id:"t",label:`расписание или
ручной запуск`,kind:"start",x:0,y:0},{id:"q",label:`YDB: открытые
тикеты за сутки`,kind:"store",x:1,y:0},{id:"c",label:"тикеты есть?",kind:"decision",x:2,y:0},{id:"e",label:`завершить
без вызовов`,kind:"end",x:2,y:1},{id:"r",label:`Cloud Function
reranker`,kind:"code",x:3,y:0},{id:"a",label:`агент AI Studio:
сводка`,kind:"model",x:4,y:0},{id:"tg",label:`Telegram:
сообщение`,kind:"ext",x:4,y:1}],edges:[{from:"t",to:"q"},{from:"q",to:"c"},{from:"c",to:"e",label:"нет"},{from:"c",to:"r",label:"да"},{from:"r",to:"a",label:"статьи"},{from:"a",to:"tg",label:"текст"}],caption:"Условие проверяет то, что вернул запрос, и пустая выборка завершает запуск до вызова функции и модели: ни токены, ни вызовы не тратятся."},{t:"h2",text:"Как устроен Yandex Workflows"},{t:"p",md:"**Yandex Workflows** это сервис Яндекс Облака, в котором цепочку описывают как набор шагов и переходов между ними. Собрать её можно в визуальном редакторе (узлы на холсте, стрелки задают порядок, клик по узлу открывает настройки) или текстом на языке **YaWL** в формате YAML. Логика та же, что в n8n или самописных системах оркестрации, различаются детали интерфейса."},{t:"terms",items:[{term:"`yawl`",def:"Версия языка. Спецификация начинается с неё."},{term:"`start`",def:"Имя первого шага."},{term:"`steps`",def:"Сами шаги. Каждый с именем, типом и переходом `next`."},{term:"Интеграционные шаги",def:"Обращаются к внешним системам: `databaseQuery` (запрос к YDB), `httpCall` (HTTP-запрос), `aiStudioAgent` (вызов агента)."},{term:"Управляющие шаги",def:"Решают, куда идти дальше: `switch` выбирает ветку по условию, `success` завершает запуск."},{term:"Состояние запуска",def:"JSON, который начинается со входа запуска и пополняется результатом каждого шага."},{term:"`output`",def:"Шаблон на языке jq, который говорит, что шаг добавит в состояние."}]},{t:"simple",md:"**jq** это маленький язык для работы с JSON, как формулы в таблице. Точка `.` означает «текущие данные». `.tickets` достаёт поле tickets. Вертикальная черта `|` передаёт результат дальше, как труба: `.tickets | length` считает, сколько тикетов. В YaWL выражение, которое что-то **кладёт** в состояние, заворачивают в `\\( ... )`, а условие пишут как есть."},{t:"table",head:["Выражение jq","Что делает"],rows:[["`.`","всё текущее состояние"],["`.ResultSets[0]`","первая таблица из результата запроса к базе"],['`\\({"tickets": .ResultSets[0]})`',"шаблон: положить эту таблицу в состояние под именем `tickets`"],["`.tickets | length > 0`","условие: есть ли тикеты (true/false)"],['`.tickets | map(.category + ": " + .text) | join(" | ")`',"склеить все тикеты в одну строку «категория: текст | категория: текст»"],["`.tickets | tostring | .[0:3000]`","превратить в строку и обрезать до 3000 символов"],["`.results[0] // null`","первый элемент или `null`, если список пуст"],["`.digest`","взять готовый текст сводки для сообщения в Telegram"]]},{t:"sim",kind:"yawl",title:"Как состояние проходит через цепочку",md:"Нажимайте «Следующий шаг» и смотрите, какой фрагмент YaWL выполняется и что появляется в состоянии. Галочка «тикетов нет» показывает ветку с ранним завершением.",fullPath:["select","check","retrieve","build","notify","ok"],emptyPath:["select","check","empty"],steps:{select:{name:"select_recent_tickets (databaseQuery)",yaml:e`select_recent_tickets:
  databaseQuery:
    connection: { type: YDB, host: ydb.serverless.yandexcloud.net, port: 2135, database: <путь к базе>, ssl: true, iam: true }
    query: |
      SELECT id, user_id, category, text, created_at FROM tickets
      WHERE status = 'open' AND created_at > CurrentUtcTimestamp() - Interval('PT24H')
      ORDER BY created_at DESC LIMIT 20;
    mode: QUERY
    output: '\({"tickets": .ResultSets[0]})'
    next: check_non_empty`,md:"Запрос к YDB выбирает открытые тикеты за сутки, не больше двадцати. База отвечает объектом с полем `ResultSets`, где первая таблица и есть нужные строки. Шаблон в `output` кладёт её в состояние под именем `tickets`.",state:{tickets:t},stateEmpty:{tickets:[]}},check:{name:"check_non_empty (switch)",yaml:e`check_non_empty:
  switch:
    choices:
      - condition: .tickets | length > 0
        next: retrieve_kb
      - condition: "true"
        next: finish_empty`,md:"Условие смотрит на то, что вернул запрос, а не на вход запуска. Поэтому оно одинаково работает и при ручном запуске, и по расписанию. Если тикетов нет, цепочка завершается сразу и не тратит вызов функции и токены.",state:{tickets:t},stateEmpty:{tickets:[]}},retrieve:{name:"retrieve_kb (httpCall → reranker)",yaml:e`retrieve_kb:
  httpCall:
    method: POST
    url: 'https://functions.yandexcloud.net/<ID функции reranker>'
    headers:
      Content-Type: application/json
      Authorization: 'Api-Key \(lockboxPayload("<ID секрета функции>"; "api_key"))'
    body: '\({"query": (.tickets | map(.category + ": " + .text) | join(" | ")), "top_k": 5})'
    output: '\({"kb_results": .})'
    next: build_digest`,md:"Из всех тикетов склеивается один поисковый запрос, функция обходит оба индекса и возвращает пять лучших фрагментов. Ответ с `Content-Type: application/json` приходит уже разобранным объектом, и он целиком ложится в состояние как `kb_results`.",state:{tickets:t,kb_results:a}},build:{name:"build_digest (aiStudioAgent)",yaml:e`build_digest:
  aiStudioAgent:
    promptTemplateId: <ID агента>
    message: '\("Сформируй краткий дайджест для оператора Help Desk… Тикеты: " + (.tickets | tostring | .[0:3000]) + ". KB-выдача: " + (.kb_results | tostring | .[0:3000]))'
    auto_approve: true
    output: '\({"digest": .Result})'
    next: notify_operator`,md:"Агенту отправляется запрос, собранный из тикетов и найденных статей. Каждая часть обрезана до трёх тысяч символов, чтобы запрос поместился в окно контекста. Ответ агента лежит в поле `Result`, и он сохраняется как `digest`.",state:{tickets:"… (3 тикета)",kb_results:"… (2 статьи)",digest:r}},notify:{name:"notify_operator (telegramBot)",yaml:e`notify_operator:
  telegramBot:
    token: \(lockboxPayload("<ID секрета>"; "token"))
    sendMessage:
      chatId: '<chat_id>'
      text: \(.digest)
    output: '\({})'
    next: finish_ok`,md:"Шаг берёт токен бота из хранилища секретов Lockbox, а текст сообщения — из поля digest.",state:{tickets:"…",kb_results:"…",digest:r}},ok:{name:"finish_ok (success)",yaml:e`finish_ok:
  success: {}`,md:"Запуск завершён успешно. Во вкладке «Запуски» остаётся история: вход, выход, статус и время каждого шага.",state:{tickets:"…",kb_results:"…",digest:r}},empty:{name:"finish_empty (success)",yaml:e`finish_empty:
  success: {}`,md:"Тикетов не было. Запуск завершён без вызова функции и модели: ни денег, ни времени.",state:{tickets:[]},stateEmpty:{tickets:[]}}}},{t:"p",md:"Запуск стартует с входным JSON, и после него во вкладке «Запуски» остаётся история с входом, выходом, статусом и временем каждого шага. Запустить цепочку можно вручную кнопкой, а регулярный запуск задаётся расписанием в формате cron."},{t:"key",md:"Цепочка не зависит от того, передаст ли расписание входные данные: она берёт данные сама, из базы, и проверяет условие по тому, что вернул запрос. Поэтому один и тот же workflow одинаково работает и по кнопке с пустым входом, и по расписанию."},{t:"h2",text:"Зачем нужна прослойка-функция"},{t:"p",md:"Ограничение платформы такое: текстовый агент в AI Studio работает только с **одним** поисковым индексом, а запрос сразу к нескольким индексам поисковый инструмент отклоняет ошибкой 400. Обход стандартный: код-прослойка. Облачная функция принимает запрос, сама обходит все индексы, объединяет найденное и отдаёт результат, а цепочка обращается уже к ней. Заодно функция берёт на себя роль **судьи**, который выбирает лучшие фрагменты из найденного. Это задача реранкинга (переупорядочивания результатов поиска) в чистом виде."},{t:"flow",title:"Функция reranker как конвейер",dir:"LR",cw:150,ch:76,nw:130,legend:["code","store","model"],nodes:[{id:"q",label:"запрос",kind:"start",x:0,y:0},{id:"d",label:`найти индексы
по метке`,kind:"store",x:1,y:0},{id:"r",label:`опросить каждый
параллельно`,kind:"code",x:2,y:0},{id:"u",label:"убрать дубли",kind:"code",x:3,y:0},{id:"j",label:`судья
упорядочивает`,kind:"model",x:4,y:0},{id:"t",label:"первые top_k",kind:"end",x:5,y:0}],edges:[{from:"q",to:"d"},{from:"d",to:"r"},{from:"r",to:"u"},{from:"u",to:"j"},{from:"j",to:"t"}]},{t:"p",md:"Индексы функция не хранит в коде. Она находит их по метке `reranker=true`, поэтому новый источник знаний подключается созданием индекса с этой меткой, без правки кода и нового развёртывания. Каждый индекс опрашивается отдельным вызовом, потому что за один вызов платформа принимает один индекс, и делается это параллельно."},{t:"tabs",title:"Ядро функции: параллельный опрос, удаление дублей, судья с повтором и запасным путём",langs:{php:e`<?php
// Функция reranker: опросить все индексы параллельно, убрать дубли, попросить судью упорядочить, вернуть top_k.
final class Reranker
{
    public function __construct(private HttpClientInterface $search, private Judge $judge) {}

    /** @return list<array{text: string, source_index: string, hash: string}> */
    public function retrieveFromIndexes(string $query, array $indexIds, int $topKPerIndex): array
    {
        // HttpClient отправляет запросы параллельно: сначала создаём все, потом читаем ответы
        $responses = [];
        foreach ($indexIds as $id) {
            $responses[$id] = $this->search->request('POST', '/search', [
                'json' => ['index_id' => $id, 'query' => $query, 'top_k' => $topKPerIndex],
            ]);
        }
        $chunks = [];
        foreach ($responses as $id => $response) {
            try {
                foreach ($response->toArray()['results'] as $hit) {
                    $chunks[] = ['text' => $hit['text'], 'source_index' => $id];
                }
            } catch (\Throwable $e) {
                error_log("RETRIEVAL_WORKER_ERROR index=$id {$e->getMessage()}");   // один индекс упал, остальные работают
            }
        }
        $seen = []; $deduped = [];                                     // дубли по хешу первых 500 символов
        foreach ($chunks as $c) {
            $h = sha1(mb_substr($c['text'], 0, 500));
            if (isset($seen[$h])) continue;
            $seen[$h] = true; $c['hash'] = $h; $deduped[] = $c;
        }
        error_log(sprintf('RETRIEVAL_TOTAL raw=%d deduped=%d', count($chunks), count($deduped)));
        return $deduped;
    }

    /** @return array{0: list<array>, 1: bool} отсортированный top-K и флаг, сработал ли судья */
    public function rerank(string $query, array $candidates, int $topK, int $maxRetries = 2): array
    {
        if (count($candidates) <= 1) return [array_slice($candidates, 0, $topK), false];

        $system = Prompts::SYSTEM_JUDGE; $lastError = null;
        for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
            try {
                $raw     = $this->judge->call($system, Prompts::buildUserPrompt($query, $candidates));
                $ranking = Prompts::parseRanking($raw, count($candidates));   // терпимый разбор + проверка диапазона и уникальности
                if ($ranking !== null) {
                    error_log("JUDGE_OK attempt=$attempt");
                    return [array_slice(array_map(fn (int $i) => $candidates[$i - 1], $ranking), 0, $topK), true];
                }
                $lastError = 'parse_failed raw=' . mb_substr($raw, 0, 200);
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }
            $system = Prompts::SYSTEM_JUDGE_STRICT;                             // повтор с более строгим промптом
        }
        error_log("JUDGE_FALLBACK_PASSTHROUGH reason=$lastError");
        return [array_slice($candidates, 0, $topK), false];                     // запасной путь: исходный порядок, не падение
    }
}`,js:e`// Функция reranker: опросить все индексы параллельно, убрать дубли, попросить судью упорядочить, вернуть top_k.
import { createHash } from 'node:crypto';

async function retrieveFromIndexes(query, indexIds, topKPerIndex) {
  const settled = await Promise.allSettled(indexIds.map(id => queryOneIndex(query, id, topKPerIndex)));   // параллельно
  const chunks = [];
  settled.forEach((res, i) => res.status === 'fulfilled'
    ? chunks.push(...res.value)
    : console.log('RETRIEVAL_WORKER_ERROR index=' + indexIds[i], res.reason.message));   // один индекс упал, остальные работают

  const seen = new Set(); const deduped = [];                   // дубли по хешу первых 500 символов
  for (const c of chunks) {
    const h = createHash('sha1').update(c.text.slice(0, 500)).digest('hex');
    if (seen.has(h)) continue;
    seen.add(h); deduped.push({ ...c, hash: h });
  }
  console.log('RETRIEVAL_TOTAL raw=' + chunks.length + ' deduped=' + deduped.length);
  return deduped;
}

async function rerank(query, candidates, topK, maxRetries = 2) {
  if (candidates.length <= 1) return { ordered: candidates.slice(0, topK), judgeUsed: false };

  let system = SYSTEM_JUDGE, lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await callModel(system, buildUserPrompt(query, candidates));
      const ranking = parseRanking(raw, candidates.length);    // терпимый разбор + проверка диапазона и уникальности
      if (ranking) {
        console.log('JUDGE_OK attempt=' + attempt);
        return { ordered: ranking.map(i => candidates[i - 1]).slice(0, topK), judgeUsed: true };
      }
      lastError = 'parse_failed raw=' + raw.slice(0, 200);
    } catch (e) { lastError = e.message; }
    system = SYSTEM_JUDGE_STRICT;                              // повтор с более строгим промптом
  }
  console.log('JUDGE_FALLBACK_PASSTHROUGH reason=' + lastError);
  return { ordered: candidates.slice(0, topK), judgeUsed: false };   // запасной путь: исходный порядок, не падение
}`,py:e`# Функция reranker (как в исходнике занятия): опросить индексы параллельно, убрать дубли, судья с повтором и запасным путём.
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

def retrieve_from_indexes(query: str, index_ids: list[str], top_k_per_index: int,
                          folder_id: str, debug: bool = False) -> list[dict[str, Any]]:
    """Параллельно опрашивает все индексы, возвращает дедуплицированный список."""
    if not index_ids:
        return []
    all_chunks: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=min(len(index_ids), 8)) as pool:
        futures = {pool.submit(_query_one_index, query, idx, top_k_per_index, folder_id, debug): idx
                   for idx in index_ids}
        for fut in as_completed(futures):
            idx = futures[fut]
            try:
                all_chunks.extend(fut.result())
            except Exception as e:
                print(f"RETRIEVAL_WORKER_ERROR index={idx} {type(e).__name__}: {e}")   # один индекс упал, остальные работают

    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for c in all_chunks:                                        # дубли по хешу первых 500 символов
        h = hashlib.sha1(c["text"][:500].encode("utf-8")).hexdigest()
        if h in seen:
            continue
        seen.add(h)
        c["hash"] = h
        deduped.append(c)
    print(f"RETRIEVAL_TOTAL raw={len(all_chunks)} deduped={len(deduped)}")
    return deduped

def rerank(query: str, candidates: list[dict[str, Any]], top_k: int,
           max_retries: int, model_uri: str) -> tuple[list[dict[str, Any]], bool]:
    """Возвращает (отсортированный top-K, judge_used). Если судья не отработал — исходный порядок."""
    n = len(candidates)
    if n == 0:
        return [], False
    if n == 1:
        return candidates[:top_k], False

    user_prompt = prompt_mod.build_user_prompt(query, candidates)
    system_prompt = prompt_mod.SYSTEM_JUDGE
    last_error: str | None = None
    for attempt in range(max_retries + 1):
        try:
            raw = _call_yandexgpt(system_prompt, user_prompt, model_uri)
            ranking = parse_ranking(raw, n)                     # терпимый разбор + проверка диапазона и уникальности
            if ranking is not None:
                ordered = [candidates[i - 1] for i in ranking]
                print(f"JUDGE_OK attempt={attempt} ranking={ranking}")
                return ordered[:top_k], True
            last_error = f"parse_failed raw={raw[:200]!r}"
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"
        system_prompt = prompt_mod.SYSTEM_JUDGE_STRICT          # повтор с более строгим промптом

    print(f"JUDGE_FALLBACK_PASSTHROUGH reason={last_error}")
    return candidates[:top_k], False                            # запасной путь: исходный порядок, не падение`},caption:"Это те же приёмы, что в уроке 4: повтор для сбоя, который может пройти (судья ответил не тем форматом), и запасной путь вместо падения всей цепочки (`judge_used: false`, кандидаты в исходном порядке). Число повторов задаёт переменная окружения `JUDGE_MAX_RETRIES`, по умолчанию два."},{t:"p",md:"Судья это модель, которой в промпте объясняют критерии и просят вернуть только JSON со списком номеров кандидатов в порядке убывания релевантности. Судье показывают порядковый номер и текст фрагмента (не длиннее пятисот символов), а идентификаторы файлов не показывают: так модель отвечает короткими целыми числами и не путает номер с длинным шестнадцатеричным идентификатором."},{t:"code",lang:"text",title:"промпт судьи",code:e`Ты — эксперт-ранжировщик поисковых результатов. Тебе дан запрос пользователя и список из N документов-кандидатов.
Оцени релевантность каждого документа запросу по 4 критериям:
1) точное совпадение темы, 2) полнота ответа на запрос, 3) фактическая обоснованность,
4) отсутствие шума и нерелевантных деталей.
Верни СТРОГО JSON вида {"ranking": [id1, id2, ...]} — где ID это ЦЕЛЫЕ ЧИСЛА от 1 до N
(номера документов из списка, НЕ file_id и НЕ hex-строки), в порядке УБЫВАНИЯ релевантности.
Никаких пояснений, markdown, тегов, текста до или после JSON. Каждый ID должен присутствовать ровно один раз.

(строгая версия для повтора добавляет:)
ОТВЕТ ДОЛЖЕН БЫТЬ ВАЛИДНЫМ JSON И НАЧИНАТЬСЯ С '{' И ЗАКАНЧИВАТЬСЯ '}'. НЕ добавляй markdown-обёртки.`},{t:"p",md:"Ответ судьи нельзя принимать на веру. Модель иногда оборачивает JSON в разметку или пишет номера в кавычках, поэтому функция разбирает ответ терпимо, проверяет, что номера лежат в диапазоне от единицы до числа кандидатов и не повторяются, а недостающие дописывает в исходном порядке. Если ответ всё равно не разобрался, `rerank` повторяет вызов с более строгим промптом."},{t:"code",lang:"json",title:"ответ функции",code:e`{
  "results": [
    { "text": "...", "source_index": "fvtt...", "filename": "podpiska.md", "score": 0.87, "file_id": "fvt..." }
  ],
  "candidates": 9,
  "discovered_indexes": 3,
  "judge_used": true,
  "elapsed_ms": 5658
}`},{t:"p",md:"Судья меняет только порядок, а поле `score` приходит из поиска. Целиком функция лежит в [папке с кодом занятия на Яндекс Диске](https://disk.360.yandex.ru/d/MDDFSxDKCIkNQg) в каталоге `reranker`: основной файл `index.py`, настройки `config.py`, поиск индексов `discovery.py`, поиск по ним `retrieval.py`, судья `judge.py`, промпты `prompt.py`, тесты разбора ответа судьи и README с командами развёртывания."},{t:"h2",text:"Целевая цепочка на YaWL"},{t:"p",md:"Та же цепочка целиком. В угловых скобках значения, которые подставляются свои."},{t:"code",lang:"yaml",title:"kb_digest_workflow.yaml",code:e`yawl: "0.1"
start: select_recent_tickets
steps:
  select_recent_tickets:
    databaseQuery:
      connection:
        type: YDB
        host: ydb.serverless.yandexcloud.net
        port: 2135
        database: <путь к базе YDB>
        ssl: true
        iam: true
      query: |
        SELECT id, user_id, category, text, created_at
        FROM tickets
        WHERE status = 'open'
          AND created_at > CurrentUtcTimestamp() - Interval('PT24H')
        ORDER BY created_at DESC
        LIMIT 20;
      mode: QUERY
      output: '\({"tickets": .ResultSets[0]})'
      next: check_non_empty
  check_non_empty:
    switch:
      choices:
        - condition: .tickets | length > 0
          next: retrieve_kb
        - condition: "true"
          next: finish_empty
  retrieve_kb:
    httpCall:
      method: POST
      # адрес закрытой функции reranker
      url: 'https://functions.yandexcloud.net/<ID функции reranker>'
      headers:
        Content-Type: application/json
        Authorization: 'Api-Key \(lockboxPayload("<ID секрета функции>"; "api_key"))'
      # Собираем запрос из тикетов: "category: text | category: text | ..."
      body: '\({"query": (.tickets | map(.category + ": " + .text) | join(" | ")), "top_k": 5})'
      # httpCall с Content-Type: application/json отдаёт в output уже распарсенный объект
      output: '\({"kb_results": .})'
      next: build_digest
  build_digest:
    aiStudioAgent:
      promptTemplateId: <ID агента>
      message: '\("Сформируй краткий дайджест для оператора Help Desk из двух частей. " + "Часть 1 (недавние обращения): 3-5 предложений, что за тикеты пришли за 24ч, какие категории преобладают, сколько открыто. " + "Часть 2 (база знаний): для самых частых категорий тикетов найди релевантные статьи KB в выдаче ниже и кратко (1-2 строки на статью) опиши как каждая помогает. " + "Если KB-выдача пуста — Часть 2 пропусти. " + "Тикеты: " + (.tickets | tostring | .[0:3000]) + ". KB-выдача (reranker, JSON): " + (.kb_results | tostring | .[0:3000]))'
      auto_approve: true
      output: '\({"digest": .Result})'
      next: notify_operator
  notify_operator:
    telegramBot:
      token: \(lockboxPayload("<ID секрета>"; "token"))
      sendMessage:
        chatId: '<chat_id>'
        text: \(.digest)
      output: '\({})'
      next: finish_ok
  finish_empty:
    success: {}
  finish_ok:
    success: {}`},{t:"p",md:"Готовая цепочка подключается узлом в другие workflow или как MCP-инструмент к текстовому агенту. Это та самая вложенность из урока 2, в виде двух кнопок интерфейса."},{t:"warn",md:"Кодинговым агентам можно поручить работу с облаком, включая хранилище и архивы, но известны случаи, когда агент вычищал проект целиком. Держите всё под git: и код, и данные для поисковых индексов. Тогда любое разрушительное действие откатывается одной командой."},{t:"h2",text:"Что понадобится заранее"},{t:"p",md:"Тренажёр на странице работает без облачного аккаунта. Для самостоятельного запуска понадобится облачный каталог с биллингом: модель, функция и хранилище используют тарифицируемые ресурсы. Подготовьте каталог и сервисный аккаунт с ролями на Cloud Functions, YDB, поисковые индексы и языковые модели. К этому пять заготовок, подготовка каждой описана ниже."},{t:"checklist",id:"l8-prereq",items:["Два поисковых индекса с меткой `reranker=true`","Развёрнутая Cloud Function `reranker`. Её сервисному аккаунту нужны роли `ai.assistants.viewer` (поиск индексов) и `ai.languageModels.user` (вызов модели). Для вызова оставьте функцию приватной. Создайте отдельный сервисный аккаунт с ролью `functions.functionInvoker` на эту функцию. Его API-ключ с областью `yc.serverless.functions.invoke` сохраните в Lockbox под именем `api_key`. Затем аккаунту workflow дайте `lockbox.payloadViewer` на этот секрет","База YDB с таблицей `tickets` и несколькими открытыми тикетами за последние сутки","Текстовый агент AI Studio для сводки. Его идентификатор подставляется в `promptTemplateId`","Учебный Telegram-бот и chat_id чата, где вы уже написали боту. Токен от BotFather сохраните в секрете Yandex Lockbox под ключом `token`. Сервисному аккаунту workflow выдайте роль `lockbox.payloadViewer` на этот секрет"]},{t:"h2",text:"Подготовка окружения"},{t:"h3",text:"Индексы"},{t:"p",md:"Писать тексты базы знаний с нуля не нужно: в качестве корпуса берётся справочник help.hexlet.io. Отобраны три раздела: «Старт», «Оплата», «Ошибки кода», всего 24 статьи. Материал уже выгружен и очищен, ссылки в конце урока."},{t:"steps",id:"l8-idx",items:[{title:"Скачайте базу знаний",md:"Архив или уже распакованная папка, это одно и то же. Внутри 24 файла `.md` в трёх папках: `start/` (8), `payments/` (8), `code-errors/` (8)."},{title:"Откройте «AI Search → Поисковые индексы» и нажмите «Создать поисковый индекс»",md:"Нужно создать два индекса: `hexlet-start-payments` из папок `start/` и `payments/` (16 файлов) и `hexlet-code-errors` из папки `code-errors/` (8 файлов)."},{title:"Заполните поля",blocks:[{t:"list",items:["**Имя индекса**, как выше.","**Описание**: коротко о содержимом, например «База знаний help.hexlet.io про старт и оплату». Описание помогает подбирать ответы, не пропускайте.","**Файлы**: перетащите нужные `.md`. Поддерживаются `.md`, `.txt`, `.pdf`, `.jsonl` и другие; лимиты до 10 000 файлов и до 128 МБ на файл. Файлы автоматически режутся на фрагменты (chunks) и векторизуются.","*Альтернатива*: файл `hexlet-kb.jsonl` можно залить через «Загрузить подготовленные чанки», тогда индекс построится по готовому разбиению.","В «Расширенных настройках» для старта подойдут значения по умолчанию: размер чанка 1024 токена, перекрытие 512, эмбеддеры `text-search-doc` и `text-search-query`."]}]},{title:"Нажмите «Создать» и дождитесь статуса Completed",md:"После этого во вкладке «Файлы индекса» видны загруженные файлы и их идентификаторы."},{title:"Поставьте на оба индекса метку reranker=true",md:"Скопируйте идентификаторы двух созданных индексов в переменные ниже. Пример читает текущие метки каждого индекса, добавляет reranker и проверяет результат ответа. Для вызова нужны IAM_TOKEN и FOLDER_ID в окружении. [Методы Get и Update в описании API](https://github.com/yandex-cloud/cloudapi/blob/master/yandex/cloud/ai/assistants/v1/searchindex/search_index_service.proto)",blocks:[{t:"tabs",langs:{php:e`<?php
// Для проекта с symfony/http-client.
use Symfony\Component\HttpClient\HttpClient;

$client = HttpClient::createForBaseUri('https://rest-assistant.api.cloud.yandex.net', [
    'headers' => ['Authorization' => 'Bearer ' . getenv('IAM_TOKEN'), 'x-folder-id' => getenv('FOLDER_ID')],
]);
foreach (['<ID hexlet-start-payments>', '<ID hexlet-code-errors>'] as $id) {
    $path = '/assistants/v1/searchIndex/' . rawurlencode($id);
    $index = $client->request('GET', $path)->toArray();
    $labels = $index['labels'] ?? [];
    $labels['reranker'] = 'true';
    $updated = $client->request('PATCH', $path, [
        'json' => ['updateMask' => 'labels', 'labels' => $labels],
    ])->toArray();
    echo $updated['id'], ' reranker=', $updated['labels']['reranker'], PHP_EOL;
}`,js:e`// Node.js с поддержкой fetch, файл с расширением .mjs.
const headers = { Authorization: 'Bearer ' + process.env.IAM_TOKEN, 'x-folder-id': process.env.FOLDER_ID, 'Content-Type': 'application/json' };
async function request(url, options) {
  const response = await fetch(url, { headers, ...options });
  if (!response.ok) throw new Error('Yandex API: HTTP ' + response.status);
  return response.json();
}
for (const id of ['<ID hexlet-start-payments>', '<ID hexlet-code-errors>']) {
  const url = 'https://rest-assistant.api.cloud.yandex.net/assistants/v1/searchIndex/' + encodeURIComponent(id);
  const index = await request(url);
  const labels = { ...index.labels, reranker: 'true' };
  const updated = await request(url, { method: 'PATCH', body: JSON.stringify({ updateMask: 'labels', labels }) });
  console.log(updated.id, 'reranker=' + updated.labels.reranker);
}`,py:e`# Для Python с библиотекой requests.
import os
import requests

headers = {"Authorization": "Bearer " + os.environ["IAM_TOKEN"], "x-folder-id": os.environ["FOLDER_ID"]}
for index_id in ("<ID hexlet-start-payments>", "<ID hexlet-code-errors>"):
    url = "https://rest-assistant.api.cloud.yandex.net/assistants/v1/searchIndex/" + index_id
    current = requests.get(url, headers=headers, timeout=15)
    current.raise_for_status()
    labels = {**current.json().get("labels", {}), "reranker": "true"}
    updated = requests.patch(url, headers=headers, json={"updateMask": "labels", "labels": labels}, timeout=15)
    updated.raise_for_status()
    print(index_id, "reranker=" + updated.json()["labels"]["reranker"])`}}]}]},{t:"h3",text:"Реранкер"},{t:"p",md:"Разверните функцию `reranker` из каталога `reranker` в папке с кодом занятия, следуя README рядом с кодом. После развёртывания проверьте, что она находит оба индекса, и прогоните контрольные запросы."},{t:"code",lang:"bash",title:"проверка функции",code:e`yc serverless function invoke reranker --data '{"query":"как оплатить подписку","top_k":5}'`},{t:"p",md:"В ответе `discovered_indexes` равно двум, `results` не пуст, а первой стоит статья по теме запроса. Контрольных запросов шесть, и для каждого первой в выдаче должна стоять статья из указанного раздела."},{t:"table",head:["Раздел","Запрос"],rows:[["Старт","Чем отличаются тарифы Оптимальный и Премиум-подписка?"],["Старт","Сколько запросов в день у ИИ-помощника?"],["Оплата","Как отменить подписку и что будет с доступом?"],["Оплата","Можно ли оплатить обучение не из России?"],["Ошибки кода","Что означает AssertionError в выводе тестов Python?"],["Ошибки кода","Код работает локально, а в Хекслете нет, что проверить?"]]},{t:"h3",text:"База тикетов"},{t:"p",md:"В консоли управления откройте свою базу YDB и выполните запрос на создание таблицы. Схема взята из учебного проекта: у тикета есть категория, статус и время создания."},{t:"code",lang:"sql",title:"schema.sql",code:e`CREATE TABLE tickets (
  id           Utf8,        -- UUID
  user_id      Utf8,        -- Telegram chat id
  category     Utf8,        -- bug | docs | feature | access
  status       Utf8,        -- open | answered | escalated | closed
  text         Utf8,        -- текст обращения (после маскирования персональных данных)
  created_at   Timestamp,
  updated_at   Timestamp,
  PRIMARY KEY (id),
  INDEX tickets_by_user GLOBAL ON (user_id)
);`},{t:"p",md:"Затем добавьте несколько тикетов. Запрос шага берёт открытые тикеты за последние сутки, поэтому время создания ставится текущее."},{t:"code",lang:"sql",title:"тестовые тикеты",code:e`UPSERT INTO tickets (id, user_id, category, status, text, created_at, updated_at) VALUES
  ('t-001', '100500', 'access', 'open', 'Не приходит код подтверждения при входе в аккаунт', CurrentUtcTimestamp(), CurrentUtcTimestamp()),
  ('t-002', '100501', 'docs',   'open', 'Как оплатить подписку картой, если я не в России', CurrentUtcTimestamp(), CurrentUtcTimestamp()),
  ('t-003', '100502', 'bug',    'open', 'Тесты проходят локально, а в Хекслете падает AssertionError', CurrentUtcTimestamp(), CurrentUtcTimestamp());`},{t:"h3",text:"Агент для сводки"},{t:"p",md:"Агент нужен только чтобы собрать сводку, поэтому инструменты ему не подключают. Откройте «Agent Atelier → Текстовые агенты → Создать агента» и заполните три поля: **имя** (например, «Сводка для оператора»), **модель** (рядом настройки: формат ответа, температура, для фактовых ответов ставьте пониже, например `0.3`, максимум токенов в ответе, обрезание контекста) и **инструкцию**:"},{t:"code",lang:"text",title:"инструкция агента",code:e`Ты помощник оператора поддержки. Тебе дают список свежих тикетов и найденные статьи базы знаний.
Напиши короткую сводку на русском. Сначала скажи, сколько тикетов и какие категории преобладают,
затем для самых частых проблем назови подходящую статью. Если статей нет, пропусти эту часть.
Ничего не придумывай.`},{t:"p",md:"Идентификатор агента берётся на его странице, и именно он подставляется в `promptTemplateId`. Интерфейс AI Studio периодически обновляется, при расхождениях сверяйтесь с документацией."},{t:"h3",text:"Проверка подготовки"},{t:"checklist",id:"l8-prep",items:["Оба индекса в статусе Completed и с меткой `reranker=true`","Функция `reranker` на шести контрольных запросах возвращает `discovered_indexes` = 2 и статью из нужного раздела первой","В таблице `tickets` есть открытые тикеты, созданные за последние сутки","Агент для сводки отвечает в окне тестирования на любой запрос"]},{t:"h2",text:"Сборка по шагам"},{t:"steps",id:"l8-build",items:[{title:"Создайте workflow",md:"В AI Studio откройте раздел «Workflows» в группе Agent Atelier. Нажмите кнопку создания и задайте имя без нижнего подчёркивания. Создайте цепочку из спецификации YaWL (вставьте YAML из раздела «Целевая цепочка» со своими значениями) или оставьте пустую и собирайте шаги по порядку ниже. Результат одинаковый. Если шаг позже падает с кодом 403, причина в правах сервисного аккаунта, от имени которого идёт запуск: чинить права, а не повторять шаг."},{title:"Настройте запуск",md:"Проверьте ручной запуск кнопкой «Запустить»: входные данные не нужны, достаточно `{}`. Добавьте расписание, например раз в день утром: время задаётся вместе с часовым поясом. Выдайте сервисному аккаунту две роли на этот workflow: `serverless.workflows.executor` и `serverless.workflows.viewer`. Без первой запуск отклоняется ошибкой `can't invoke workflow`, без второй `doesn't have get permission for workflow`. Обе приходят с кодом 400 и выглядят как неверные данные запроса, хотя причина в правах."},{title:"Прочитайте тикеты и поставьте условие на данные",md:"Добавьте шаг `databaseQuery` с подключением к своей базе и запросом открытых тикетов за сутки (не больше двадцати). В `output` сохраните результат под именем `tickets`. Добавьте шаг `switch` с проверкой `.tickets | length > 0`, а ветку «нет» замкните на `success`. Условие смотрит на то, что вернул запрос, поэтому работает и при ручном запуске, и по расписанию."},{title:"Добавьте вызов Cloud Function",md:'Шаг `httpCall` методом POST на адрес закрытой функции `reranker`. Укажите тип содержимого `application/json` и возьмите ключ для заголовка Authorization из Lockbox, как в примере выше. Тело: склейте категорию и текст каждого тикета в одну строку и добавьте `"top_k": 5`. Результат сохраните как `kb_results`. Для цепочки это один шаг с одним входом и выходом.'},{title:"Добавьте вызов агента",md:"Шаг `aiStudioAgent`, в `promptTemplateId` идентификатор агента. В `message` соберите запрос из тикетов и найденных статей, обрезав каждую часть до трёх тысяч символов выражением `.[0:3000]`, чтобы запрос поместился в окно контекста. Результат из поля `Result` сохраните как `digest`. Поле `auto_approve: true` нужно, чтобы запуск не ждал подтверждения человека."},{title:"Отправьте результат в Telegram",md:"Добавьте шаг `telegramBot` с действием `sendMessage`. Для `token` укажите ссылку на секрет Lockbox, для `chatId` — номер учебного чата, для `text` — поле `.digest`. [Пример Yandex Cloud](https://yandex.cloud/ru/docs/tutorials/serverless/telegram-ai-bot-workflows)",blocks:[{t:"toggle",title:"Про входящие сообщения из Telegram",md:"Обратное направление, webhook из Telegram в Яндекс Облако, может не заработать. Тогда входящие сообщения забирают методом pull: функция по таймеру раз в минуту опрашивает `getUpdates`. Пример такого опроса лежит в папке с кодом занятия в файле `telegram_poller.py`. Это ровно выбор «источник умеет push, но push нельзя использовать в вашей инфраструктуре» из урока 3."}]},{title:"Запустите и разберите журнал",md:"Нажмите «Запустить» с пустым входом `{}`. После завершения откройте вкладку «Запуски» и раскройте запуск: список шагов, статус каждого, вход и выход, время выполнения. Подробности есть и во вкладке «Логи». Это и есть отладка по входу и выходу из урока 5: при сбое сразу видно, какой шаг упал и с какими данными к нему пришли."},{title:"Переиспользуйте цепочку",md:"Два способа. В другом workflow добавьте узел «Workflow» и выберите собранную цепочку: финальный шаг внутренней обязан возвращать данные, иначе внешняя получит пустой вход. Или в разделе «MCP-серверы» создайте сервер типа «MCP-сервер с Workflows», выберите цепочку и подключите сервер к текстовому агенту.",blocks:[{t:"p",md:"Для переиспользования удобна маленькая цепочка `kb_search`: принимает `query`, вызывает функцию `reranker` и возвращает один найденный документ или `null`. Выражение в `output` гарантирует, что внутренняя цепочка всегда возвращает данные."},{t:"code",lang:"yaml",title:"kb_search_workflow.yaml",code:e`yawl: "0.1"
start: retrieve_kb
steps:
  retrieve_kb:
    httpCall:
      method: POST
      url: 'https://functions.yandexcloud.net/<ID функции reranker>'
      headers:
        Content-Type: application/json
        Authorization: 'Api-Key \(lockboxPayload("<ID секрета функции>"; "api_key"))'
      body: '\({"query": .query, "top_k": 1})'
      # results[] уже распарсен. Если пустой массив — document: null.
      output: '\({"document": (.results[0] // null)})'
      next: finish_ok
  finish_ok:
    success: {}`},{t:"p",md:"Описание этой цепочки для агента (когда её вызывать, схемы входа и выхода, примеры, поведение на границах) лежит в файле `kb_search_workflow.tool.md` в папке занятия. Там, например, сказано, что агент должен считать `document: null` успешным пустым результатом и не повторять вызов."}]}]},{t:"h3",text:"Проверка сборки"},{t:"checklist",id:"l8-check",items:["Ручной запуск с пустым входом при наличии открытых тикетов доходит до конца, сообщение приходит в Telegram","Запуск при пустой выборке завершается на условии, не тратя вызов функции и токены","Запуск по расписанию без ручного ввода находит те же тикеты и отправляет сообщение","Вложенный вызов из внешнего workflow получает данные, а не пустой вход"]},{t:"h2",text:"Задания"},{t:"p",md:"Заданий три, сложность растёт от первого к третьему."},{t:"card",title:"Задание 1. Минимальная цепочка с отправкой в Telegram",blocks:[{t:"olist",items:["Создайте workflow из трёх шагов: ручной запуск, вызов облачной функции (подойдёт любая готовая, например поиск по репозиторию GitHub) и HTTP-шаг отправки в Telegram.","Свяжите шаги и передайте выход функции в текст сообщения.","Запустите кнопкой «Запустить» и дождитесь сообщения."]},{t:"p",md:"**Зачем**: пройти полный цикл на минимальной цепочке: шаги, связи, передача данных между шагами, проверка запуском из интерфейса. **Ожидаемый результат**: по клику приходит сообщение в Telegram с результатом работы функции."}]},{t:"card",title:"Задание 2. Условие, расписание и вложенность",blocks:[{t:"olist",items:["Поставьте после чтения данных шаг `switch`: при пустой выборке цепочка завершается сразу.","Переведите запуск на расписание раз в день.","Подключите готовый workflow узлом во второй, внешний workflow. Финальный шаг внутреннего должен явно возвращать данные."]},{t:"p",md:"**Зачем**: отработать три механики, на которых держатся рабочие цепочки: защита от пустых запусков, регулярный запуск без входных данных, вложенность. **Ожидаемый результат**: внешний workflow по расписанию вызывает внутренний, пустая выборка не порождает вызовов функции и модели, во вкладке «Запуски» видны оба уровня."}]},{t:"card",title:"Задание 3. Устойчивая цепочка",blocks:[{t:"olist",items:["Для шага с функцией `reranker` добавьте политику повторов: экспоненциальная пауза плюс случайный сдвиг. Шаг только читает данные, поэтому повтор безопасен. Для отправки в Telegram повторы ограничьте: при повторе оператору придёт два одинаковых сообщения.","Разведите реакции по кодам. На 401 и 403 повторов нет: причина в ключе или правах, ошибка уходит в лог. На 429 и 5xx шаг повторяется с паузой и сдвигом, а если ответ содержит `Retry-After`, ждёт столько, сколько в нём указано. Переполнение окна контекста повторами не лечится: на такую ошибку вход уменьшается, например в запрос к агенту передаётся вдвое меньше тикетов или вдвое короче текст каждого.","При недоступности основной модели переключайте вызов на запасную, проверив, что она совместима по поддержке структурированного вывода, окну контекста и качеству.","В лог каждого шага пишите идентификатор запуска, trace ID, время, код ошибки и расход токенов."]},{t:"p",md:"**Зачем**: разные сбои требуют разной реакции, а без логов с расходом токенов инцидент не разобрать. **Ожидаемый результат**: при искусственно вызванных сбоях (неверный ключ, урезанный лимит) цепочка не падает молча, а в журнале видны повторы, смена модели и построчный расход токенов."},{t:"toggle",title:"Подсказки к заданию 3",blocks:[{t:"list",items:["Политика повторов в YaWL задаётся на уровне цепочки и переопределяется у шага: категории ошибок, число попыток, начальная задержка, коэффициент роста, максимальная задержка и шаг, куда перейти после исчерпания попыток. Смотрите пример в уроке 4 и документацию сервиса.","Ветку по коду ошибки удобно сделать шагом `switch` после шага с ошибкой: условие на поле с кодом, дальше либо повтор, либо шаг с логом, либо шаг с уменьшенным входом.","Запасная модель это второй агент AI Studio с другой моделью и той же инструкцией. Шаг `switch` после неудачи основного вызова переводит на него.","Искусственные сбои: подставьте неверный токен бота (401), уберите роль у сервисного аккаунта (403), передайте в агента весь текст без обрезки `.[0:3000]` (переполнение)."]}]}]},{t:"h2",text:"Материалы"},{t:"p",md:"База знаний приложена в двух вариантах, и это одно и то же содержимое в разной форме. Возьмите любой удобный."},{t:"list",items:["**Архив (ZIP):** [disk.360.yandex.ru/d/uYZglsajRWi6_w](https://disk.360.yandex.ru/d/uYZglsajRWi6_w), скачать и распаковать.","**Распакованная папка:** [disk.360.yandex.ru/d/GxGsDSS1M3_fdw](https://disk.360.yandex.ru/d/GxGsDSS1M3_fdw), те же файлы без архива.","Внутри: `hexlet-kb` с папками `start/` (8), `payments/` (8), `code-errors/` (8), у каждой статьи заголовок, исходный адрес и категория; `hexlet-kb.jsonl`, та же база одним файлом для загрузки через API; `INDEX.md`, оглавление со ссылками на источники.","**Код практики:** [папка на Яндекс Диске](https://disk.360.yandex.ru/d/MDDFSxDKCIkNQg): каталог `reranker` с функцией и README, спецификации `kb_digest_workflow.yaml` и `kb_search_workflow.yaml`, описание `kb_search_workflow.tool.md`, схема `ydb_tickets/schema.sql`, пример опроса `telegram_poller.py`. В спецификациях замените идентификаторы базы, функции, агента и номер учебного чата на свои. В скачанных примерах замените шаги вызова функции и отправки сообщения вариантами из этого урока: оба берут секреты из Lockbox.","**Документация:** [Yandex Cloud Workflows](https://yandex.cloud/ru/docs/serverless-integrations/concepts/workflows/)."]},{t:"quiz",id:"q8",title:"Проверьте себя",questions:[{q:'Что делает выражение `\\({"tickets": .ResultSets[0]})` в поле `output`?',options:["Удаляет тикеты","Кладёт первую таблицу результата запроса в состояние под именем tickets","Проверяет, что тикеты есть","Отправляет тикеты в Telegram"],answer:1,why:"Обёртка `\\( … )` это шаблон, который добавляет данные в состояние запуска."},{q:"Почему условие `switch` смотрит на `.tickets`, а не на вход запуска?",options:["Так быстрее","Чтобы одинаково работать при ручном запуске с пустым входом и по расписанию","Вход запуска недоступен","Это требование YAML"],answer:1,why:"Цепочка берёт данные сама из базы, поэтому решение принимается по результату запроса."},{q:"Зачем цепочке функция reranker, если есть поисковый инструмент агента?",options:["Функция быстрее","Агент работает только с одним индексом, а функция обходит все и выбирает лучшее","Поиск агента платный","Функция не нужна"],answer:1,why:"Код-прослойка обходит ограничение платформы и заодно переупорядочивает результаты судьёй."},{q:"Что вернёт функция, если судья дважды ответил не тем форматом?",options:["Ошибку 500, цепочка упадёт","Кандидатов в исходном порядке с judge_used: false","Пустой список","Случайный порядок"],answer:1,why:"Запасной путь вместо падения: это приём из урока 4."}]}]})})();const o=s[0];export{o as default};
