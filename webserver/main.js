

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const execSync = require('child_process').execSync;
const fs = require('fs');
const express = require('express');
const multer = require('multer');


// ////// light utilities:
async function get_word_info(word)
{
  const info = await exec(`./learnzh api --query=info "${word}"`);
  return info.stdout;
}

async function get_tts_mp3(query)
{
  const info = await exec(`./learnzh api --query=tts-tw "${query}"`, { encoding: 'binary' });
  return info.stdout;
}

// returns the ID of the entry
// Assumes data is already a string
async function create_new_entry(target, file, title, data)
{
  const proc = exec(`./learnzh api --query=create_entry "${target}" "${file}" "${title}"`);
  proc.child.stdin.write(data);
  proc.child.stdin.end();
  return (await proc).stdout;
}

async function list_entries(target)
{
  const proc = exec(`./learnzh api --query=list_entries "${target}"`);
  return (await proc).stdout;
}

// Assumes data is already a string
async function update_entry(target, id, data)
{
  const proc = exec(`./learnzh api --query=update_entry "${target}" "${id}"`);
  proc.child.stdin.write(data);
  proc.child.stdin.end();
  return (await proc).stdout;
}

async function delete_entry(target, id)
{
  const proc = exec(`./learnzh api --query=delete_entry "${target}" "${id}"`);
  return (await proc).stdout;
}

function get_conf_variable(name)
{
  return execSync(`./learnzh api --query=get-conf "${name}"`);
}

// ////// APP:

const app = express();


const port = (+process.argv[2]) || 3301;
const data_path = get_conf_variable('conf_base_path') + '/data/';
const upload_temp_path = data_path + '/upload/';

const upload = multer({ dest: upload_temp_path, limits: { fileSize: 4 * 1024 * 1024 /* 4MB */}});

// ////// ROUTES:

app.use(express.json())
app.use(express.text());

// static files for the web-app:
app.use(express.static('./html'));

app.use('/data', express.static(data_path));

// API queries:
app.get('/api/info/:word', async function(req, res)
{
  const word = req.params.word;
  const response = await get_word_info(word);
  res.send(response);
  res.end();
});
app.get('/api/tts/:query', async function(req, res)
{
  const query = req.params.query;
  const response = await get_tts_mp3(query);
  res.type('audio/mp3');
  res.end(response, 'binary');
});

app.get('/api/data/list_entries/:target', async function(req, res)
{
  res.send(JSON.parse(await list_entries(req.params.target)));
  res.end();
});

app.put('/api/data/update_entry/:target/:id', async function(req, res)
{
  res.send(JSON.parse(await update_entry(req.params.target, req.params.id, req.body)));
  res.end();
});

app.post('/api/data/delete_entry/:target/:id', async function(req, res)
{
  res.send(await delete_entry(req.params.target, req.params.id));
  res.end();
});

// Upload:
app.post('/upload/:target', upload.single('audio-file'), async function (req, res)
{
  const audio_file = req.file.path;
  const target = req.params.target;

  console.log(`received ${target}: `, req.body.title);

  const response = await create_new_entry(target, audio_file, req.body.title, req.body.data);
  res.send({ status: 'success', id: response });

  // delete temp file:
  try
  {
    fs.unlinkSync(audio_file);
  }
  catch (e) {}
  res.end();
});

app.listen(port, function()
{
  console.log(`listening at http://localhost:${port}`);
  console.log(`using data dir file://${data_path}`);
});
