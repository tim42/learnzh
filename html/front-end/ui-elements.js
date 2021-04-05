
import * as Loader from '###LOADER_MODULE_URL###';

function remove_last_element(ar)
{
  ar.pop();
  return ar;
}

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
    skip_initial_state || this.props.has_definition && this.props.has_definition(false);

    Loader.fetch_file_content(`/api/info/${this.props.word}`).then((response) => response.text()).then((text) =>
    {
      const definitions = JSON.parse(text);
      const has_definition = (!!text && definitions?.entries.length > 0) || false;
      this.props.has_definition && this.props.has_definition(has_definition);
      this.setState(
        {
          loading: false,
          has_definition: has_definition,
          definition_json: definitions
        });
    })
    .catch((e) =>
    {
      console.error(e);
      this.props.has_definition && this.props.has_definition(false);
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
              <dd className="col-sm-9"><ul style={{margin:"0px"}} className="list-inline">{remove_last_element(e.description.split('\n')).map((e, idx) => <li key={idx} className="list-inline-item border border-secondary px-1">{e}</li>)}</ul></dd>
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
              <div><ul>{remove_last_element(e.description.split('\n')).map((e, idx) => <li key={idx}>{e}</li>)}</ul></div>
            </div>
          )}</span>
        );
      }
    }
  }
};

// List where you can remove elements
// Takes a 'list', an 'element' props, a 'deletable' boolean, and a 'on_delete' event (if deletable is not false)
// the 'element' props should be a function with this signature: function (entry, index)
// It forward the className and style prop to the div containing the row
export let ManagedList = class extends React.Component
{
  render()
  {
    return (
      <div>
        { this.props.list.map((entry, index) =>
          <div className={"row " + (this.props.className || '')} style={this.props.style} key={index}>
            <div className={this.props.deletable ? "col-11" : "col-12"}>{this.props.element(entry, index)}</div>
            {this.props.deletable && <div className="col-1">
              <ReactBootstrap.Button className="btn-block" variant="danger" onClick={() => this.props.on_delete(entry, index, this.props.list)}><i className="fas fa-minus-square"></i></ReactBootstrap.Button>
            </div>}
          </div>
        )}
      </div>
    );
  }
};

// Barebone list element. Props are:
//  - list: the list of things to print
//  - element: a function(entry, index) that is called for each element
export let List = class extends React.Component
{
  render()
  {
    return (
      <>
        { this.props.list.map((entry, index) =>
          (<React.Fragment key={index}>{this.props.element(entry, index)}</React.Fragment>)
        )}
      </>
    );
  }
};
