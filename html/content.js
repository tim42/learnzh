
import * as Loader from '###LOADER_MODULE_URL###';

(async function()
{
  const UiElements_module_name = await Loader.load_js_file('./front-end/ui-elements.js');
  const UiElements = await import(Loader.get_module(UiElements_module_name));

  // Init storage if not already present:
  if (!Loader.get_storage().text_study)
  {
    Loader.get_storage().text_study =
    {
      text: null,
    };
  }

  // return an array (one entry per line) containing arrays (one entry per sentence fragment)
  function get_split_text(text, title)
  {
    let lines = text.split('\n');
    let ret = [];
    lines.forEach((e) =>
    {
      ret.push({line: e.split(/([，；、。「」？！：“”《》『』〝〞…,.;:?!()\[\]])/g), words:{}, notes:''});
    });
    return ret;//{ title: lines[0], original_text: text, split_text: ret };
  }

  let Utils = {};
  Utils.Tooltip = class extends React.Component
  {
    constructor(props)
    {
      super(props);
      this.state =
      {
        has_definition: false,
      };
    }

    handle_play()
    {
      new Audio(`/api/tts/${this.props.text}`).play()
    }

    has_definition(v)
    {
      this.setState({has_definition: v});
    }

    render()
    {
      return (
        <div>
          <div>
            <span className="lead">{this.props.text}&nbsp;</span>
          </div>
          <hr />
          <div>
            <ReactBootstrap.Button className="btn-block" variant="secondary" onClick={() => this.handle_play()}><i className="fas fa-play"></i> Play TTS</ReactBootstrap.Button>
          </div>
          <div>
          <hr />
            <UiElements.Definition word={this.props.text} has_definition={(v)=>this.has_definition(v)}/>
            {this.state.has_definition && this.props.pin_definition &&
                <ReactBootstrap.Button className="btn-block" variant="secondary" onClick={() => this.props.pin_definition(this.props.text)}><i className="fas fa-thumbtack"></i> Pin Definition</ReactBootstrap.Button>
            }
          </div>
        </div>
      );
    }
  };

  Utils.TextEntry = class extends React.Component
  {
    render()
    {
      return (
        <span>
            <span onClick={(e)=>this.props.onClick(this.props.text)}>{this.props.text}</span>
        </span>
      );
    }
  };

  Utils.CreatePage = class extends React.Component
  {
    constructor(props)
    {
      super(props);
      this.state =
      {
        title: '',
        text:'',
        audio_file: null,
        audio_start: 0,
        audio_end: "2:00:00",

        is_creating: false,

        audio_data_url: null,
      };
    }

    set_file(e)
    {
      if (e.target.files.length > 0)
        this.setState({audio_file: e.target.files[0]});
      const file_type = e.target.files[0]?.type || '';
      const valid_file_type = file_type.startsWith('audio/') || file_type.startsWith('video/');

      this.setState({audio_data_url: null});
      if (valid_file_type)
      {
        const reader = new FileReader();
        const self = this;
        reader.addEventListener("load", function()
        {
          self.setState({audio_data_url: reader.result});
        }, false);
        reader.readAsDataURL(e.target.files[0]);
      }
    }

    create_new_entry()
    {
      const file_type = this.state.audio_file?.type || '';
      const invalid_file_type = !file_type.startsWith('audio/') && !file_type.startsWith('video/');
      const is_state_ok = !!(this.state.title && this.state.text && this.state.audio_file && !invalid_file_type)

      if (!is_state_ok)
      {
        return;
      }

      const form = new FormData();
      form.append("title", this.state.title);
      form.append("data", JSON.stringify(
      {
        title: this.state.title,
        text: this.state.text,
        audio_start: this.state.audio_start,
        audio_end: this.state.audio_end,
      }));
      form.append("audio-file", this.state.audio_file);

      this.setState({is_creating: true});

      Loader.post_file_content('/upload/text-study', form).then((r) => r.json()).then((data) =>
      {
        this.setState({is_creating: false});
        if (data.status == 'success')
        {
          this.props.history.push(`/text-study/page/${data.id}`);
        }
      });
    }

    render()
    {
      if (this.state.is_creating)
      {
        return (
            <div className="alert alert-secondary" role="alert">
              <div className="jumbotron">
                <h3>Creating entry...</h3>
                <p>You will be redirected when it's done</p>
              </div>
            </div>
        );
      }

      const file_type = this.state.audio_file?.type || '';
      const invalid_file_type = !file_type.startsWith('audio/') && !file_type.startsWith('video/');
      const is_state_ok = !!(this.state.title && this.state.text && this.state.audio_file && !invalid_file_type)
      return (
        <div>
          <h1>
              Create Text Study Entry
          </h1>
          <hr />
          <p>Please fill the information:</p>
          <ReactBootstrap.Form>
            <ReactBootstrap.Form.Label>Title:</ReactBootstrap.Form.Label>
            <ReactBootstrap.Form.Control as='input' onChange={(e) => this.setState({title: e.target.value})} value={this.state.title || ''} placeholder="Title"/>

            <ReactBootstrap.Form.Label>Text:</ReactBootstrap.Form.Label>
            <ReactBootstrap.Form.Control as='textarea' onChange={(e) => this.setState({text: e.target.value})} rows={10}  value={this.state.text || ''} placeholder="Content"/>

            <hr />

            <ReactBootstrap.Form.File label="Audio File:" accept="audio/*" placeholder="Audio file" onChange={(e) => this.set_file(e)}/>
            { file_type && invalid_file_type && <ReactBootstrap.Alert variant="danger">Invalid file type: '{file_type}'. Expecting an audio file.</ReactBootstrap.Alert> }
            { this.state.audio_data_url && <div><audio controls src={`${this.state.audio_data_url}#t=${this.state.audio_start},${this.state.audio_end}`}/></div> }

            <ReactBootstrap.Form.Label>Audio Start At:</ReactBootstrap.Form.Label>
            <ReactBootstrap.Form.Control as='input' onChange={(e) => this.setState({audio_start: e.target.value})} value={this.state.audio_start} placeholder="Audio Start At"/>

            <ReactBootstrap.Form.Label>Audio End At:</ReactBootstrap.Form.Label>
            <ReactBootstrap.Form.Control as='input' onChange={(e) => this.setState({audio_end: e.target.value})} value={this.state.audio_end} placeholder="Audio End At"/>

            <hr />

            <ReactBootstrap.Button className="btn-block" variant="primary" onClick={() => this.create_new_entry()} disabled={!is_state_ok}>Create new entry</ReactBootstrap.Button>
          </ReactBootstrap.Form>
        </div>
      );
    }
  };

  Utils.ListPage = class extends React.Component
  {
    constructor(props)
    {
      super(props);
      this.state =
      {
        loading: true,
        list: [],
      };
      this.reload(true);
    }

    reload(initial)
    {
      if (!initial)
        this.setState({loading: true, list: []});

      Loader.fetch_file_content('/api/data/list_entries/text-study').then((response) => response.json()).then((obj) =>
      {
        obj.pop(); // remove the last (empty) entry
        this.setState({ loading: false, list: obj});
      });
    }

    delete_entry(id)
    {
      Loader.post_file_content(`/api/data/delete_entry/text-study/${id}`).then((r) => this.reload());
    }

    render()
    {
      if (this.state.loading)
      {
        return (
          <div>loading...</div>
        );
      }

      return (
        <div>
          <h1>
            Text Study List:
            <ReactRouterDOM.Link className="btn btn-secondary float-right" to={'/text-study/create'} role="button"><i className="fas fa-plus-square"></i> Create New</ReactRouterDOM.Link>
          </h1>
          <UiElements.ManagedList className="zh-darker" style={{marginBottom:'5px'}} deletable on_delete={(elem) => this.delete_entry(elem.id)} list={this.state.list} element={(elem, index) =>
            (<ReactRouterDOM.Link className="btn btn-block btn-secondary" to={`/text-study/page/${elem.id}`}>{elem.title}</ReactRouterDOM.Link>)
            } />

          { (this.state.list.length == 0) &&
            <div className="alert alert-info" role="alert">
              <div className="jumbotron">
                <p>Looks like it's empty in there. You may want to add a new entry.</p>
                <ReactRouterDOM.Link className="btn btn-info btn-block" to={'/text-study/create'} role="button"><i className="fas fa-plus-square"></i> Create New</ReactRouterDOM.Link>
              </div>
            </div>
          }
        </div>
      );
    }
  };

  // props:
  //  - handle_selection (event, index)
  //  - set_selected_text (event)
  //  - line (the line object)
  //  - line_data_changed : function (line_object, line_index)
  Utils.LineEntry = class extends React.Component
  {
    delete_definition(word)
    {
      let line = this.props.line;
      delete line.words[word];
      this.props.line_data_changed(this.props.line, this.props.line_index);
      this.state = { dummy: 0 };
    }

    toggle_play_line()
    {
      if (this.props.audio_player_ref.current.paused || this.props.audio_player_ref.current.currentTime < this.props.line.audio_start)
      {
        this.props.audio_player_ref.current.currentTime = this.props.line.audio_start;
        this.props.audio_player_ref.current.play();
      }
      else
      {
        this.props.audio_player_ref.current.pause();
      }
    }

    pause()
    {
    }

    set_audio_start()
    {
      let line = this.props.line;
      line.audio_start = this.props.audio_player_ref.current.currentTime;
      this.props.line_data_changed(this.props.line, this.props.line_index);
    }

    render()
    {
      if (this.props.line.line.length <= 1)
        return (<br/>);

      return (
        <div>
          <div className="lead row" onMouseUp={(e)=>this.props.handle_selection(e)} onDoubleClick={(e)=>this.props.handle_selection(e)}>
            <div className="col-2">
              <ReactBootstrap.Button variant="secondary" onClick={() => this.toggle_play_line()}><i className="fas fa-play"></i><i className="fas fa-pause"></i></ReactBootstrap.Button>
              {' '}
              {this.props.show_config && <ReactBootstrap.Button variant="secondary" onClick={() => this.set_audio_start()}><i className="fas fa-thumbtack"></i></ReactBootstrap.Button>}
            </div>
            <div className="col-10">
              <UiElements.List list={this.props.line.line} element={(elem, index) => 
                (<Utils.TextEntry text={elem} onClick={(e)=>this.props.set_selected_text(e)}/>)
              } />
            </div>
          </div>
          { Object.keys(this.props.line.words).length ? <span></span> : <br/> }
          <div className="zh-darker">
            <UiElements.ManagedList deletable={this.props.show_config} on_delete={(elem) => this.delete_definition(elem)} list={Object.keys(this.props.line.words)} element={(elem, index) =>
              (<UiElements.Definition word={elem} short/>)
              } />
          </div>
        </div>
      );
    }
  };

  Utils.TextStudyPage = class extends React.Component
  {
    constructor(props)
    {
      super(props);

      this.state =
      {
        id: this.props.id || this.props.match.params.id,

        text: null,
        is_loading: true,

        show_config: false,

        selected_text: '',
        selected_line_index: 0,
      };

      this.audio_player_ref = React.createRef();

      this.reload(true);
    }

    reload(initial)
    {
      if (!initial)
        this.setState({loading: true, text: null});

      Loader.fetch_file_content(`/data/text-study/${this.state.id}.json`).then((response) => response.json()).then((obj) =>
      {
        if (!obj.split_text)
          obj.split_text = get_split_text(obj.text);
        this.setState({ is_loading: false, text: obj});
      });
    }

    toggle_config()
    {
      this.setState((state) => ({show_config: !state.show_config}));
    }

    save()
    {
      Loader.put_file_content(`/api/data/update_entry/text-study/${this.state.id}`, JSON.stringify(this.state.text));
    }

    rewind(at)
    {
      this.audio_player_ref.current.currentTime = at;
    }

    set_audio_start(line)
    {
      if (line === null)
      {
        const now = this.audio_player_ref.current.currentTime;
        this.setState((state, props) => 
        {
          state.text.audio_start = now;
          return state;
        });
      }
      else
      {
      }
    }

    handle_selection(e, line_index)
    {
      let selected_text = window.getSelection().toString();
      this.setState({selected_line_index: line_index, selected_text: selected_text});
    }

    set_selected_text(text, line_index)
    {
      let selected_text = window.getSelection().toString();
      text = selected_text || text;
      this.setState({selected_line_index: line_index, selected_text: text});
    }

    pin_definition(text)
    {
      this.setState((state, props) =>
      {
        let new_text = state.text;
        new_text.split_text[state.selected_line_index].words[text] = text;
        return { text: new_text };
      });
    }

    line_data_changed(line, line_index)
    {
      this.setState((state) =>
      {
        state.text.split_text[line_index] = line;
        return state;
      });
    }

    render()
    {
      if (this.state.is_loading)
      {
        return (
          <div>
            Loading...
          </div>
        );
      }

      let split_text = this.state.text.split_text;
      return (
        <div>
          <h1>
            Text Study&nbsp;
            <span className="badge badge-secondary">{this.state.text?.title || ''}</span>
            <span className="float-right" >
              <ReactBootstrap.Button variant="secondary" onClick={() => this.toggle_config()}><i className="fas fa-cog"></i></ReactBootstrap.Button>
              {' '}
              <ReactBootstrap.Button variant="primary" onClick={() => this.save()}><i className="fas fa-save"></i> Save</ReactBootstrap.Button>
            </span>
          </h1>
          <hr />

          <div className="row">
            <div ><audio ref={this.audio_player_ref} controls src={`/data/text-study/${this.state.id}.data`} preload={"true"} /></div>

            <div className="col-8">
              <ReactBootstrap.Button variant="info" onClick={() => this.rewind(this.state.text.audio_start)}><i className="fas fa-step-backward"></i> Rewind</ReactBootstrap.Button>
              {' '}
              {this.state.show_config && <ReactBootstrap.Button variant="secondary" onClick={() => this.set_audio_start(null)}><i className="fas fa-thumbtack"></i> Set start to now</ReactBootstrap.Button>}
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-8">
              <UiElements.List list={split_text} element={(elem, line_index) =>
                (<Utils.LineEntry line={elem}
                  line_data_changed={(l, i)=>this.line_data_changed(l, line_index)}
                  handle_selection={(e, i)=>this.handle_selection(e, line_index)}
                  set_selected_text={(e)=>this.set_selected_text(e, line_index)}
                  show_config={this.state.show_config}
                  audio_player_ref={this.audio_player_ref}
                />)
              }/>
            </div>
            <div className="col-4 zh-darker">
              { this.state.selected_text && <Utils.Tooltip text={this.state.selected_text} pin_definition={(t) => this.pin_definition(t)}/> }
            </div>
          </div>
        </div>
      );
    }
  }

  class TextStudyRouter extends React.Component
  {
    render()
    {
      return (
        <div>
          <ReactRouterDOM.Switch>
            <ReactRouterDOM.Route exact path={this.props.match.path} component={Utils.ListPage} />
            <ReactRouterDOM.Route path={`${this.props.match.path}/create`} component={Utils.CreatePage} />
            <ReactRouterDOM.Route path={`${this.props.match.path}/page/:id`} component={Utils.TextStudyPage} />
          </ReactRouterDOM.Switch>
        </div>
      );
    }
  };

  // register the routes:
  import(Loader.get_module('./app.js')).then((App) =>
  {
    App.Routes.add_route('text study', '/text-study', TextStudyRouter);
  });
})();
