const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

const notes = [];
for (let i = 0; i < 21; i++) {
  notes.push({id: `${i}`, text: `Note ${i}`, updated: Date.now() + i, version: 1});
}
let lastUpdated = notes[notes.length - 1].updated;
const pageSize = 10;

const router = new Router();
router.get('/note', ctx => {

  const clientLastUpdated = parseInt(ctx.request.query.lastUpdated);
  ctx.response.body = notes
    .filter(n => clientLastUpdated ? n.updated > clientLastUpdated: true)
    .sort((n1, n2) => -(n1.updated - n2.updated));
  ctx.response.status = 200;
});

const broadcast = (data) =>
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

router.put('/note/:id', ctx => {
  const note = ctx.request.body;
  const id = ctx.params.id;
  const index = notes.findIndex(n => n.id === id);
  if (id !== note.id || index === -1) {
    ctx.response.body = {text: 'Note not found'};
    ctx.response.status = 400;
  } else if (note.version < notes[index].version) {
    ctx.response.body = notes[index];
    ctx.response.status = 409;
  } else {
    lastUpdated = note.updated = Date.now();
    note.version++;
    notes[index] = note;
    ctx.response.body = note;
    ctx.response.status = 200;
    broadcast(note);
  }
});

setInterval(() => {
  lastUpdated = Date.now();
  console.log(`Updated ${notes[0].id}`);
  notes[0].text = notes[0].text + '.';
  notes[0].updated =lastUpdated;
  broadcast(notes[0]);
}, 5000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);