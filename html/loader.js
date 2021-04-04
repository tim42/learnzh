
// This is a badly written module manager / dynamic script (re)loader
// Its main purpose is to allow reloading the scripts while the data is kept alive

let loads_in_progress = 0;
let script_store = {};
let persistent_storage = {};
let dyn_modules = {};

export let refresh_app = function() { refresh_app.cb && queueMicrotask(refresh_app.cb) };
refresh_app.cb = null;

export function get_module(id)
{
  return dyn_modules[id] || id;
}

// returns a promise
export function fetch_file_content(file_url)
{
  return fetch(file_url, { method: 'GET', mode: 'same-origin', credentials: 'include'});
}

export function post_file_content(file_url, content)
{
  return fetch(file_url, { method: 'POST', body: content});
}

export function put_file_content(file_url, content)
{
  return fetch(file_url, { method: 'PUT', body: content});
}

export function create_script_tag(content, id)
{
  let blob_url = URL.createObjectURL(new Blob([content], {type: 'application/javascript'}));

  dyn_modules[id] = blob_url;

  let new_script = document.createElement("script");
  new_script.setAttribute('id', id);
  new_script.setAttribute('type', 'module');
  new_script.setAttribute('src', blob_url);
  new_script.textContent = content;
//   let inline_script = document.createTextNode(content);
//   new_script.appendChild(inline_script);

  let e = document.getElementById(id);
  if (e)
  {
    e.outerHTML = '';
  }

  document.head.appendChild(new_script);
}

export function transpile_script(script)
{
  return Babel.transform(script, { presets: ["react", "es2017"] }).code;
}

// does not return. Load and transpile a JS file.
// is_async : a value of true (default is false) will not account the load in the 'has_loads_in_progress' and not trigger a call to refresh_app()
export function load_js_file(file_url, is_async)
{
  // already loaded, no need to do anything
  const ret_promise = new Promise(function (resolve, reject)
  {
    if (script_store[file_url] == file_url)
      return resolve(get_module(file_url));

    is_async = is_async || false;
    is_async || ++loads_in_progress;
    let has_decremented = false;

    console.debug(`  enqueing loading of ${file_url}   [queue size: ${loads_in_progress}]`);

    script_store[file_url] = file_url;

    fetch_file_content(file_url)
      .then(function(response)
      {
        return response.text();
      })
      .then(function(text)
      {
        console.debug(`  running ${file_url}   [queue size: ${loads_in_progress}]`);
        try
        {
          create_script_tag(transpile_script(text.replaceAll('###LOADER_MODULE_URL###', import.meta.url)), file_url);
          resolve(get_module(file_url));
        }
        catch (e)
        {
          console.error(`script ${file_url} failed with: `, e);
          reject();
        }

        is_async || --loads_in_progress;
        has_decremented = true;
      })
      .catch(function(x)
      {
        !has_decremented && (is_async || --loads_in_progress);
        console.error(`Failed to load ${file_url}`, x);
        reject();
      });
  });
  return ret_promise;
}

export function has_loads_in_progress()
{
  return loads_in_progress > 0;
}

export function get_storage()
{
  return persistent_storage;
}

export function reload_js_files()
{
  console.debug('reloading all scripts');

  const script_store_cpy = script_store;
  script_store = {};

  for (const [url, id] of Object.entries(script_store_cpy))
  {
    let e = document.getElementById(id);
    if (e)
    {
      e.outerHTML = '';
    }

    load_js_file(url);
  }
}
