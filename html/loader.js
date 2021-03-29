
// returns a promise
function fetch_file_content(file_url)
{
  return fetch(file_url, { method: 'GET', mode: 'same-origin', credentials: 'include'});
}

function create_script_tag(content, id)
{
  let new_script = document.createElement("script");
  new_script.setAttribute('id', id);
  let inline_script = document.createTextNode(content);
  new_script.appendChild(inline_script); 

  let e = document.getElementById(id);
  if (e)
  {
    e.outerHTML = '';
  }

  document.head.appendChild(new_script);
}

function transpile_script(script)
{
  return Babel.transform(script, { presets: ["react", "es2017"] }).code;
}


let loads_in_progress = 0;
let script_store = {};
let persistent_storage = {};

// does not return. Load and transpile a JS file.
function load_js_file(file_url, is_async)
{
  is_async = is_async || false;
  is_async || ++loads_in_progress;
  let has_decremented = false;

  script_store[file_url] = file_url;

  fetch_file_content(file_url)
    .then(function(response)
    {
      return response.text();
    })
    .then(function(text)
    {
      is_async || --loads_in_progress;
      has_decremented = true;
      create_script_tag(transpile_script(text), file_url);

      refresh_app && refresh_app();
    })
    .catch(function(x)
    {
      !has_decremented && (is_async || --loads_in_progress);
      console.error(`Failed to load ${file_url}`, x);
    });
}

function has_loads_in_progress()
{
  return loads_in_progress > 0;
}

function get_storage()
{
  return persistent_storage;
}

function reload_js_files()
{
  console.log('reloading all scripts');

  for (const [url, id] of Object.entries(script_store))
  {
    console.log(`  reloading ${url}...`);
    let e = document.getElementById(id);
    if (e)
    {
      e.outerHTML = '';
    }

    load_js_file(url);
  }
}
