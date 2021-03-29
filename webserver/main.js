

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const express = require('express');


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

const app = express();
const port = (+process.argv[2]) || 3301;

app.use(express.static('html')); // static files

app.get('/api/info/:word', async function(req, res)
{
    const word = req.params.word;
    const response = await get_word_info(word);
    res.send(response);
});
app.get('/api/tts/:query', async function(req, res)
{
    const query = req.params.query;
    const response = await get_tts_mp3(query);
    res.type('audio/mp3');
    res.end(response, 'binary');
});

app.listen(port, function()
{
  console.log(`listening at http://localhost:${port}`);
});
