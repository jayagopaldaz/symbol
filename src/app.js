import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { scene, getPresent, getCurrent, setPresent, getUpdate } from './mind.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/', (req, res) => { res.sendFile(path.join(process.cwd(), 'public/index.htm')); });
app.get('/scene',  async (req, res) => { res.send(await scene()); });
app.get('/get/present/:being', async (req, res) => { res.send(await getPresent(req.params.being)) });
app.get('/get/current/:being', async (req, res) => { res.send(await getCurrent(req.params.being)) });
app.post('/set/present/:being', async (req, res) => { res.send(await setPresent(req.params.being, req.body)) });
app.get('/get/update/:being',  async (req, res) => { res.send(await getUpdate(req.params.being)) });
app.listen(port, () => { console.log(`Server is running on http://localhost:${port}/`); });
