const t=[];(function(){const e=String.raw;t.push({id:"l2",num:2,minutes:40,title:"Структура: шаги и граница между кодом и моделью",goal:"Разложить работу приложения на шаги с явными входами и выходами и понять, что делает код, а что модель.",blocks:[{t:"story",title:"Девять шагов бота, который проверяет код",md:"Вернёмся к боту из введения. Чтобы получить комментарий к pull request, он на самом деле делает девять действий. Вызов модели среди них один. Остальные восемь это обычный код, который должен работать одинаково каждый раз."},{t:"flow",title:"Бот ревью кода: девять шагов, одна модель",legend:["code","model","ext"],cw:180,ch:100,nw:156,nodes:[{id:"s1",label:`1. подходит ли PR
под правила`,kind:"code",x:0,y:0},{id:"s2",label:"2. достать diff",kind:"ext",x:1,y:0},{id:"s3",label:`3. обрезать diff
до лимита`,kind:"code",x:2,y:0},{id:"s4",label:`4. подтянуть данные
репозитория`,kind:"ext",x:0,y:1},{id:"s5",label:"5. собрать промпт",kind:"code",x:1,y:1},{id:"s6",label:`6. сходить
в модель`,kind:"model",x:2,y:1},{id:"s7",label:`7. разобрать ответ
(JSON)`,kind:"code",x:0,y:2},{id:"s8",label:`8. строки из ответа
есть в diff?`,kind:"code",x:1,y:2},{id:"s9",label:`9. отправить
комментарий`,kind:"ext",x:2,y:2}],edges:[{from:"s1",to:"s2"},{from:"s2",to:"s3"},{from:"s3",to:"s4"},{from:"s4",to:"s5"},{from:"s5",to:"s6"},{from:"s6",to:"s7"},{from:"s7",to:"s8"},{from:"s8",to:"s9"}],intro:"Пройдите цепочку по шагам: у каждого шага есть вход и выход.",steps:[{on:["s1"],e:[],text:"Вход: событие «открыт PR №42». Выход: да/нет. Это код: сравнить ветку, автора, размер с правилами. Если «нет», дальше ничего не делаем и не тратим ни токенов, ни запросов."},{on:["s2"],e:["s1>s2"],text:"Вход: номер PR. Выход: текст diff. Это запрос к GitHub API. Внешняя система: может ответить медленно или с ошибкой, это обычный сетевой вызов."},{on:["s3"],e:["s2>s3"],text:"Вход: diff. Выход: diff не длиннее лимита. Код. Нужен, чтобы вход поместился в окно контекста модели (её лимит на объём текста)."},{on:["s4"],e:["s3>s4"],text:"Вход: имя репозитория. Выход: язык, ветка по умолчанию, правила проекта. Ещё один вызов GitHub API. Источник известен заранее, искать его не нужно."},{on:["s5"],e:["s4>s5"],text:"Вход: diff + данные репозитория + версия инструкции. Выход: готовый промпт. Код: подстановка в шаблон."},{on:["s6"],e:["s5>s6"],text:"Вход: промпт. Выход: сырой текст ответа. Единственный недетерминированный шаг: при том же промпте ответ может отличаться."},{on:["s7"],e:["s6>s7"],text:"Вход: сырой текст. Выход: объект с полями severity, summary, issues или ошибка «это не JSON». Код."},{on:["s8"],e:["s7>s8"],text:"Вход: объект + diff. Выход: объект, у которого все упомянутые строки действительно есть в diff. Именно этого шага не хватало боту из введения."},{on:["s9"],e:["s8>s9"],text:"Вход: проверенный объект. Выход: номер созданного комментария. Внешняя система: GitHub API."}]},{t:"key",md:"Workflow это управляемая последовательность шагов и переходов между ними. Она получает входные данные и приводит систему к результату. Шагом может быть функция, HTTP-запрос, обращение к базе, работа с очередью или действие человека. Цепочка вполне может не содержать модели вовсе."},{t:"simple",md:"Шаг это как пост на кухне: у холодного цеха на входе овощи, на выходе нарезка. Повар за плитой не идёт сам на склад за овощами и не относит тарелки гостям. Если нарезка пришла плохая, виноват холодный цех, а не плита. Так же и здесь: у каждого шага свой вход и выход, и по ним видно, кто ошибся."},{t:"p",md:"В Yandex Workflows (сервис Яндекс Облака для таких цепочек) эта идея реализована напрямую: интеграционный шаг вызывает облачную функцию, HTTP API, модель или агента, а управляющий шаг выбирает ветку, запускает цикл, параллельные действия или ожидание. В практике (урок 8) вы соберёте такую цепочку руками."},{t:"h2",text:"Workflow и агент решают разные задачи"},{t:"p",md:"Слово «агент» часто путают с workflow. Разница в одном: **кто решает, что делать дальше**."},{t:"grid",cols:2,blocks:[{t:"flow",title:"Workflow: порядок задаёт разработчик",cw:170,ch:72,nw:146,nodes:[{id:"a",label:"получить PR",kind:"code",x:0,y:0},{id:"b",label:"загрузить diff",kind:"ext",x:0,y:1},{id:"c",label:"вызвать модель",kind:"model",x:0,y:2},{id:"d",label:"проверить результат",kind:"code",x:0,y:3},{id:"e",label:"создать комментарий",kind:"ext",x:0,y:4}],edges:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"d"},{from:"d",to:"e"}],caption:"Модель отвечает на своём шаге и не решает, нужно ли доставать diff и куда отправлять результат."},{t:"flow",title:"Агент внутри шага: модель выбирает инструменты",cw:130,ch:72,nw:112,nodes:[{id:"a",label:`получить
задачу`,kind:"code",x:1,y:0},{id:"ag",label:"агент",kind:"model",x:1,y:1},{id:"t1",label:"поиск",kind:"ext",x:0,y:2},{id:"t2",label:"база",kind:"store",x:1,y:2},{id:"t3",label:"API",kind:"ext",x:2,y:2},{id:"v",label:`проверить
результат`,kind:"code",x:1,y:3},{id:"s",label:"сохранить",kind:"store",x:1,y:4}],edges:[{from:"a",to:"ag"},{from:"ag",to:"t1",kind:"dashed",label:"может"},{from:"ag",to:"t2",kind:"dashed"},{from:"ag",to:"t3",kind:"dashed",label:"может"},{from:"t2",to:"v"},{from:"v",to:"s"}],caption:"Внутри одного шага модель сама выбирает, какие инструменты вызвать и сколько раз. Снаружи это всё равно один шаг с входом и выходом."}]},{t:"key",md:"Если порядок действий известен заранее и определяется бизнес-логикой, задавайте его цепочкой. Если маршрут заранее не перечислить, внутри нужного шага может появиться агент. Глобальный порядок при этом остаётся под контролем приложения."},{t:"toggle",title:"Подробнее: когда агент внутри шага действительно оправдан",md:"Хороший пример: «расследуй инцидент». Заранее неизвестно, понадобятся ли логи, метрики, история деплоев или переписка. Агент решает по ходу. Плохой пример: «сделай ревью PR». Источники известны: diff и метаданные. Агент здесь только добавит непредсказуемость и цену, потому что будет «думать», доставать ли diff, вместо того чтобы просто его достать."},{t:"h2",text:"Пять шагов типового конвейера"},{t:"p",md:"Архитектуры у всех разные, но для большинства прикладных задач работает один образец. Копировать его буквально не нужно. Его ценность в другом: он заставляет отделить работу модели от операций, которые обязаны выполняться одинаково каждый раз."},{t:"flow",title:"Типовой конвейер",legend:["code","ext","model"],cw:168,ch:90,nw:148,nodes:[{id:"v",label:`1. проверка
входа`,kind:"code",x:0,y:0},{id:"e",label:`2. обогащение
контекста`,kind:"ext",x:1,y:0},{id:"m",label:`3. вызов
модели`,kind:"model",x:2,y:0},{id:"c",label:`4. проверка
результата`,kind:"code",x:3,y:0},{id:"d",label:`5. доставка
результата`,kind:"ext",x:4,y:0}],edges:[{from:"v",to:"e",label:"чистый вход"},{from:"e",to:"m",label:"+ данные"},{from:"m",to:"c",label:"сырой ответ"},{from:"c",to:"d",label:"проверенный"}],steps:[{on:["v"],text:"Можно ли вообще запускать обработку? Есть ли обязательные поля, верны ли типы, есть ли права, не слишком ли велик вход. Всё это код."},{on:["e"],e:["v>e"],text:"Чего в запросе не хватает? Для ревью кода нужны diff и данные репозитория. Их добирают из API, базы, файлов или поиска. Источники известны заранее."},{on:["m"],e:["e>m"],text:"Инструкция + запрос + собранный контекст уходят в модель. Здесь появляется недетерминированность: ответ может отличаться при одинаковом входе."},{on:["c"],e:["m>c"],text:"Сначала форма (есть ли поля, верны ли типы), потом смысл (выполняется ли бизнес-правило, которого схема не знает)."},{on:["d"],e:["c>d"],text:"Результат уходит дальше: HTTP-ответом, записью в базу, сообщением, тикетом. Часть с моделью закончилась, а надёжность всё ещё зависит от обычной архитектуры."}]},{t:"h3",text:"Шаг 1. Проверка входа"},{t:"p",md:"Шаг отвечает на вопрос, можно ли вообще запускать обработку. Присутствуют ли обязательные поля, соответствуют ли типы ожидаемой схеме, есть ли у пользователя право на операцию, не превышен ли допустимый размер входа. Здесь же идёт подготовка: нормализация формата, очистка служебных полей, маскирование чувствительных данных. Чем раньше система отсекает заведомо плохой вход, тем меньше лишних вызовов модели и внешних сервисов она делает дальше."},{t:"tabs",title:"Проверка входа кодом",run:!0,langs:{php:e`<?php
// Шаг 1. Проверка входа: обычный код, без модели. Symfony Validator описывает правила атрибутами.
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validation;

final class ReviewRequest
{
    public function __construct(
        #[Assert\NotBlank] #[Assert\Uuid]
        public readonly string $repositoryId,
        #[Assert\Positive]
        public readonly int $pullRequestId,
        #[Assert\Length(max: 200_000)]   // не больше ~200 КБ diff
        public readonly string $diff = '',
    ) {}
}

$validator = Validation::createValidatorBuilder()->enableAttributeMapping()->getValidator();
$request = new ReviewRequest('repo-42', 0);   // заведомо плохой вход

$errors = $validator->validate($request);
if (count($errors) > 0) {
    foreach ($errors as $e) {
        echo $e->getPropertyPath(), ': ', $e->getMessage(), PHP_EOL;
    }
    exit(1);   // дальше не идём: ни diff, ни модель не нужны
}
echo "ok, можно запускать цепочку", PHP_EOL;`,js:e`// Шаг 1. Проверка входа: обычный код, без модели.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateInput(input) {
  const errors = [];
  if (!UUID.test(input.repositoryId ?? '')) errors.push('repositoryId: нужен UUID');
  if (!Number.isInteger(input.pullRequestId) || input.pullRequestId <= 0) errors.push('pullRequestId: положительное целое');
  if ((input.diff ?? '').length > 200_000) errors.push('diff: больше 200 КБ, обрежьте');
  return errors;
}

const bad  = { repositoryId: 'repo-42', pullRequestId: 0 };
const good = { repositoryId: '3f1e2c5a-9b7d-4e21-8a6f-0c2d1e3f4a5b', pullRequestId: 42 };

console.log('плохой вход →', validateInput(bad));
console.log('хороший вход →', validateInput(good).length ? 'ошибки' : 'ok, можно запускать цепочку');`,py:e`# Шаг 1. Проверка входа: обычный код, без модели. pydantic описывает правила типами.
from uuid import UUID
from pydantic import BaseModel, Field, ValidationError

class ReviewRequest(BaseModel):
    repository_id: UUID
    pull_request_id: int = Field(gt=0)
    diff: str = Field(default="", max_length=200_000)   # не больше ~200 КБ diff

try:
    ReviewRequest(repository_id="repo-42", pull_request_id=0)   # заведомо плохой вход
except ValidationError as e:
    for err in e.errors():
        print(err["loc"][0], ":", err["msg"])
    # дальше не идём: ни diff, ни модель не нужны
else:
    print("ok, можно запускать цепочку")`}},{t:"h3",text:"Шаг 2. Обогащение контекста"},{t:"p",md:"Обогащение добирает то, чего в запросе нет. Строки «проверь pull request» для ревью не хватает, нужны как минимум diff и данные репозитория. Данные приходят из API, базы, файлов, поиска по документам, и это отдельная инженерная задача. Отдавать этот сбор агенту незачем, когда источники известны заранее."},{t:"key",md:"Модель должна рассуждать над подготовленными данными, а не компенсировать их отсутствие догадками."},{t:"tabs",title:"Обогащение: два известных источника, запросы независимы",langs:{php:e`<?php
// Шаг 2. Обогащение: достаём diff и метаданные. Источники известны заранее, агент не нужен.
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class PullRequestLoader
{
    public function __construct(private HttpClientInterface $github) {}   // scoped-клиент с base_uri api.github.com

    /** @return array{diff: string, meta: array{language: ?string, default_branch: string}} */
    public function load(string $repo, int $pr): array
    {
        // Два запроса не зависят друг от друга: HttpClient отправит их параллельно,
        // пока мы не попросим содержимое.
        $diffResponse = $this->github->request('GET', "/repos/$repo/pulls/$pr", [
            'headers' => ['Accept' => 'application/vnd.github.diff'],
        ]);
        $metaResponse = $this->github->request('GET', "/repos/$repo");

        $meta = $metaResponse->toArray();

        return [
            'diff' => $diffResponse->getContent(),
            'meta' => ['language' => $meta['language'], 'default_branch' => $meta['default_branch']],
        ];
    }
}`,js:e`// Шаг 2. Обогащение: достаём diff и метаданные. Источники известны заранее, агент не нужен.
async function loadPullRequest(repo, pr, token) {
  const headers = { Authorization: 'Bearer ' + token };
  const base = 'https://api.github.com/repos/' + repo;

  // Два запроса не зависят друг от друга → параллельно
  const [diff, meta] = await Promise.all([
    fetch(base + '/pulls/' + pr, { headers: { ...headers, Accept: 'application/vnd.github.diff' } }).then(r => r.text()),
    fetch(base, { headers }).then(r => r.json()),
  ]);

  return { diff, meta: { language: meta.language, defaultBranch: meta.default_branch } };
}`,py:e`# Шаг 2. Обогащение: достаём diff и метаданные. Источники известны заранее, агент не нужен.
import httpx

def load_pull_request(repo: str, pr: int, token: str) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    with httpx.Client(base_url="https://api.github.com", headers=headers) as client:
        diff = client.get(f"/repos/{repo}/pulls/{pr}",
                          headers={"Accept": "application/vnd.github.diff"}).text
        meta = client.get(f"/repos/{repo}").json()

    return {"diff": diff,
            "meta": {"language": meta["language"], "default_branch": meta["default_branch"]}}`}},{t:"h3",text:"Шаг 3. Вызов модели"},{t:"p",md:"На вход уходят инструкция (системный промпт), запрос и собранный контекст. Именно здесь появляется недетерминированность: при одинаковом промпте формулировка может отличаться, а содержательно неверный ответ приходит вместе с технически успешным HTTP-ответом. Рассматривать такой шаг как обычную функцию, которая при статусе 200 выдала правильный результат, нельзя. Поэтому шаг возвращает **сырой текст**, а проверять его будет следующий шаг."},{t:"tabs",title:"Вызов модели возвращает сырой ответ",langs:{php:e`<?php
// Шаг 3. Вызов модели: единственный недетерминированный шаг.
// Формат запроса OpenAI-совместимый: его понимают Yandex AI Studio и большинство провайдеров.
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ReviewModel
{
    public function __construct(
        private HttpClientInterface $ai,        // base_uri провайдера + заголовок Authorization
        private string $model,                  // идентификатор модели из настроек
        private string $promptVersion = 'v14',  // версия инструкции: попадёт в логи
    ) {}

    public function review(string $diff, array $meta): string   // возвращает СЫРОЙ текст
    {
        $system = file_get_contents(__DIR__ . "/prompts/review.{$this->promptVersion}.txt");

        $response = $this->ai->request('POST', '/v1/chat/completions', ['json' => [
            'model'           => $this->model,
            'temperature'     => 0.2,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user',   'content' => "Язык: {$meta['language']}\n\nDiff:\n$diff"],
            ],
        ]]);

        return $response->toArray()['choices'][0]['message']['content'];
    }
}`,js:e`// Шаг 3. Вызов модели: единственный недетерминированный шаг.
// Формат запроса OpenAI-совместимый: его понимают Yandex AI Studio и большинство провайдеров.
async function reviewWithModel(diff, meta, { baseUrl, apiKey, model, promptVersion = 'v14' }) {
  const system = await readPrompt('prompts/review.' + promptVersion + '.txt');   // версия попадёт в логи

  const r = await fetch(baseUrl + '/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: 'Язык: ' + meta.language + '\n\nDiff:\n' + diff },
      ],
    }),
  });
  const data = await r.json();
  return data.choices[0].message.content;   // СЫРОЙ текст: проверять будем отдельным шагом
}`,py:e`# Шаг 3. Вызов модели: единственный недетерминированный шаг.
# OpenAI-совместимый клиент работает и с Yandex AI Studio, и с другими провайдерами.
from openai import OpenAI

client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

def review_with_model(diff: str, meta: dict, model: str, prompt_version: str = "v14") -> str:
    system = open(f"prompts/review.{prompt_version}.txt").read()   # версия попадёт в логи

    resp = client.chat.completions.create(
        model=model,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Язык: {meta['language']}\n\nDiff:\n{diff}"},
        ],
    )
    return resp.choices[0].message.content   # СЫРОЙ текст: проверять будем отдельным шагом`},caption:"`response_format: json_object` просит модель отвечать JSON. Это снижает число ошибок формата, но не гарантирует правильность содержания."},{t:"h3",text:"Шаг 4. Проверка результата"},{t:"p",md:"Уровней у проверки два."},{t:"list",items:["**Структурная** смотрит на форму: соответствует ли ответ схеме, есть ли обязательные поля, верны ли типы. Например, `severity` должно быть одним из `low | medium | high`.","**Содержательная (бизнес-валидация)** смотрит на смысл. Корректный JSON не означает корректного решения: модель вполне может вернуть поле `line` правильного типа со значением, которого во входном diff не было."]},{t:"tabs",title:"Две проверки: форма, потом смысл",run:!0,langs:{php:e`<?php
// Шаг 4. Проверка результата: сначала форма (схема), потом смысл (бизнес-правило).
final class ReviewChecker
{
    private const SEVERITY = ['low', 'medium', 'high'];

    /** @return array{ok: bool, error?: string, value?: array} */
    public function checkSchema(string $raw): array
    {
        $obj = json_decode($raw, true);
        if (!is_array($obj))                                       return ['ok' => false, 'error' => 'не JSON'];
        if (!in_array($obj['severity'] ?? null, self::SEVERITY, true)) return ['ok' => false, 'error' => 'severity не из списка'];
        if (!is_string($obj['summary'] ?? null))                   return ['ok' => false, 'error' => 'summary не строка'];
        if (!is_array($obj['issues'] ?? null))                     return ['ok' => false, 'error' => 'issues не массив'];
        return ['ok' => true, 'value' => $obj];
    }

    /** @param int[] $diffLines */
    public function checkBusiness(array $review, array $diffLines): array
    {
        $ghost = array_filter($review['issues'], fn (array $i) => !in_array($i['line'], $diffLines, true));
        return $ghost
            ? ['ok' => false, 'error' => 'строк нет в diff: ' . implode(', ', array_column($ghost, 'line'))]
            : ['ok' => true];
    }
}

$checker = new ReviewChecker();
$diffLines = range(10, 18);
foreach ([
    '{"severity":"high","summary":"SQL без параметров","issues":[{"line":14,"text":"конкатенация"}]}',
    '{"severity":"high","summary":"лишний пробел","issues":[{"line":512,"text":"стиль"}]}',
    '{"summary":"всё ок","issues":[]}',
] as $raw) {
    $s = $checker->checkSchema($raw);
    if (!$s['ok']) { echo "схема ✗: {$s['error']}\n"; continue; }
    $b = $checker->checkBusiness($s['value'], $diffLines);
    echo 'схема ✓, смысл ', $b['ok'] ? "✓ → отправляем\n" : "✗: {$b['error']}\n";
}`,js:e`// Шаг 4. Проверка результата: сначала форма (схема), потом смысл (бизнес-правило).
const SEVERITY = ['low', 'medium', 'high'];

function checkSchema(raw) {
  let obj;
  try { obj = JSON.parse(raw); } catch { return { ok: false, error: 'не JSON' }; }
  if (!SEVERITY.includes(obj.severity)) return { ok: false, error: 'severity не из списка' };
  if (typeof obj.summary !== 'string')  return { ok: false, error: 'summary не строка' };
  if (!Array.isArray(obj.issues))       return { ok: false, error: 'issues не массив' };
  return { ok: true, value: obj };
}

function checkBusiness(review, diffLines) {
  const ghost = review.issues.filter(i => !diffLines.includes(i.line));
  return ghost.length
    ? { ok: false, error: 'строк нет в diff: ' + ghost.map(i => i.line).join(', ') }
    : { ok: true };
}

const diffLines = [10, 11, 12, 13, 14, 15, 16, 17, 18];
const answers = [
  '{"severity":"high","summary":"SQL без параметров","issues":[{"line":14,"text":"конкатенация"}]}',
  '{"severity":"high","summary":"лишний пробел","issues":[{"line":512,"text":"стиль"}]}',
  '{"summary":"всё ок","issues":[]}',
];
for (const raw of answers) {
  const s = checkSchema(raw);
  if (!s.ok) { console.log('схема ✗:', s.error); continue; }
  const b = checkBusiness(s.value, diffLines);
  console.log('схема ✓, смысл', b.ok ? '✓ → отправляем' : '✗: ' + b.error);
}`,py:e`# Шаг 4. Проверка результата: сначала форма (схема), потом смысл (бизнес-правило).
from typing import Literal
from pydantic import BaseModel, ValidationError

class Issue(BaseModel):
    line: int
    text: str

class Review(BaseModel):
    severity: Literal["low", "medium", "high"]
    summary: str
    issues: list[Issue]

def check_schema(raw: str) -> Review | None:
    try:
        return Review.model_validate_json(raw)
    except ValidationError as e:
        print("схема ✗:", e.errors()[0]["msg"])
        return None

def check_business(review: Review, diff_lines: set[int]) -> str | None:
    ghost = [i.line for i in review.issues if i.line not in diff_lines]
    return f"строк нет в diff: {ghost}" if ghost else None

diff_lines = set(range(10, 19))
for raw in [
    '{"severity":"high","summary":"SQL без параметров","issues":[{"line":14,"text":"конкатенация"}]}',
    '{"severity":"high","summary":"лишний пробел","issues":[{"line":512,"text":"стиль"}]}',
    '{"summary":"всё ок","issues":[]}',
]:
    review = check_schema(raw)
    if review is None:
        continue
    err = check_business(review, diff_lines)
    print("схема ✓, смысл", "✓ → отправляем" if err is None else f"✗: {err}")`}},{t:"sim",kind:"validate",title:"Проверьте ответ модели сами",md:"Подставьте готовые варианты ответа или отредактируйте JSON и посмотрите, какая проверка его поймает."},{t:"p",md:"Структурированный вывод (просьба к модели отвечать строго JSON) снижает риск ошибок формата, но не заменяет программные бизнес-правила. Схема не знает, какие строки есть в diff."},{t:"h3",text:"Шаг 5. Доставка результата"},{t:"p",md:"Результат передаётся дальше: HTTP-ответом, записью в базу, сообщением, тикетом или вызовом другого API. Часть с моделью уже закончилась, а надёжность всё ещё зависит от обычной архитектуры. Если результат уходит сразу в несколько независимых систем, действия стоит разделить: успешная запись в базу и неудачная отправка уведомления это **два разных исхода**, и провал одного не обязан отменять другой."},{t:"tabs",title:"Доставка в две системы: два независимых исхода",run:!0,langs:{php:e`<?php
// Шаг 5. Доставка: два независимых действия → два независимых исхода.
final class Delivery
{
    public function __construct(private ReviewRepository $repo, private SlackNotifier $slack) {}

    /** @return array{db: array, slack: array} */
    public function deliver(array $review): array
    {
        $out = [];

        try { $this->repo->save($review); $out['db'] = ['ok' => true]; }
        catch (\Throwable $e) { $out['db'] = ['ok' => false, 'error' => $e->getMessage()]; }

        try { $this->slack->notify($review); $out['slack'] = ['ok' => true]; }
        catch (\Throwable $e) { $out['slack'] = ['ok' => false, 'error' => $e->getMessage()]; }

        return $out;   // запись есть, уведомление упало → повторяем только уведомление
    }
}

// В Symfony уведомление удобнее отправить сообщением через Messenger:
//   $this->bus->dispatch(new NotifySlack($review['id']));
// Тогда повтор и очередь настраиваются транспортом, а запись в базу от Slack не зависит.`,js:e`// Шаг 5. Доставка: два независимых действия → два независимых исхода.
async function saveToDb(review)    { return { id: 9918 }; }                                   // имитация: прошло
async function notifySlack(review) { throw new Error('Slack: 503 Service Unavailable'); }     // имитация: упало

async function deliver(review) {
  const results = await Promise.allSettled([saveToDb(review), notifySlack(review)]);
  const [db, slack] = results.map(r => r.status === 'fulfilled' ? { ok: true } : { ok: false, error: r.reason.message });
  return { db, slack };   // запись есть, уведомление упало → повторяем только уведомление
}

console.log(await deliver({ severity: 'high', summary: 'SQL без параметров' }));`,py:e`# Шаг 5. Доставка: два независимых действия → два независимых исхода.
def deliver(review: dict) -> dict:
    out = {}

    try:
        repo.save(review)
        out["db"] = {"ok": True}
    except Exception as e:
        out["db"] = {"ok": False, "error": str(e)}

    try:
        slack.notify(review)
        out["slack"] = {"ok": True}
    except Exception as e:
        out["slack"] = {"ok": False, "error": str(e)}

    return out   # запись есть, уведомление упало → повторяем только уведомление`}},{t:"h2",text:"Переходы, состояние и вложенность"},{t:"p",md:"Линейной цепочка остаётся недолго. Правила, определяющие, какой шаг выполняется следующим, называют **control flow** (логика переходов). Простейший вид это ветвление по условию, которое можно вычислить заранее."},{t:"grid",cols:2,blocks:[{t:"flow",title:"Ветвление: условие считает код",cw:150,ch:80,nw:130,nodes:[{id:"a",label:`результат
проверки`,kind:"code",x:0,y:0},{id:"d",label:`данных
достаточно?`,kind:"decision",x:0,y:1},{id:"n",label:"остановить",kind:"end",x:0,y:2},{id:"y",label:`вызвать
модель`,kind:"model",x:1,y:2}],edges:[{from:"a",to:"d"},{from:"d",to:"n",label:"нет"},{from:"d",to:"y",label:"да"}]},{t:"flow",title:"Параллельно: только независимые ветки",cw:150,ch:80,nw:130,nodes:[{id:"q",label:"запрос",kind:"start",x:0,y:1},{id:"p",label:`получить
профиль`,kind:"ext",x:1,y:0},{id:"h",label:`получить
историю`,kind:"ext",x:1,y:2},{id:"j",label:"объединить",kind:"code",x:2,y:1}],edges:[{from:"q",to:"p"},{from:"q",to:"h"},{from:"p",to:"j"},{from:"h",to:"j"}]}]},{t:"warn",md:"Параллельность экономит время, но плата за неё неочевидна: заметно усложняется обработка частичных ошибок, когда одна ветка отработала, а вторая нет. Добавляйте её при реальном выигрыше по времени, а не по умолчанию."},{t:"p",md:"**Состояние** это данные, доступные во время конкретного запуска. Один шаг кладёт в него `diff`, следующий берёт его для вызова модели, третий сохраняет `review_result`. Чем яснее контракт между шагами (кто какое поле создаёт), тем проще понять, какой компонент породил конкретное значение. В Yandex Workflows состояние запуска это JSON, который передаётся между шагами и пополняется результатом каждого."},{t:"sim",kind:"state",title:"Как состояние растёт по шагам",md:"Нажимайте «Следующий шаг» и смотрите, какие поля появляются в JSON и кто их создал."},{t:"p",md:"**Повторяющуюся цепочку выделяют в отдельный workflow** и вызывают как один шаг более крупного процесса. Выделять стоит то, у чего есть понятный контракт «вход, внутренние шаги, выход». Агентом вложенная цепочка от этого не становится: агентность определяется выбором действий моделью, а не количеством шагов внутри."},{t:"flow",title:"Вложенность: цепочка как один узел другой цепочки",cw:190,ch:90,nw:166,legend:["code","ext","model"],nodes:[{id:"a",label:"ежедневный отчёт",kind:"start",x:0,y:0},{id:"b",label:"подготовить данные",kind:"code",x:1,y:0},{id:"c",label:`workflow анализа
документа`,kind:"ext",x:2,y:0,badge:"вложенный"},{id:"d",label:"сформировать сводку",kind:"code",x:3,y:0},{id:"c1",label:"разбить на части",kind:"code",x:1,y:1},{id:"c2",label:"извлечь факты",kind:"model",x:2,y:1},{id:"c3",label:"проверить факты",kind:"code",x:3,y:1}],edges:[{from:"a",to:"b"},{from:"b",to:"c"},{from:"c",to:"d"},{from:"c",to:"c1",kind:"dashed",label:"внутри"},{from:"c1",to:"c2"},{from:"c2",to:"c3"},{from:"c3",to:"c",kind:"dashed",label:"результат"}],caption:"Снаружи «анализ документа» это один шаг с входом и выходом. Внутри у него свои три шага, один из которых вызывает модель."},{t:"h2",text:"Где живёт бизнес-логика"},{t:"p",md:"Хороший workflow разделяет три типа решений и не путает их между собой."},{t:"table",head:["Тип решения","Кто выполняет","Пример"],rows:[["Детерминированное правило","код и управляющие шаги","«если сумма больше лимита, нужно согласование»"],["Семантическая задача","модель","«определи основную проблему в тексте обращения»"],["Динамический выбор инструментов","агент","«выбери, какие источники нужны для расследования»"]]},{t:"p",md:"Путаница стоит дорого в обе стороны. Правило про лимит, отданное модели, начнёт срабатывать через раз. А попытка выразить кодом «определи основную проблему» превращается в бесконечный список условий, который всё равно не покрывает реальные обращения."},{t:"tabs",title:"Правило считает код, смысл определяет модель",run:!0,langs:{php:e`<?php
// Детерминированное правило → код. Семантика → модель.
const LIMIT = 100_000;

function needsApproval(int $amount): bool          // правило: код, всегда одинаково
{
    return $amount > LIMIT;
}

function classifyIntent(string $text): string       // смысл: модель (здесь имитация ответа)
{
    $fake = ['верните деньги' => 'refund', 'где заказ' => 'delivery'];
    foreach ($fake as $needle => $intent) {
        if (str_contains(mb_strtolower($text), $needle)) return $intent;
    }
    return 'other';
}

echo '120 000 ₽ → ', needsApproval(120_000) ? 'нужно согласование' : 'без согласования', PHP_EOL;
echo '99 999 ₽ → ',  needsApproval(99_999)  ? 'нужно согласование' : 'без согласования', PHP_EOL;
echo '«Заказ 58391 пришёл мятый, верните деньги» → ', classifyIntent('Заказ 58391 пришёл мятый, верните деньги'), PHP_EOL;`,js:e`// Детерминированное правило → код. Семантика → модель.
const LIMIT = 100_000;

function needsApproval(purchase) {             // правило: код, всегда одинаково
  return purchase.amount > LIMIT;
}

async function classifyIntent(text) {          // смысл: модель (здесь имитация ответа)
  const fake = { 'верните деньги': 'refund', 'где заказ': 'delivery' };
  const hit = Object.entries(fake).find(([needle]) => text.toLowerCase().includes(needle));
  return hit ? hit[1] : 'other';
}

console.log('120 000 ₽ →', needsApproval({ amount: 120_000 }) ? 'нужно согласование' : 'без согласования');
console.log('99 999 ₽ →',  needsApproval({ amount: 99_999 })  ? 'нужно согласование' : 'без согласования');
console.log('«Заказ 58391 пришёл мятый, верните деньги» →', await classifyIntent('Заказ 58391 пришёл мятый, верните деньги'));`,py:e`# Детерминированное правило → код. Семантика → модель.
LIMIT = 100_000

def needs_approval(amount: int) -> bool:        # правило: код, всегда одинаково
    return amount > LIMIT

def classify_intent(text: str) -> str:          # смысл: модель (здесь имитация ответа)
    fake = {"верните деньги": "refund", "где заказ": "delivery"}
    for needle, intent in fake.items():
        if needle in text.lower():
            return intent
    return "other"

print("120 000 ₽ →", "нужно согласование" if needs_approval(120_000) else "без согласования")
print("99 999 ₽ →",  "нужно согласование" if needs_approval(99_999)  else "без согласования")
print("«Заказ 58391 пришёл мятый, верните деньги» →", classify_intent("Заказ 58391 пришёл мятый, верните деньги"))`},caption:"Условие ветвления по возможности вычисляет код, а не модель. Иначе цепочка перестаёт быть воспроизводимой ровно там, где предсказуемость важнее всего."},{t:"h2",text:"Семь вопросов, которые дают структуру"},{t:"olist",items:["Какие данные приходят на вход?","Что можно проверить обычным кодом до вызова модели?","Каких данных не хватает и откуда их взять?","Где действительно нужна работа модели?","Как проверить её результат (форма и смысл)?","Какое действие выполняется после проверки?","Какие данные передаются между шагами?"]},{t:"p",md:"Ответы дают структуру. Следом появляется вопрос, который структура не закрывает: когда и каким способом этот процесс должен запускаться. Это следующий урок."},{t:"toggle",title:"Самостоятельная работа: разложите свою задачу на шаги",blocks:[{t:"p",md:"Возьмите любую свою задачу, где модель вызывается хотя бы раз. Если своей нет, подойдёт сборка карточки товара по описанию от поставщика."},{t:"olist",items:["Выпишите шаги. У каждого назовите вход и выход в виде структуры с именами полей, а не словами «текст запроса». Шаг, у которого не получается назвать вход и выход, ещё не шаг.","Отметьте шаги, которым модель не нужна. Обычно это проверка входа, дополнение данными из базы, проверка ответа, отправка результата. Если шагов с моделью больше, чем без, посмотрите ещё раз.","Для одного шага с моделью опишите две проверки: структурную (схема) и содержательную (бизнес-правило, которое схема не поймает).","Найдите место для ветвления и место для параллельного запуска. Для ветвления укажите, кто считает условие: код или модель. Для параллельного участка проверьте, что ветки независимы."]},{t:"checklist",id:"l2-self",items:["Все шаги выписаны, у каждого есть вход и выход со списком полей","Отмечены шаги, которым модель не нужна","Шагов без модели не меньше, чем с моделью","Для одного модельного шага описаны обе проверки","Найдено ветвление, указано, кто вычисляет условие","Найден параллельный участок, проверена независимость веток"]}]},{t:"quiz",id:"q2",title:"Проверьте себя",questions:[{q:"Первый шаг отправляет `repository_id` в модель с просьбой проверить, что это UUID, и только потом грузит diff. Что изменить?",options:["Ничего, модель справится","Проверять формат кодом (регулярное выражение), модель для этого не нужна","Грузить diff до проверки","Попросить модель проверить ещё и diff"],answer:1,why:"Формальная проверка выражается кодом: быстрее, дешевле, без случайности. Модель оставляют для задач про смысл."},{q:"Модель вернула 200 и JSON ровно по схеме `{severity, summary, issues}`, но `line` внутри `issues` в diff нет. Какой вывод делать нельзя?",options:["Ответ прошёл структурную проверку","Нужна содержательная проверка","«Схема прошла, значит ответ правильный»","Модель может придумывать значения"],answer:2,why:"Схема проверяет форму. Правильность содержания (строка существует в diff) проверяет бизнес-правило в коде."},{q:"Последний шаг записывает результат в базу и шлёт уведомление в Slack одним действием. Запись прошла, Slack упал, шаг помечен неуспешным. Как правильнее?",options:["Повторить весь шаг, включая запись","Разделить на два независимых действия с отдельными исходами","Убрать уведомление","Писать в Slack до базы"],answer:1,why:"Запись в базу и уведомление это два разных исхода. Повторять нужно только то, что упало."},{q:"Зачем в контракте состояния фиксировать, какой шаг создаёт поле `review_result`?",options:["Для красоты документации","Чтобы при неверном значении сразу знать, какой шаг его породил и что чинить","Чтобы модель лучше отвечала","Это требование JSON"],answer:1,why:"Ясный контракт между шагами превращает разбор инцидента из гадания в поиск по одному месту."},{q:"Правило «сумма выше лимита требует согласования» где должно жить?",options:["В промпте модели","В коде или управляющем шаге цепочки","У агента, пусть сам решает","В базе данных Slack"],answer:1,why:"Это детерминированное правило. Отданное модели, оно начнёт срабатывать через раз."},{q:"Чем workflow отличается от агента?",options:["Workflow быстрее","В workflow порядок шагов задаёт разработчик, в агенте следующее действие выбирает модель","Агент не использует модель","Ничем, это синонимы"],answer:1,why:"Граница проходит по одному признаку: кто решает, что делать дальше. Агент может жить внутри одного шага цепочки."}]}]})})();const r=t[0];export{r as default};
