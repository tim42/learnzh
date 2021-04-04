
import * as Loader from '###LOADER_MODULE_URL###';

export let Definition = class extends React.Component
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
    this.do_query({word:null}, true);
  }

  do_query(prevProps, skip_initial_state)
  {
    if (prevProps.word == this.props.word)
      return;
    if (!this.props.word)
      return;

    skip_initial_state || this.setState({loading:true, has_definition: false, definition: null});

    Loader.fetch_file_content(`/api/info/${this.props.word}`).then((response) => response.text()).then((text) =>
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

  handle_play()
  {
    new Audio(`/api/tts/${this.props.word}`).play()
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
          <span>{this.state.definition_json.entries.map((e, idx) =>
            <dl key={idx} className="row" style={{margin:"0px"}}>
              <dt className="col-sm-3 lead" onClick={()=>this.handle_play()}><span className="badge badge-secondary">{e.word}</span><span className="badge badge-success">{e.zhuyin}</span></dt>
              <dd className="col-sm-9"><ul style={{margin:"0px"}} className="list-inline">{e.description.split('\n').map((e, idx) => <li key={idx} className="list-inline-item">{e}</li>)}</ul></dd>
            </dl>
          )}</span>
        );
      }
      else
      {
        return (
          <span>{this.state.definition_json.entries.map((e, idx) =>
            <div key={idx} className="text-left">
              <div className="lead" onClick={()=>this.handle_play()}><b><span className="badge badge-secondary">{e.word}</span><span className="badge badge-success">{e.zhuyin}</span></b></div>
              <div><ul>{e.description.split('\n').map((e, idx) => <li key={idx}>{e}</li>)}</ul></div>
            </div>
          )}</span>
        );
      }
    }
  }
};
