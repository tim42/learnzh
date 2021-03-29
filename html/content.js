
// Init storage if not already present:

if (!get_storage().text_study)
{
  get_storage().text_study =
  {
    text: "",
    
  };
}

// return an array (one entry per line) containing arrays (one entry per sentence fragment)
function get_split_text(text)
{
  let lines = text.split('\n');
  let ret = [];
  lines.forEach((e) =>
  {
    ret.push({line: e.split(/([，；、。「」？！：“”《》『』〝〞…,.;:?!()\[\]])/g), words:{}, notes:''});
  });
  return ret;
}

window.App.Content =
{
    TextStudy: class extends React.Component
    {
      constructor(props)
      {
        super(props);

        this.state =
        {
          text: get_split_text(get_storage().text_study.text),
          in_set_text_mode: !get_storage().text_study.text,

          selected_text: '',
          selected_line_index: 0,
        };
      }

      toggle_set_text(value)
      {
        this.setState({in_set_text_mode: value});
      }

      set_text(text)
      {
        get_storage().text_study.text = text;
        this.setState({text: get_split_text(text)});
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
          new_text[state.selected_line_index].words[text] = text;
          return { text: new_text };
        });
      }

      render()
      {
        if (this.state.in_set_text_mode)
        {
          return (
            <div>
              <h1>
                  Text Study
              </h1>
              <hr />
              <p>Please enter the text:</p>
              <ReactBootstrap.Form>
                <ReactBootstrap.Form.Control as='textarea' onChange={(e) => this.set_text(e.target.value)} rows={10}  value={this.state.text}/>
                <ReactBootstrap.Button className="btn-block" variant="primary" onClick={() => this.toggle_set_text(false)}>Apply</ReactBootstrap.Button>
              </ReactBootstrap.Form>
            </div>
          );
        }

        let split_text = this.state.text;
        return (
          <div>
            <h1>
              Text Study
              <ReactBootstrap.Button variant="secondary" className="float-right" onClick={() => this.toggle_set_text(true)}><i className="fas fa-edit"></i> Set Text</ReactBootstrap.Button>
            </h1>
            <hr />
            <div className="row">
              <div className="col-8">
                {split_text.map((e, i) =>
                  <div>
                    <div className="lead" onMouseUp={(e)=>this.handle_selection(e, i)} onDoubleClick={(e)=>this.handle_selection(e, i)}>
                      {e.line.map((e) =>
                        <App.Content.TextStudy.TextEntry onClick={(text) => this.set_selected_text(text, i)} text={e} />
                      )}
                    </div>
                  { Object.keys(e.words).length ? <span></span> : <br/> }
                  {Object.keys(e.words).map((e) =>
                      <App.Content.TextStudy.Definition word={e} short/>
                  )}
                  </div>
                )}
              </div>
              <div className="col-4 zh-darker">
                <App.Content.TextStudy.Tooltip text={this.state.selected_text} pin_definition={(t) => this.pin_definition(t)}/>
              </div>
            </div>
          </div>
        );
      }
    }
};

window.App.Content.TextStudy.Tooltip = class extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  handle_play()
  {
    new Audio(`/api/tts/${this.props.text}`).play()
  }

  render()
  {
    return (
      <div>
        <div>
          <span className="lead">{this.props.text}&nbsp;</span>
        </div>
        <div>
          <ReactBootstrap.Button className="btn-block" variant="secondary" onClick={() => this.handle_play()}><i className="fas fa-play"></i></ReactBootstrap.Button>
        </div>
        <hr />
        <div>
          <App.Content.TextStudy.Definition word={this.props.text} />
          {this.props.pin_definition && <ReactBootstrap.Button className="btn-block" variant="secondary" onClick={() => this.props.pin_definition(this.props.text)}><i className="fas fa-thumbtack"></i> Pin Definition</ReactBootstrap.Button> }
        </div>
      </div>
    );
  }
};

window.App.Content.TextStudy.Definition = class extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      loading: true,
      has_definition: false,
      definition: null,
    };
    this.do_query({word:null});
  }

  do_query(prevProps)
  {
    if (prevProps.word == this.props.word)
      return;
    if (!this.props.word)
      return;

    this.setState({loading:true, has_definition: false, definition: null});

    fetch_file_content(`/api/info/${this.props.word}`).then((response) => response.text()).then((text) =>
    {
      this.setState(
        {
          loading: false,
          has_definition: !!text,
          definition_json: JSON.parse(text)
        });
    })
    .catch((e) =>
    {
      console.error(e);
      this.setState(
        {
          loading: false,
          has_definition: false,
          definition_json: null
        });
    });
  }

  componentDidUpdate(prevProps)
  {
    this.do_query(prevProps);
  }

  render()
  {
    if (this.state.loading)
    {
      return (
        <span>loading definition for <b>{this.props.word}</b>...</span>
      );
    }
    else if (!this.state.has_definition)
    {
      return (
        <span>no definition for <b>{this.props.word}</b></span>
      );
    }
    else
    {
      if (this.props.short)
      {
        return (
          <span>{this.state.definition_json.entries.map((e) =>
            <dl className="row" style={{margin:"0px"}}>
              <dt className="col-sm-2 lead"><span className="badge badge-secondary">{e.word}</span><span className="badge badge-success">{e.zhuyin}</span></dt>
              <dd className="col-sm-10"><ul style={{margin:"0px"}} className="list-inline">{e.description.split('\n').map((e) => <li className="list-inline-item">{e}</li>)}</ul></dd>
            </dl>
          )}</span>
        );
      }
      else
      {
        return (
          <span>{this.state.definition_json.entries.map((e) =>
            <div className="text-left">
              <div className="lead"><b><span className="badge badge-secondary">{e.word}</span><span className="badge badge-success">{e.zhuyin}</span></b></div>
              <div><ul>{e.description.split('\n').map((e) => <li>{e}</li>)}</ul></div>
            </div>
          )}</span>
        );
      }
    }
  }
};

window.App.Content.TextStudy.TextEntry = class extends React.Component
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
