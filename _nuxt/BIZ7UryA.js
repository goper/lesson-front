const t=[];(function(){const e=String.raw;t.push({id:"l3",num:3,minutes:35,title:"Запуск: триггеры и режимы выполнения",goal:"Выбрать, откуда цепочка узнаёт о работе (push, pull, расписание, кнопка) и должен ли вызывающий ждать ответа.",blocks:[{t:"story",title:"Две цепочки, обе написаны правильно",md:`В одном проекте живут две цепочки. Первая проверяет изменения в коде и запускается опросом раз в пятнадцать минут. Разработчик успевает уйти на обед раньше, чем придёт комментарий. Вторая собирает сводку обращений и запускается на каждое новое обращение. За день она делает двести запусков, а руководитель читает результат один раз утром.

Обе цепочки написаны правильно. Неправильно выбран **момент запуска**. Это отдельное архитектурное решение, которое структура цепочки не закрывает.`},{t:"simple",md:"Есть четыре способа узнать, что пора работать. Дверной звонок: гость сам нажал кнопку (**push**). Выглядывать в окно каждые пять минут, не пришёл ли кто (**pull**). Будильник на 9:00 (**расписание**). Кто-то попросил прямо сейчас (**ручной запуск**). Звонок удобнее, но он есть не у каждой двери, а если выглядывать в окно слишком часто, ничего другого делать не успеешь."},{t:"key",md:"**Trigger (триггер)** это событие, команда или условие, которое начинает новый запуск цепочки. **Execution (запуск)** это один конкретный проход: десять новых pull request порождают десять независимых запусков одной и той же цепочки."},{t:"p",md:"У триггера две работы: определить, **когда** начинать, и передать цепочке **начальные данные**."},{t:"flow",title:"Триггер запускает execution и передаёт ему вход",cw:190,ch:80,nw:166,nodes:[{id:"a",label:"в GitHub открыт PR",kind:"ext",x:0,y:0},{id:"b",label:"триггер",kind:"code",x:0,y:1},{id:"c",label:"{ repository, pull_request_id }",kind:"note",x:0,y:2,w:190},{id:"d",label:"execution цепочки",kind:"start",x:0,y:3}],edges:[{from:"a",to:"b",label:"событие"},{from:"b",to:"c",label:"формирует вход"},{from:"c",to:"d"}]},{t:"h2",text:"Push: источник сам стучится"},{t:"p",md:"При push источник сам отправляет событие. Обычно это **webhook**: HTTP-запрос, который внешняя система посылает на заранее зарегистрированный адрес вашей системы."},{t:"flow",title:"Push через webhook",cw:170,ch:72,nw:146,legend:["ext","code"],nodes:[{id:"g",label:"GitHub",kind:"ext",x:0,y:0},{id:"e",label:"PR открыт",kind:"note",x:1,y:0},{id:"w",label:`POST /webhooks
на ваш адрес`,kind:"code",x:2,y:0},{id:"f",label:"workflow",kind:"start",x:3,y:0}],edges:[{from:"g",to:"e"},{from:"e",to:"w",label:"сразу"},{from:"w",to:"f"}],caption:"Спрашивать источник не нужно вовсе: обработка стартует ровно тогда, когда появилась работа. На редких событиях это особенно выгодно."},{t:"p",md:"Условий у push два, и оба внешние. Источник должен **уметь** отправлять события, а принимающая сторона должна иметь **доступный извне адрес**. И есть третье обстоятельство: одно и то же событие вполне может прийти дважды (сеть моргнула, источник не получил подтверждение и прислал ещё раз). Поэтому событие нужно уметь опознать по устойчивому идентификатору."},{t:"tabs",title:"Приём webhook: быстро ответить, отбросить дубликат, работу отдать в фон",run:!0,langs:{php:e`<?php
// Push: источник сам присылает событие. Одно и то же событие может прийти дважды,
// поэтому запоминаем его идентификатор и второй раз цепочку не запускаем.
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Symfony\Component\HttpFoundation\{Request, Response};
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

final class GithubWebhookController
{
    public function __construct(private Connection $db, private MessageBusInterface $bus) {}

    #[Route('/webhooks/github', methods: ['POST'])]
    public function __invoke(Request $request): Response
    {
        $eventId = $request->headers->get('X-GitHub-Delivery');   // устойчивый идентификатор события
        $payload = $request->toArray();

        if (($payload['action'] ?? null) !== 'opened') {
            return new Response('ignored', 202);
        }

        try {   // таблица webhook_events с UNIQUE(id): вставка второй раз не пройдёт
            $this->db->insert('webhook_events', ['id' => $eventId, 'received_at' => date(DATE_ATOM)]);
        } catch (UniqueConstraintViolationException) {
            return new Response('duplicate', 200);   // уже обрабатывали: отвечаем «ок», цепочку не запускаем
        }

        $this->bus->dispatch(new ReviewPullRequest(   // в очередь Messenger: работа пойдёт в фоне
            repository: $payload['repository']['full_name'],
            pullRequestId: $payload['pull_request']['number'],
        ));

        return new Response('accepted', 202);   // отвечаем быстро: источник ждёт ответа недолго
    }
}`,js:e`// Push: источник сам присылает событие. Одно и то же событие может прийти дважды,
// поэтому запоминаем его идентификатор и второй раз цепочку не запускаем.
const seen = new Set();                       // в проде: таблица с UNIQUE(event_id) или Redis SETNX
const queue = [];                             // в проде: очередь (YMQ, RabbitMQ, …)

function handleWebhook(headers, payload) {    // в Express: app.post('/webhooks/github', (req, res) => …)
  const eventId = headers['x-github-delivery'];           // устойчивый идентификатор события
  if (payload.action !== 'opened') return { status: 202, body: 'ignored' };
  if (seen.has(eventId)) return { status: 200, body: 'duplicate' };   // уже было: «ок», но не запускаем
  seen.add(eventId);
  queue.push({ repository: payload.repository.full_name, pullRequestId: payload.pull_request.number });
  return { status: 202, body: 'accepted' };   // отвечаем быстро: работа пойдёт в фоне
}

const event = { action: 'opened', repository: { full_name: 'shop/api' }, pull_request: { number: 42 } };
console.log('доставка 1 →', handleWebhook({ 'x-github-delivery': 'evt-777' }, event));
console.log('доставка 2 (повтор) →', handleWebhook({ 'x-github-delivery': 'evt-777' }, event));
console.log('запусков в очереди:', queue.length);`,py:e`# Push: источник сам присылает событие. Одно и то же событие может прийти дважды,
# поэтому запоминаем его идентификатор и второй раз цепочку не запускаем.
from fastapi import FastAPI, Header, Request, Response

app = FastAPI()
seen: set[str] = set()      # в проде: таблица с UNIQUE(event_id) или Redis SETNX

@app.post("/webhooks/github")
async def github_webhook(request: Request, x_github_delivery: str = Header()):
    payload = await request.json()
    if payload.get("action") != "opened":
        return Response("ignored", status_code=202)
    if x_github_delivery in seen:                        # устойчивый идентификатор события
        return Response("duplicate", status_code=200)    # уже было: «ок», но не запускаем
    seen.add(x_github_delivery)

    queue.send({"repository": payload["repository"]["full_name"],
                "pull_request_id": payload["pull_request"]["number"]})   # работа пойдёт в фоне
    return Response("accepted", status_code=202)         # отвечаем быстро`},caption:"Обработчик отвечает за доли секунды и ничего тяжёлого не делает сам. Иначе источник сочтёт доставку неудачной и пришлёт событие ещё раз."},{t:"toggle",title:"Пример: Telegram умеет и push, и pull",md:"Telegram Bot API поддерживает webhook (Telegram сам шлёт сообщения на ваш адрес) и `getUpdates` (вы сами спрашиваете, что нового). Выбор есть не всегда: если ваш сервер не доступен из интернета или входящие запросы к нему режет сеть, остаётся только опрос. Так бывает, например, при запуске внутри облачных функций в закрытой сети: тогда функция по таймеру раз в минуту вызывает `getUpdates`."},{t:"h2",text:"Pull: вы сами спрашиваете"},{t:"p",md:"При pull инициатором становится ваша система. Периодический опрос источника называют **polling**."},{t:"flow",title:"Pull: опрос по таймеру",cw:170,ch:78,nw:146,nodes:[{id:"t",label:"каждую минуту",kind:"start",x:0,y:0},{id:"q",label:`запросить
новые события`,kind:"ext",x:0,y:1},{id:"d",label:"есть данные?",kind:"decision",x:0,y:2},{id:"n",label:"ждать",kind:"end",x:1,y:2},{id:"w",label:"workflow",kind:"code",x:0,y:3}],edges:[{from:"t",to:"q"},{from:"q",to:"d"},{from:"d",to:"n",label:"нет"},{from:"d",to:"w",label:"да"},{from:"n",to:"t",kind:"dashed",curve:-60}]},{t:"p",md:"Pull нужен, когда внешний сервис не умеет push или push нельзя использовать в вашей инфраструктуре. Он же удобен, когда данные всё равно собираются пачками. Плата за pull это лишние запросы, и она регулируется одним параметром: **интервалом**. Чем короче интервал, тем ниже задержка и тем выше нагрузка на источник. Период выбирают по требованиям бизнеса и лимитам API, а не по ощущению."},{t:"tabs",title:"Опрос с курсором: не читать одно и то же дважды",run:!0,langs:{php:e`<?php
// Pull: мы сами спрашиваем источник. Запоминаем курсор (докуда дочитали), чтобы не брать старое дважды.
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Scheduler\Attribute\AsCronTask;

#[AsCommand('app:poll-source')]
#[AsCronTask('* * * * *')]   // раз в минуту: интервал задаёт и задержку, и нагрузку на источник
final class PollSourceCommand extends Command
{
    public function __construct(
        private SourceClient $source,          // обёртка над GET /events?after=<id>
        private CursorStore $cursors,          // курсор хранится в базе: после перезапуска не перечитываем всё
        private MessageBusInterface $bus,
    ) { parent::__construct(); }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $after = $this->cursors->get('source');
        $fresh = $this->source->fetchSince($after);

        if ($fresh === []) {
            $output->writeln('опрос: пусто (запрос потрачен впустую)');
            return Command::SUCCESS;
        }
        foreach ($fresh as $event) {
            $this->bus->dispatch(new ProcessEvent($event['id'], $event['text']));
            $this->cursors->set('source', $event['id']);
        }
        return Command::SUCCESS;
    }
}`,js:e`// Pull: мы сами спрашиваем источник. Запоминаем курсор (докуда дочитали), чтобы не брать старое дважды.
const source = { events: [{ id: 1, text: 'заявка A' }, { id: 2, text: 'заявка B' }] };   // имитация внешнего API
const fetchSince = (afterId) => source.events.filter(e => e.id > afterId);

let cursor = 0;                 // в проде: хранить в базе, иначе после перезапуска всё перечитается

async function pollOnce() {
  const fresh = fetchSince(cursor);
  if (fresh.length === 0) { console.log('опрос: пусто (запрос потрачен впустую)'); return; }
  for (const e of fresh) { console.log('опрос: запускаю workflow для', e.text); cursor = e.id; }
}

await pollOnce();                                   // 2 события
await pollOnce();                                   // пусто
source.events.push({ id: 3, text: 'заявка C' });    // появилось новое
await pollOnce();                                   // 1 событие
// в проде: setInterval(pollOnce, 60_000) или запуск по расписанию раз в минуту`,py:e`# Pull: мы сами спрашиваем источник. Запоминаем курсор (докуда дочитали), чтобы не брать старое дважды.
import time
import httpx

def poll_once(cursors, client: httpx.Client) -> None:
    after = cursors.get("source")                     # курсор в базе: после перезапуска не перечитываем всё
    fresh = client.get("/events", params={"after": after}).json()
    if not fresh:
        print("опрос: пусто (запрос потрачен впустую)")
        return
    for event in fresh:
        start_workflow(event)
        cursors.set("source", event["id"])

while True:                 # или планировщик (cron, APScheduler) раз в минуту
    poll_once(cursors, client)
    time.sleep(60)          # интервал задаёт и задержку, и нагрузку на источник`}},{t:"h2",text:"Расписание и явный запуск"},{t:"p",md:"Не всякая цепочка запускается событием. Запуск по расписанию закрывает отчёты, ночную обработку, периодические проверки и сборку накопленного."},{t:"flow",title:"Расписание без опроса: данные лежат у себя",cw:180,ch:72,nw:156,nodes:[{id:"c",label:`cron 09:00
по будням`,kind:"start",x:0,y:0},{id:"d",label:`взять вчерашние
данные из своей БД`,kind:"store",x:0,y:1},{id:"r",label:"сформировать отчёт",kind:"code",x:0,y:2}],edges:[{from:"c",to:"d"},{from:"d",to:"r"}],caption:"Здесь запуск по расписанию, а polling отсутствует: внешний источник никто не опрашивает."},{t:"warn",md:"Расписание и pull легко перепутать, а это разные вещи. Расписание отвечает только на вопрос «когда запустить». Опрос внешнего источника внутри может быть, а может и не быть."},{t:"tabs",title:"Запуск по расписанию",langs:{php:e`<?php
// Расписание: Symfony Scheduler. Задача запускается по cron-выражению, опроса внешнего источника нет.
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Scheduler\Attribute\AsCronTask;

#[AsCommand('app:daily-digest')]
#[AsCronTask('0 9 * * 1-5', timezone: 'Europe/Moscow')]   // 09:00 по будням
final class DailyDigestCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tickets = $this->tickets->openedSince(new \DateTimeImmutable('-24 hours'));   // своя база
        $this->digest->buildAndSend($tickets);                                        // цепочка: модель → проверка → Telegram
        return Command::SUCCESS;
    }
}
// Запуск планировщика: php bin/console messenger:consume scheduler_default`,js:e`// Расписание: node-cron. Задача запускается по cron-выражению, опроса внешнего источника нет.
import cron from 'node-cron';

cron.schedule('0 9 * * 1-5', async () => {           // 09:00 по будням
  const tickets = await db.ticketsOpenedSince(Date.now() - 24 * 3600 * 1000);   // своя база
  await digest.buildAndSend(tickets);                 // цепочка: модель → проверка → Telegram
}, { timezone: 'Europe/Moscow' });`,py:e`# Расписание: APScheduler. Задача запускается по cron-выражению, опроса внешнего источника нет.
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime, timedelta

def daily_digest() -> None:
    tickets = db.tickets_opened_since(datetime.utcnow() - timedelta(hours=24))   # своя база
    digest.build_and_send(tickets)                                               # цепочка: модель → проверка → Telegram

scheduler = BlockingScheduler(timezone="Europe/Moscow")
scheduler.add_job(daily_digest, "cron", day_of_week="mon-fri", hour=9)           # 09:00 по будням
scheduler.start()`}},{t:"p",md:"Пользователь тоже запускает цепочку напрямую, обычным `POST /review` или кнопкой в интерфейсе. В Yandex Workflows запуск стартует через API или консольную утилиту, из интерфейса, по расписанию, по HTTPS-ссылке, через API Gateway или по событию. На внутреннюю логику способ запуска не влияет: один и тот же процесс запускается разными путями, если формат входных данных совместим."},{t:"h2",text:"Как выбрать триггер"},{t:"p",md:"Правило «webhook современнее, значит всегда push» приводит ровно к тем двумстам лишним запускам из начала урока. Выбор делается по четырём свойствам задачи."},{t:"list",items:["**Насколько быстро нужен результат.** Ревью, которое должно начаться сразу после открытия PR, требует push. Отчёт к утренней встрече от мгновенной реакции не выигрывает ничего.","**Умеет ли источник отправлять события.** Если API даёт только чтение, выбор сделан за вас: остаётся polling.","**Нужно ли обрабатывать каждое событие.** Новый платёж требует отдельной проверки. Обращения за день требуют одной сводки. Во втором случае запуск на каждое событие умножает вызовы модели, не добавляя пользы.","**Возможна ли повторная доставка.** Внешнее событие приходит дважды чаще, чем кажется. Триггер связывают с устойчивым идентификатором события, чтобы отличить новую работу от дубликата."]},{t:"sim",kind:"trigger",title:"Калькулятор: push, pull или расписание",md:"Подвигайте число событий в сутки и интервал опроса. Посмотрите, сколько запросов уйдёт впустую и какую задержку это даст."},{t:"tip",md:"Заказчик почти всегда просит запуск чаще, чем ему нужно. Просьба «присылать каждое событие сразу» обычно означает «я хочу быть в курсе». Это закрывается сводкой по расписанию и стоит на порядок дешевле."},{t:"h2",text:"Ждать ответа или нет"},{t:"p",md:"Способ запуска выбран. Появляется второй вопрос, **независимый** от первого: должен ли тот, кто вызвал цепочку, дожидаться её завершения?"},{t:"grid",cols:2,blocks:[{t:"flow",title:"Синхронно: клиент ждёт до конца",cw:150,ch:72,nw:130,nodes:[{id:"a",label:"запрос",kind:"start",x:0,y:0},{id:"b",label:"workflow",kind:"code",x:1,y:0},{id:"c",label:"ответ",kind:"end",x:2,y:0}],edges:[{from:"a",to:"b"},{from:"b",to:"c"}],caption:"Просто: отправил, получил. Работает, пока цепочка короткая."},{t:"flow",title:"Streaming: ответ частями",cw:150,ch:60,nw:130,nodes:[{id:"a",label:"запрос",kind:"start",x:0,y:1},{id:"b",label:"генерация",kind:"model",x:1,y:1},{id:"c1",label:"кусок 1",kind:"note",x:2,y:0},{id:"c2",label:"кусок 2",kind:"note",x:2,y:1},{id:"c3",label:"последний",kind:"note",x:2,y:2}],edges:[{from:"a",to:"b"},{from:"b",to:"c1"},{from:"b",to:"c2"},{from:"b",to:"c3"}],caption:"Первые слова видны раньше. Но соединение всё ещё открыто до конца."}]},{t:"flow",title:"Асинхронно: приём и работа разделены",cw:180,ch:78,nw:156,legend:["code","queue","store"],nodes:[{id:"a",label:"запрос",kind:"start",x:0,y:0},{id:"b",label:`создать задачу
→ вернуть job_id`,kind:"code",x:1,y:0},{id:"q",label:"очередь",kind:"queue",x:2,y:0},{id:"w",label:"workflow в фоне",kind:"code",x:2,y:1},{id:"s",label:`сохранить
результат`,kind:"store",x:1,y:1},{id:"c",label:`клиент забирает:
опрос / callback / сообщение`,kind:"ext",x:0,y:1,w:170}],edges:[{from:"a",to:"b"},{from:"b",to:"q"},{from:"q",to:"w"},{from:"w",to:"s"},{from:"s",to:"c",kind:"dashed",label:"позже"}],caption:"Клиент получает подтверждение «принято» и свободен. Окупается, когда цепочка работает минуты, ждёт внешнюю систему или человека."},{t:"sim",kind:"mode",title:"Сколько ждёт клиент",md:"Задайте длительность цепочки и режим. Красная полоса показывает, сколько времени клиент сидит с открытым соединением."},{t:"tabs",title:"Асинхронный запуск: принять, вернуть job_id, отдать результат по запросу",run:!0,langs:{php:e`<?php
// Асинхронно: принять запрос, вернуть job_id, работать в фоне, результат отдавать по job_id.
use Symfony\Component\HttpFoundation\{JsonResponse, Request};
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

final class ReviewController
{
    #[Route('/reviews', methods: ['POST'])]
    public function submit(Request $request, JobRepository $jobs, MessageBusInterface $bus): JsonResponse
    {
        $job = $jobs->create(status: 'queued', input: $request->toArray());   // таблица jobs
        $bus->dispatch(new RunReview($job->id));                                // в очередь (транспорт Messenger)
        return new JsonResponse(['job_id' => $job->id], 202);                   // клиент свободен
    }

    #[Route('/reviews/{id}', methods: ['GET'])]
    public function status(string $id, JobRepository $jobs): JsonResponse
    {
        $job = $jobs->get($id);
        return new JsonResponse(['status' => $job->status, 'result' => $job->result]);  // queued | running | done | failed
    }
}

#[AsMessageHandler]
final class RunReviewHandler   // воркер: php bin/console messenger:consume async
{
    public function __construct(private JobRepository $jobs, private ReviewPipeline $pipeline) {}

    public function __invoke(RunReview $message): void
    {
        $job = $this->jobs->get($message->jobId);
        $job->status = 'running';
        $job->result = $this->pipeline->run($job->input);   // diff → модель → проверка
        $job->status = 'done';
        $this->jobs->save($job);
    }
}`,js:e`// Асинхронно: принять запрос, вернуть job_id, работать в фоне, результат отдавать по job_id.
const jobs = new Map();                                    // в проде: таблица jobs в базе
let nextId = 1;

function submit(input) {                                   // POST /reviews → 202 { job_id }
  const id = 'job-' + nextId++;
  jobs.set(id, { status: 'queued', input, result: null });
  return id;
}
function status(id) { return jobs.get(id); }               // GET /reviews/{id}

async function worker() {                                  // фоновый обработчик (воркер)
  for (const [, job] of jobs) {
    if (job.status !== 'queued') continue;
    job.status = 'running';
    await sleep(400);                                      // здесь была бы цепочка: diff → модель → проверка
    job.status = 'done'; job.result = { severity: 'low', summary: 'ok' };
  }
}

const id = submit({ pullRequestId: 42 });
console.log('клиент получил:', id, '→', status(id).status, '(и свободен)');
worker();                                                  // воркер работает в фоне
for (let i = 1; i <= 3; i++) { await sleep(200); console.log('опрос', i, '→', status(id).status); }
console.log('результат:', status(id).result);`,py:e`# Асинхронно: принять запрос, вернуть job_id, работать в фоне, результат отдавать по job_id.
from uuid import uuid4
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()
jobs: dict[str, dict] = {}        # в проде: таблица jobs в базе, а воркер — Celery/RQ/очередь

def run_review(job_id: str) -> None:            # воркер
    job = jobs[job_id]
    job["status"] = "running"
    job["result"] = pipeline.run(job["input"])   # diff → модель → проверка
    job["status"] = "done"

@app.post("/reviews", status_code=202)
def submit(payload: dict, background: BackgroundTasks):
    job_id = str(uuid4())
    jobs[job_id] = {"status": "queued", "input": payload, "result": None}
    background.add_task(run_review, job_id)
    return {"job_id": job_id}                    # клиент свободен

@app.get("/reviews/{job_id}")
def status(job_id: str):
    return {k: jobs[job_id][k] for k in ("status", "result")}   # queued | running | done | failed`}},{t:"p",md:"**Очередь между источником и обработчиком** появляется как способ пережить всплески. Тысяча событий за секунду не должна превращаться в тысячу одновременных дорогих вызовов модели: события подождут и обработаются с контролируемой параллельностью. Своя цена у очереди тоже есть: повторная доставка, удаление дубликатов и отслеживание статусов. Заводят её тогда, когда разделение приёма и обработки действительно нужно."},{t:"toggle",title:"Подробнее: вопросы, по которым выбирают режим",blocks:[{t:"list",items:["Сколько обычно длится цепочка и насколько предсказуема её задержка?","Нужен ли результат пользователю прямо сейчас? Интерактивная классификация обращения и ночной разбор тысячи документов это разные сценарии.","Может ли процесс приостановиться в ожидании человека или внешней системы? Держать ради этого открытый HTTP-запрос неразумно.","Какой объём нагрузки ожидается?","Можно ли показать промежуточный результат? Для генеративного интерфейса streaming иногда даёт лучший опыт без перехода в фон."]},{t:"p",md:"На практике: ревью кода, которое стартует после открытия PR и работает несколько минут, собирается как `webhook → очередь → асинхронный workflow → комментарий`. Короткий фрагмент кода, отправленный в чат, обслуживается синхронным вызовом со streaming."}]},{t:"h2",text:"Главное"},{t:"key",md:"Триггер определяет, **когда** появляется запуск. Режим выполнения определяет, **как** вызывающая сторона с этим запуском взаимодействует. Решения связанные, но независимые, и выбирать их надо по отдельности."},{t:"olist",items:["Источник умеет отправлять события или его придётся опрашивать?","Какую задержку допускает сценарий?","Нужно обработать каждое событие или достаточно одного запуска со сводкой?","Может ли событие прийти повторно?","Должен ли пользователь ждать завершения?","Нужен ли streaming?","Нужна ли очередь для контроля нагрузки?"]},{t:"p",md:"Триггер выбран, режим выбран, цепочка запускается. Остаётся вопрос, ради которого написан следующий урок: что произойдёт, когда один из шагов завершится ошибкой."},{t:"toggle",title:"Самостоятельная работа: выберите запуск для своей цепочки",blocks:[{t:"olist",items:["Перечислите все поводы запустить вашу цепочку. Для каждого отметьте: событие приходит само или его придётся спрашивать.","Для каждого повода ответьте честно: нужен результат сразу или достаточно сводки за период.","Посчитайте цену. Для опроса: сколько запросов в сутки уйдёт впустую при выбранном интервале. Для события: сколько запусков в сутки создаст пиковая нагрузка. Важен порядок величин.","Для каждого повода решите, ждёт ли вызывающая сторона ответа в том же запросе. Если ждёт, укладывается ли цепочка в терпимое время и что будет при превышении.","Один асинхронный случай разберите до конца: как вызывающая сторона узнает результат (опрос по id, обратный вызов, сообщение в канал).","Опишите, что случится при двойной доставке одного события и что нужно, чтобы работа не выполнилась дважды."]},{t:"checklist",id:"l3-self",items:["Перечислены все поводы запуска, у каждого указан способ получения события","Для каждого повода есть ответ: сразу или сводкой","Посчитана цена в запросах или запусках за сутки","Для каждого повода выбран режим с обоснованием","Для одного асинхронного случая описан способ узнать результат","Описано поведение при двойной доставке"]}]},{t:"quiz",id:"q3",title:"Проверьте себя",questions:[{q:"Руководитель смотрит сводку по новым заказам один раз утром. Сейчас цепочка запускается webhook-ом на каждый заказ, за ночь набираются десятки запусков. Что изменить?",options:["Уменьшить интервал опроса","Перевести на запуск по расписанию с одной сводкой за период","Добавить второй webhook","Ничего, так быстрее"],answer:1,why:"Бизнесу нужна одна сводка, а не реакция на каждое событие. Расписание даёт один запуск вместо десятков."},{q:"Запуск: cron в 09:00 → взять вчерашние данные из своей базы → сформировать отчёт. Коллега называет это polling. Почему он неправ?",options:["Потому что cron это push","Потому что опроса внешнего источника нет: расписание отвечает только «когда», а данные лежат у себя","Потому что отчёт формируется моделью","Он прав"],answer:1,why:"Polling это периодический опрос внешнего источника. Здесь источника нет, есть только расписание."},{q:"Внешний сервис отдаёт данные только на чтение, webhook не поддерживает. Бизнес готов ждать результат до пяти минут. Что выбрать?",options:["Push через webhook","Опрос (polling) с интервалом не больше пяти минут, с учётом лимитов API","Запуск раз в сутки","Отказаться от задачи"],answer:1,why:"Источник не умеет push, значит выбор сделан за вас. Интервал подбирают под допустимую задержку."},{q:"Цепочка согласования может ждать решения менеджера час и больше. Сейчас клиент шлёт POST и держит соединение, получая streaming-ответ. Что изменить?",options:["Увеличить таймаут соединения до двух часов","Перейти на асинхронный режим: вернуть job_id, результат отдать опросом, callback-ом или сообщением","Убрать менеджера из цепочки","Сделать streaming быстрее"],answer:1,why:"Держать HTTP-соединение в ожидании человека неразумно. Асинхронный режим разделяет приём и работу."},{q:"Внешняя система иногда присылает событие о создании PR дважды, и цепочка запускается второй раз. Что предусмотреть на уровне триггера?",options:["Повторять запуск трижды для надёжности","Привязать триггер к устойчивому идентификатору события и отбрасывать дубликаты","Отключить webhook","Запускать цепочку только вручную"],answer:1,why:"По идентификатору события дубликат отличают от новой работы ещё до запуска цепочки."},{q:"Что такое execution?",options:["Описание цепочки в YAML","Один конкретный запуск цепочки","Ошибка выполнения","Очередь событий"],answer:1,why:"Десять событий породят десять executions одной и той же цепочки."}]}]})})();const o=t[0];export{o as default};
