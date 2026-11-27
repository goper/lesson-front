const t=[];(function(){const e=String.raw;t.push({id:"l4",num:4,minutes:45,title:"Надёжность: ошибки, повторы и запасные варианты",goal:"Научиться различать виды отказов и подбирать каждому свою реакцию: повтор, исправление входа, запасной путь или остановку.",blocks:[{t:"story",title:"Два тикета с разницей в четыре секунды",md:"Клиент получил два одинаковых тикета. В логах видно: запрос на создание завершился таймаутом, и обработчик честно сделал повтор по правилу «при ошибке повторить». Тикет к этому моменту **уже был создан**. Оборвалось соединение, а не операция."},{t:"flow",title:"Как повтор создал второй тикет",cw:190,ch:72,nw:166,nodes:[{id:"a",label:"create_ticket()",kind:"code",x:0,y:0},{id:"b",label:"тикет создан",kind:"ok",x:0,y:1},{id:"c",label:"соединение оборвалось",kind:"bad",x:0,y:2},{id:"d",label:"клиент видит timeout",kind:"code",x:0,y:3},{id:"e",label:"retry → второй тикет",kind:"bad",x:0,y:4}],edges:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"d"},{from:"d",to:"e",label:"по правилу"}]},{t:"p",md:"Правило «при ошибке повторить запрос» выглядит безобидным ровно до такого случая. Иногда повтор помогает, иногда впустую жжёт ресурсы, а иногда создаёт второй тикет или второй платёж."},{t:"key",md:"Надёжность определяется не количеством повторов, а тем, умеет ли система различать причины ошибок и выбирать под каждую свою реакцию."},{t:"simple",md:"Вы звоните другу с просьбой. Занято: перезвонить через минуту разумно. Номер не существует: перезванивать бессмысленно, надо искать правильный номер. Друг всё сделал, но связь оборвалась на его «готово»: если вы перезвоните и попросите снова, он сделает дважды. Три разные ситуации, три разные реакции. Одно правило «не дозвонился, звони ещё» подходит только для первой."},{t:"h2",text:"Временная ошибка или постоянная"},{t:"p",md:"Перед любым повтором задаётся один вопрос: **есть ли разумная вероятность, что тот же запрос через некоторое время пройдёт успешно без изменения содержания?**"},{t:"table",head:["Ответ","Вид ошибки","Примеры","Реакция"],rows:[["Да","временная (восстановимая)","сетевой таймаут, сервис недоступен, ограничение частоты (429), часть ошибок 5xx","повтор с паузой"],["Нет","постоянная (невосстановимая)","неверный ключ (401), нет прав (403), невалидный запрос (400), переполненный контекст модели","чинить причину или менять вход; повтор бесполезен"]]},{t:"p",md:"Неверные учётные данные не станут правильными через пять секунд ожидания. Поэтому делить ошибки полезно не на «HTTP против LLM», а на восстановимые и невосстановимые."},{t:"sim",kind:"errclass",title:"Какая реакция уместна?",md:"Для каждой ошибки выберите реакцию. Ответ объясняется сразу."},{t:"h2",text:"Повтор ограничивают с трёх сторон"},{t:"p",md:"Бесконечные попытки только добивают проблемную зависимость, а немедленный повтор добавляет нагрузку уже перегруженному сервису. Политика повторов задаёт три вещи сразу: **какие ошибки повторять**, **сколько попыток максимум** и **как растёт пауза** (плюс её потолок)."},{t:"list",items:["**Фиксированная пауза**: 1 → 1 → 1 с. Просто и грубо.","**Экспоненциальная (exponential backoff)**: 1 → 2 → 4 → 8 с. Даёт сервису время подняться.","**Экспоненциальная с jitter**: к каждой паузе добавляют случайный сдвиг. Иначе все клиенты, упавшие в одну секунду, повторят тоже в одну секунду и устроят новую волну нагрузки сразу после первой."]},{t:"sim",kind:"retry",title:"Толпа клиентов и лежащий сервис",md:"Двадцать клиентов получили ошибку одновременно. Сравните три политики: смотрите на столбики «запросов в секунду». Чем они ниже и ровнее, тем легче сервису подняться."},{t:"tabs",title:"Повтор с экспоненциальной паузой и jitter",run:!0,langs:{php:e`<?php
// Повтор с экспоненциальной паузой и jitter. Повторяем только временные ошибки и не бесконечно.
// В Symfony HttpClient это умеет RetryableHttpClient; ниже та же логика руками, чтобы было видно решение.
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

final class Retry
{
    private const RETRYABLE = [408, 429, 500, 502, 503, 504];

    public static function run(callable $fn, int $attempts = 4, int $baseMs = 200, int $maxMs = 5000): mixed
    {
        for ($attempt = 1; ; $attempt++) {
            try {
                return $fn();
            } catch (TransportExceptionInterface $e) {           // таймаут, обрыв сети → временная
                $retryable = true; $retryAfter = null; $code = 'network';
            } catch (HttpExceptionInterface $e) {                // ответ с кодом
                $code       = $e->getResponse()->getStatusCode();
                $retryable  = in_array($code, self::RETRYABLE, true);
                $retryAfter = $e->getResponse()->getHeaders(false)['retry-after'][0] ?? null;
            }
            if (!$retryable || $attempt >= $attempts) {
                throw $e;                                        // постоянная ошибка или попытки кончились
            }
            $exp   = min($maxMs, $baseMs * 2 ** ($attempt - 1));  // 200 → 400 → 800 → …
            $delay = $retryAfter !== null
                ? (int) $retryAfter * 1000                        // Retry-After важнее нашей формулы
                : random_int(0, $exp);                            // иначе jitter: случайная пауза до потолка
            error_log("попытка $attempt не удалась ($code), ждём $delay мс");
            usleep($delay * 1000);
        }
    }
}

// Готовый вариант через конфигурацию (config/packages/framework.yaml):
// framework:
//   http_client:
//     scoped_clients:
//       ai.client:
//         base_uri: '%env(AI_BASE_URL)%'
//         retry_failed: { max_retries: 3, delay: 200, multiplier: 2, max_delay: 5000, jitter: 0.3,
//                         http_codes: [408, 429, 500, 502, 503, 504] }`,js:e`// Повтор с экспоненциальной паузой и jitter. Повторяем только временные ошибки и не бесконечно.
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

async function withRetry(fn, { attempts = 4, baseMs = 200, maxMs = 5000 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const retryable = e.code === 'ETIMEDOUT' || RETRYABLE.has(e.status);
      if (!retryable || attempt >= attempts) throw e;            // постоянная ошибка или попытки кончились
      const exp   = Math.min(maxMs, baseMs * 2 ** (attempt - 1)); // 200 → 400 → 800 → …
      const delay = e.retryAfterMs ?? Math.random() * exp;        // Retry-After важнее формулы; иначе jitter
      console.log('попытка', attempt, 'не удалась (' + (e.status ?? e.code) + '), ждём', Math.round(delay), 'мс');
      await sleep(delay);
    }
  }
}

// имитация сервиса: два раза 503, потом успех
let calls = 0;
const flaky = async () => { calls++; if (calls < 3) throw Object.assign(new Error('unavailable'), { status: 503 }); return 'ответ сервиса'; };
console.log('результат:', await withRetry(flaky), '· вызовов:', calls);

// постоянная ошибка: повторов нет
try { await withRetry(async () => { throw Object.assign(new Error('forbidden'), { status: 403 }); }); }
catch (e) { console.log('403 → без повторов, сразу наверх:', e.message); }`,py:e`# Повтор с экспоненциальной паузой и jitter. Повторяем только временные ошибки и не бесконечно.
import random, time
import httpx

RETRYABLE = {408, 429, 500, 502, 503, 504}

def with_retry(fn, attempts: int = 4, base: float = 0.2, max_delay: float = 5.0):
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except httpx.TimeoutException:                       # таймаут → временная
            retryable, retry_after, code = True, None, "timeout"
        except httpx.HTTPStatusError as e:                   # ответ с кодом
            code = e.response.status_code
            retryable = code in RETRYABLE
            retry_after = e.response.headers.get("Retry-After")
        if not retryable or attempt == attempts:
            raise                                             # постоянная ошибка или попытки кончились
        exp = min(max_delay, base * 2 ** (attempt - 1))       # 0.2 → 0.4 → 0.8 → …
        delay = float(retry_after) if retry_after else random.uniform(0, exp)   # Retry-After важнее формулы; иначе jitter
        print(f"попытка {attempt} не удалась ({code}), ждём {delay:.2f} с")
        time.sleep(delay)

# Готовая библиотека: tenacity
# @retry(stop=stop_after_attempt(4), wait=wait_random_exponential(multiplier=0.2, max=5),
#        retry=retry_if_exception(is_transient))`}},{t:"p",md:"**HTTP-код помогает, но политику не задаёт.** Он подсказывает вид ошибки, а решение всё равно за вами и документацией конкретного API."},{t:"table",head:["Код","Что значит","Повторять?"],rows:[["401","проблема с аутентификацией (ключ)","нет: с тем же ключом ничего не изменится"],["403","нет прав","нет: чинить права, а не ждать"],["429","слишком часто, сервис просит сбавить","да, с паузой. Если есть заголовок `Retry-After`, ждать ровно столько"],["5xx","ошибка на стороне сервера","часто да, но аккуратно: по документации API и типу операции"],["таймаут","ответ не пришёл вовремя","да для чтения; для изменяющих операций сначала убедиться в безопасности повтора (ниже)"]]},{t:"h2",text:"Ошибки, которые повтор не лечит"},{t:"h3",text:"Переполненный контекст"},{t:"p",md:"Когда вход не помещается в **окно контекста** модели (максимальный объём токенов, который она принимает за один вызов), тот же запрос будет падать столько раз, сколько вы его отправите, просто дороже и медленнее. Лечится это изменением самой обработки: убрать лишний контекст, забрать только нужные документы, разбить данные на части, сжать историю или перейти на поиск по базе знаний (retrieval) вместо передачи всей базы."},{t:"tip",md:"Считать токены нужно средствами той модели, с которой работаете, а не по словам, по байтам или по правилам другой модели. У разных моделей разные токенизаторы."},{t:"h3",text:"Неверный ответ при успешном статусе"},{t:"p",md:"Код 200 от провайдера означает, что запрос обработан, и ничего не говорит о содержании. Модель может пропустить обязательное поле, вернуть значение не того типа, придумать идентификатор, нарушить бизнес-правило или выбрать неподходящий инструмент. Поэтому после вызова идёт отдельный шаг проверки: сначала структурная (форма), потом смысловая (содержание). Подробно эти проверки разобраны в уроке 2."},{t:"flow",title:"После вызова модели: две проверки и два исхода",cw:170,ch:72,nw:146,legend:["model","code"],nodes:[{id:"m",label:"модель",kind:"model",x:1,y:0},{id:"s",label:"проверка схемы",kind:"code",x:1,y:1},{id:"b",label:"проверка смысла",kind:"code",x:1,y:2},{id:"ok",label:"следующий шаг",kind:"ok",x:0,y:3},{id:"bad",label:`corrective retry
или ошибка`,kind:"bad",x:2,y:3}],edges:[{from:"m",to:"s"},{from:"s",to:"b",label:"форма ок"},{from:"b",to:"ok",label:"валидно"},{from:"b",to:"bad",label:"невалидно"},{from:"s",to:"bad",label:"форма ✗",kind:"dashed"}]},{t:"p",md:"**Corrective retry** (исправляющий повтор) отличается от обычного тем, что модель получает конкретную причину отказа, а не просто просьбу попробовать ещё раз. Такой повтор осмысленнее слепой перегенерации, но и он ограничен по числу попыток: если модель продолжает нарушать критичное правило, шаг завершается ошибкой или уходит в запасную ветку. Программные гарантии он не заменяет: идентификаторы, права доступа и лимиты остаются на коде."},{t:"tabs",title:"Corrective retry: повтор с указанием ошибки и лимитом попыток",run:!0,langs:{php:e`<?php
// Corrective retry: повтор с указанием, что именно было не так. Число попыток ограничено.
final class ReviewWithCorrection
{
    public function __construct(private ReviewModel $model, private ReviewChecker $checker) {}

    public function run(string $prompt, int $maxAttempts = 2): array
    {
        $feedback = null;
        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            $raw   = $this->model->review($prompt . ($feedback ? "\n\n$feedback" : ''));
            $check = $this->checker->checkSchema($raw);
            if ($check['ok']) {
                return $check['value'];
            }
            error_log("попытка $attempt ✗ {$check['error']} → повторяем с указанием ошибки");
            $feedback = "В прошлом ответе ошибка: {$check['error']}. Верни исправленный JSON.";
        }
        throw new \RuntimeException("модель не исправилась за $maxAttempts попытки → error path");
    }
}`,js:e`// Corrective retry: повтор с указанием, что именно было не так. Число попыток ограничено.
async function callModel(prompt, feedback) {                 // имитация модели
  if (!feedback) return '{"summary": "SQL без параметров", "issues": []}';          // забыла severity
  return '{"severity": "high", "summary": "SQL без параметров", "issues": []}';      // с подсказкой исправилась
}
function validate(raw) {
  const obj = JSON.parse(raw);
  return ['low', 'medium', 'high'].includes(obj.severity) ? null : 'нет поля severity (low|medium|high)';
}

async function reviewWithCorrection(prompt, maxAttempts = 2) {
  let feedback = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const raw = await callModel(prompt, feedback);
    const error = validate(raw);
    if (!error) { console.log('попытка', attempt, '✓'); return JSON.parse(raw); }
    console.log('попытка', attempt, '✗', error, '→ повторяем с указанием ошибки');
    feedback = 'В прошлом ответе ошибка: ' + error + '. Верни исправленный JSON.';
  }
  throw new Error('модель не исправилась за ' + maxAttempts + ' попытки → error path');
}

console.log(await reviewWithCorrection('проверь diff'));`,py:e`# Corrective retry: повтор с указанием, что именно было не так. Число попыток ограничено.
def review_with_correction(prompt: str, max_attempts: int = 2) -> Review:
    feedback = None
    for attempt in range(1, max_attempts + 1):
        raw = call_model(prompt if feedback is None else f"{prompt}\n\n{feedback}")
        try:
            return Review.model_validate_json(raw)           # структурная проверка (pydantic)
        except ValidationError as e:
            error = e.errors()[0]["msg"]
            print(f"попытка {attempt} ✗ {error} → повторяем с указанием ошибки")
            feedback = f"В прошлом ответе ошибка: {error}. Верни исправленный JSON."
    raise RuntimeError(f"модель не исправилась за {max_attempts} попытки → error path")`}},{t:"h2",text:"Повтор безопасен не всегда"},{t:"p",md:"**Идемпотентность** это свойство операции, при котором повтор того же логического запроса не создаёт дополнительного эффекта. Прочитать данные можно сто раз, и ничего не изменится. Создать тикет сто раз это сто тикетов. Именно идемпотентности не хватало в истории с двумя тикетами: клиент не знал, что операция уже прошла, и повторил её."},{t:"p",md:"Работает это через **идентификатор операции**, который отправляется вместе с запросом и с каждым его повтором. Принимающая система видит знакомый идентификатор и понимает, что новой операции нет, а возвращает результат старой. Если API таких ключей не поддерживает, приложение хранит собственный идентификатор или перед повтором проверяет, не создан ли результат уже."},{t:"sim",kind:"idem",title:"Таймаут после создания: с ключом и без",md:"Нажмите кнопку в обоих режимах и сравните, сколько тикетов окажется в системе после повтора."},{t:"tabs",title:"Ключ идемпотентности: клиент шлёт, сервер проверяет",run:!0,langs:{php:e`<?php
// Идемпотентность: повтор с тем же ключом операции не создаёт второй тикет.

// СТОРОНА КЛИЕНТА: ключ выводится из самой операции, поэтому при повторе он тот же.
final class TicketClient
{
    public function __construct(private HttpClientInterface $crm) {}

    public function create(string $prId, string $text): array
    {
        $key = 'review-pr-' . $prId;                                  // стабильный ключ операции
        return $this->crm->request('POST', '/tickets', [
            'headers' => ['Idempotency-Key' => $key],
            'json'    => ['text' => $text],
        ])->toArray();   // повтор по таймауту (см. Retry::run) уйдёт с тем же заголовком
    }
}

// СТОРОНА СЕРВЕРА (если CRM ваша): таблица tickets с UNIQUE(idempotency_key).
#[Route('/tickets', methods: ['POST'])]
public function create(Request $request, Connection $db): JsonResponse
{
    $key = $request->headers->get('Idempotency-Key');
    if ($key && ($existing = $db->fetchAssociative('SELECT id FROM tickets WHERE idempotency_key = ?', [$key]))) {
        return new JsonResponse($existing, 200);                      // уже делали: отдаём старый
    }
    $id = $this->tickets->insert($request->toArray()['text'], $key);  // UNIQUE не даст вставить дважды даже при гонке
    return new JsonResponse(['id' => $id], 201);
}`,js:e`// Идемпотентность: повтор с тем же ключом операции не создаёт второй тикет.
const server = { tickets: [], byKey: new Map() };            // внешняя система (CRM)

function createTicket(req) {                                 // POST /tickets
  const key = req.headers['idempotency-key'];
  if (key && server.byKey.has(key)) return { status: 200, ticket: server.byKey.get(key) };   // уже делали
  const ticket = { id: 'T-' + (server.tickets.length + 1), text: req.body.text };
  server.tickets.push(ticket);
  if (key) server.byKey.set(key, ticket);
  return { status: 201, ticket };
}

// клиент: ключ выводится из операции, поэтому при повторе он тот же
const req = { headers: { 'idempotency-key': 'review-pr-42' }, body: { text: 'SQL без параметров' } };
createTicket(req);                                           // ответ потерялся по дороге (таймаут)
const again = createTicket(req);                             // клиент повторил с тем же ключом
console.log('ответ на повтор:', again.status, again.ticket.id, '· тикетов в системе:', server.tickets.length);

// без ключа:
createTicket({ headers: {}, body: { text: 'ещё раз' } });
createTicket({ headers: {}, body: { text: 'ещё раз' } });
console.log('без ключа после двух вызовов тикетов стало:', server.tickets.length);`,py:e`# Идемпотентность: повтор с тем же ключом операции не создаёт второй тикет.

# СТОРОНА КЛИЕНТА: ключ выводится из самой операции, поэтому при повторе он тот же.
def create_ticket(client: httpx.Client, pr_id: str, text: str) -> dict:
    key = f"review-pr-{pr_id}"                                  # стабильный ключ операции
    resp = client.post("/tickets", json={"text": text}, headers={"Idempotency-Key": key})
    resp.raise_for_status()
    return resp.json()   # повтор по таймауту (см. with_retry) уйдёт с тем же заголовком

# СТОРОНА СЕРВЕРА (если CRM ваша): таблица tickets с UNIQUE(idempotency_key).
@app.post("/tickets")
def create(payload: dict, idempotency_key: str | None = Header(default=None)):
    if idempotency_key and (existing := db.find_by_key(idempotency_key)):
        return JSONResponse(existing, status_code=200)          # уже делали: отдаём старый
    ticket = db.insert(payload["text"], idempotency_key)        # UNIQUE не даст вставить дважды даже при гонке
    return JSONResponse(ticket, status_code=201)`}},{t:"key",md:"Повтор безопасен только тогда, когда вы понимаете, что произойдёт при повторном выполнении операции."},{t:"h3",text:"Частичный сбой"},{t:"p",md:"Та же проблема на уровне всей цепочки. Часть шагов отработала, а следующий упал."},{t:"flow",title:"Частичный сбой: перезапуск с начала отправит второе уведомление",cw:200,ch:70,nw:176,nodes:[{id:"a",label:"черновик сохранён ✓",kind:"ok",x:0,y:0},{id:"b",label:"уведомление отправлено ✓",kind:"ok",x:0,y:1},{id:"c",label:"тикет создан ✗",kind:"bad",x:0,y:2},{id:"r",label:"перезапуск с начала",kind:"code",x:1,y:2},{id:"b2",label:"второе уведомление",kind:"bad",x:1,y:1}],edges:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"r",kind:"dashed"},{from:"r",to:"b2",kind:"bad",label:"повторит шаги 1 и 2"}]},{t:"p",md:"Перед повтором цепочка читает сохранённые отметки и пропускает завершённые шаги. Но между отправкой уведомления и записью отметки процесс может упасть. Тогда получатель уже увидел сообщение, а в базе шаг ещё не завершён. Для безопасного повтора передавайте получателю тот же ключ операции. Если получатель не поддерживает такие ключи, проверьте результат перед повторной отправкой."},{t:"tabs",title:"Отметки о выполненных шагах: перезапуск пропускает сделанное",run:!0,langs:{php:e`<?php
// Частичный сбой: храним, какие шаги уже завершены, и при перезапуске их пропускаем.
final class DigestRun
{
    /** @param array<string, callable> $steps имя шага → действие */
    public function __construct(private RunStateStore $state, private array $steps) {}

    public function run(string $executionId): void
    {
        $done = $this->state->load($executionId);                 // ['saveDraft' => 'draft-1', …] из базы
        foreach ($this->steps as $name => $step) {
            if (array_key_exists($name, $done)) {
                error_log("$name → уже сделано, пропускаем");
                continue;
            }
            $done[$name] = $step($done);                           // упадёт → остальное не выполнится
            $this->state->save($executionId, $done);              // отметка сразу после шага
            error_log("$name → {$done[$name]}");
        }
    }
}
// Первый запуск: saveDraft ✓, notify ✓, createTicket ✗ (CRM 503).
// Перезапуск после починки CRM: saveDraft и notify пропущены, второе уведомление не уходит.`,js:e`// Частичный сбой: храним, какие шаги уже завершены, и при перезапуске их пропускаем.
const state = { done: {} };                                   // в проде: состояние запуска в базе
let crmAlive = false;
const steps = {
  saveDraft:    async () => 'draft-1',
  notify:       async () => 'уведомление отправлено',
  createTicket: async () => { if (!crmAlive) throw new Error('CRM: 503'); return 'T-9'; },
};

async function run() {
  for (const [name, fn] of Object.entries(steps)) {
    if (Object.hasOwn(state.done, name)) { console.log(name, '→ уже сделано, пропускаем'); continue; }
    state.done[name] = await fn();                             // упадёт → остальное не выполнится
    console.log(name, '→', state.done[name]);
  }
}

try { await run(); } catch (e) { console.log('запуск упал:', e.message); }
crmAlive = true;                                              // CRM починили
console.log('--- перезапуск');
await run();                                                  // второе уведомление НЕ уходит`,py:e`# Частичный сбой: храним, какие шаги уже завершены, и при перезапуске их пропускаем.
def run(execution_id: str, steps: dict[str, Callable]) -> None:
    done = state_store.load(execution_id)                  # {"saveDraft": "draft-1", ...} из базы
    for name, step in steps.items():
        if name in done:
            print(f"{name} → уже сделано, пропускаем")
            continue
        done[name] = step(done)                             # упадёт → остальное не выполнится
        state_store.save(execution_id, done)                # отметка сразу после шага
        print(f"{name} → {done[name]}")

# Первый запуск: saveDraft ✓, notify ✓, createTicket ✗ (CRM 503).
# Перезапуск после починки CRM: saveDraft и notify пропущены, второе уведомление не уходит.`}},{t:"h2",text:"Куда идти, когда попытки кончились"},{t:"p",md:"**Fallback** (запасной путь) это другой способ выполнить операцию, когда основной недоступен: например, запасная модель или другой провайдер. Доступность он поднимает, но только если запасной вариант **совместим** с требованиями. Другая модель может отличаться поддержкой структурированного вывода, вызовом инструментов, окном контекста, задержкой и качеством. Поэтому запасной путь проверяют так же, как основной. И проектируют его отдельно для каждой зависимости: недоступность CRM переключением модели не лечится."},{t:"tabs",title:"Запасная модель с проверкой совместимости",run:!0,langs:{php:e`<?php
// Fallback: запасная модель, но только совместимая по формату ответа.
final class ReviewWithFallback
{
    public function __construct(private ReviewModel $primary, private ReviewModel $fallback, private ReviewChecker $checker) {}

    public function review(string $diff, array $meta): array
    {
        try {
            return ['from' => 'primary', 'raw' => $this->primary->review($diff, $meta)];
        } catch (HttpExceptionInterface $e) {
            if ($e->getResponse()->getStatusCode() !== 503) {
                throw $e;                                              // не всякая ошибка ведёт к запасному пути
            }
            error_log('основная модель недоступна → запасная');
            $raw = $this->fallback->review($diff, $meta);
            if (!$this->checker->checkSchema($raw)['ok']) {            // запасная должна отдавать тот же формат
                throw new \RuntimeException('запасная модель несовместима по формату → error path (оператор)');
            }
            return ['from' => 'fallback', 'raw' => $raw];
        }
    }
}`,js:e`// Fallback: запасная модель, но только совместимая по формату ответа.
const primary  = async () => { throw Object.assign(new Error('provider down'), { status: 503 }); };
const fallback = async () => '{"severity": "medium", "summary": "резервная модель", "issues": []}';
const isCompatible = (raw) => { try { return typeof JSON.parse(raw).severity === 'string'; } catch { return false; } };

async function review() {
  try { return { from: 'primary', raw: await primary() }; }
  catch (e) {
    if (e.status !== 503) throw e;                            // не всякая ошибка ведёт к запасному пути
    console.log('основная модель недоступна → запасная');
    const raw = await fallback();
    if (!isCompatible(raw)) throw new Error('запасная модель несовместима по формату → error path (оператор)');
    return { from: 'fallback', raw };
  }
}

console.log(await review());`,py:e`# Fallback: запасная модель, но только совместимая по формату ответа.
def review(diff: str, meta: dict) -> dict:
    try:
        return {"from": "primary", "raw": primary.review(diff, meta)}
    except httpx.HTTPStatusError as e:
        if e.response.status_code != 503:
            raise                                                   # не всякая ошибка ведёт к запасному пути
        print("основная модель недоступна → запасная")
        raw = fallback.review(diff, meta)
        try:
            Review.model_validate_json(raw)                         # запасная должна отдавать тот же формат
        except ValidationError:
            raise RuntimeError("запасная модель несовместима по формату → error path (оператор)")
        return {"from": "fallback", "raw": raw}`}},{t:"p",md:"**Error path** (маршрут ошибки) это заранее определённый путь после отказа, и он зависит от причины. Некорректный ввод возвращается пользователю сразу. Временный сбой проходит через повторы. Критичный невосстановимый уходит на ручную проверку."},{t:"flow",title:"Маршрут после исчерпания попыток",cw:170,ch:76,nw:146,legend:["model","decision","human"],nodes:[{id:"a",label:`провайдер модели
недоступен`,kind:"bad",x:1,y:0},{id:"b",label:`повторы
исчерпаны`,kind:"code",x:1,y:1},{id:"d",label:"есть fallback?",kind:"decision",x:1,y:2},{id:"f",label:"запасная модель",kind:"model",x:0,y:3},{id:"s",label:`сохранить
failure`,kind:"store",x:2,y:3},{id:"h",label:`уведомить
оператора`,kind:"human",x:2,y:4}],edges:[{from:"a",to:"b"},{from:"b",to:"d"},{from:"d",to:"f",label:"да"},{from:"d",to:"s",label:"нет"},{from:"s",to:"h"}]},{t:"toggle",title:"В Yandex Workflows: политика повторов и маршрут ошибки",blocks:[{t:"p",md:"В Yandex Workflows политика повторов задаётся на уровне всей цепочки и может переопределяться для отдельных шагов. Настраиваются категории ошибок, которые повторять, максимальное число попыток, начальная задержка, коэффициент роста паузы (backoff) и максимальная задержка. После исчерпания попыток задаётся переход на другой шаг. По смыслу спецификация выглядит так (точные имена полей сверьте с документацией сервиса):"},{t:"code",lang:"yaml",title:"YaWL, по смыслу",code:e`steps:
  retrieve_kb:
    httpCall:
      url: https://functions.yandexcloud.net/<id>
      # политика повторов для этого шага: только временные ошибки, 3 попытки, пауза растёт вдвое
      retryPolicy:
        errorList: [TIMEOUT, HTTP_5XX]      # какие категории повторять
        retryCount: 3
        initialDelay: 1s
        backoffRate: 2.0
        maxDelay: 30s
      # после исчерпания попыток — переход на шаг обработки ошибки, а не падение всей цепочки
      errorStep: notify_operator
      next: build_digest`},{t:"p",md:"Политику и маршрут ошибки проектируют вместе: политика без маршрута оставляет цепочку висеть, маршрут без политики срабатывает на первом же таймауте."}]},{t:"h2",text:"Главное"},{t:"key",md:"Надёжная цепочка не прячет ошибки за повторами. Она сначала классифицирует сбой и только потом выбирает реакцию."},{t:"flow",title:"Дерево решений при сбое",cw:180,ch:80,nw:156,legend:["decision","code","bad"],nodes:[{id:"f",label:"сбой",kind:"bad",x:1,y:0},{id:"q1",label:"временный?",kind:"decision",x:1,y:1},{id:"fix",label:`изменить вход /
конфигурацию / error path`,kind:"code",x:2,y:2,w:176},{id:"q2",label:`повтор
безопасен?`,kind:"decision",x:0,y:2},{id:"idem",label:`добавить ключ
операции`,kind:"code",x:0,y:3},{id:"rp",label:"retry policy",kind:"code",x:1,y:3},{id:"q3",label:"помогло?",kind:"decision",x:1,y:4},{id:"fb",label:`fallback /
error path`,kind:"code",x:2,y:5},{id:"ok",label:"дальше",kind:"ok",x:0,y:5}],edges:[{from:"f",to:"q1"},{from:"q1",to:"fix",label:"нет"},{from:"q1",to:"q2",label:"да"},{from:"q2",to:"idem",label:"нет"},{from:"idem",to:"rp"},{from:"q2",to:"rp",label:"да"},{from:"rp",to:"q3"},{from:"q3",to:"ok",label:"да"},{from:"q3",to:"fb",label:"нет"}],intro:"Пройдите дерево по шагам.",steps:[{on:["f","q1"],e:["f>q1"],text:"Первый вопрос: пройдёт ли тот же запрос позже без изменений? Если нет, повтор не нужен."},{on:["q1","fix"],e:["q1>fix"],text:"Постоянная ошибка: меняем вход (слишком большой контекст), конфигурацию (ключ, права) или уходим по маршруту ошибки."},{on:["q1","q2"],e:["q1>q2"],text:"Временная ошибка: второй вопрос, безопасно ли повторять? Чтение безопасно, создание и оплата нет."},{on:["q2","idem","rp"],e:["q2>idem","idem>rp","q2>rp"],text:"Если повтор небезопасен, сначала добавляем ключ операции. Потом применяем политику: какие ошибки, сколько попыток, как растёт пауза."},{on:["rp","q3","ok","fb"],e:["rp>q3","q3>ok","q3>fb"],text:"Помогло: идём дальше. Не помогло: запасной путь или заранее определённый маршрут ошибки, а не вечные повторы."}]},{t:"p",md:"Каждый внешний и недетерминированный шаг стоит прогнать по пяти вопросам ещё на этапе проектирования. Что здесь может пойти не так? Может ли тот же запрос пройти позже? Безопасно ли повторять операцию? Сколько попыток допустимо? Что произойдёт после последней попытки? Для модели добавляется шестой: технически успешный вызов обязан пройти и структурную, и смысловую проверку, потому что код 200 о качестве ответа не говорит."},{t:"p",md:"Стратегии ошибок определены. Остаётся понять, как увидеть, какой путь фактически прошёл конкретный запуск и почему он закончился именно так. Об этом следующий урок."},{t:"toggle",title:"Самостоятельная работа: разложите отказы своей цепочки",blocks:[{t:"olist",items:["Выпишите все места, где цепочка может сломаться. Считайте не только модель, но и базу, внешние API и отправку результата.","Разделите отказы на временные и постоянные вопросом «изменится ли что-то, если повторить через минуту?».","Для временных задайте политику: число попыток, рост паузы, наличие случайного сдвига. Объясните, зачем нужен сдвиг.","Опишите один случай, когда модель вернула 200 и валидную структуру, но неверное содержание, и проверку, которая это поймает.","Для одной зависимости опишите запасной путь и проверьте, что он совместим по формату ответа.","Найдите место, где первое действие уже выполнилось, а второе упало, и опишите, что нужно, чтобы перезапуск не выполнил первое дважды."]},{t:"checklist",id:"l4-self",items:["Выписаны все места, где цепочка может сломаться, включая базу и отправку","Отказы разделены на временные и постоянные","Для временных задана политика повтора","Объяснено, зачем нужен случайный сдвиг","Описан успех с неверным содержанием и проверка","Описан совместимый запасной путь","Найден частичный сбой и описана защита от повторного выполнения"]}]},{t:"quiz",id:"q4",title:"Проверьте себя",questions:[{q:"В истории шага три попытки подряд с кодом `403 Forbidden` и растущими паузами между ними. Что здесь уместно?",options:["Увеличить число попыток и максимальную паузу","Добавить jitter","Убрать повторы для этого кода и заняться правами сервисного аккаунта","Переключиться на запасную модель"],answer:2,why:"403 это постоянная ошибка: права от повтора не появятся. Повторы здесь только жгут время."},{q:"Вызов `create_ticket()` завершился таймаутом, но тикет во внешней системе уже создан. Цепочка собирается повторить шаг. Что сделает повтор безопасным?",options:["Увеличить таймаут","Ключ операции (идемпотентность): по нему система узнает уже созданный тикет","Повторить только один раз","Повторить через час"],answer:1,why:"С ключом операции повтор возвращает старый тикет вместо создания нового."},{q:"Черновик сохранён, уведомление отправлено, создание тикета упало. Дежурный предлагает перезапустить цепочку с начала. Чем плох этот вариант?",options:["Перезапуск слишком медленный","Первые два действия выполнятся повторно: уйдёт второе уведомление","Тикет всё равно не создастся","Ничем, это нормально"],answer:1,why:"Нужно хранить состояние выполненных шагов и повторять только упавший шаг."},{q:"Модель вернула объект без обязательного поля `severity`, структурная проверка это поймала. Как разумно построить реакцию?",options:["Сразу отправить результат дальше","Повтор с указанием ошибки (corrective retry), с лимитом попыток, затем error path","Бесконечно повторять, пока не исправится","Отключить проверку"],answer:1,why:"Модель получает конкретную причину отказа. Но число попыток ограничено: если не исправилась, шаг завершается ошибкой или уходит в запасную ветку."},{q:"Шаг падает с переполнением окна контекста: в промпт попадает вся база знаний. Retry policy настроена на три попытки с backoff. Что поможет?",options:["Увеличить число попыток до десяти","Добавить jitter","Уменьшить вход: передавать только нужные документы (retrieval), резать и сжимать","Сменить HTTP-клиент"],answer:2,why:"Это постоянная ошибка для данного входа: тот же промпт упрётся в тот же предел. Повтор не лечит, лечит изменение обработки."},{q:"Зачем к экспоненциальной паузе добавляют jitter (случайный сдвиг)?",options:["Чтобы повторы были быстрее","Чтобы клиенты не повторяли запрос одновременно и не создавали новую волну нагрузки","Чтобы сократить число попыток","Это требование HTTP"],answer:1,why:"Без сдвига все клиенты, упавшие в одну секунду, повторят тоже в одну секунду."}]}]})})();const r=t[0];export{r as default};
