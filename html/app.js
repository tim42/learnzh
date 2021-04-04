
import * as Loader from '###LOADER_MODULE_URL###';

document.body.innerHTML = '<div id="root"></div>'; // clear the 'fail-to-load' message as we are loading correctly

// Base level roots (or pages/sub-apps)
export let Routes =
{
    routes: [],
    add_route(name, path, element)
    {
      this.routes.push({ name: name, path: path, element: element });
      Loader.refresh_app();
    }
};

let AppRoot = class extends React.Component
{
  render()
  {
    return (
      <ReactRouterDOM.HashRouter>
        <ReactBootstrap.Navbar bg="dark" variant="dark">
          <ReactBootstrap.Navbar.Brand>LearnZH</ReactBootstrap.Navbar.Brand>
          <ReactBootstrap.Nav className="mr-auto">
            {
              Routes.routes.map((entry, index) =>
                <ReactRouterDOM.Link key={index} className="btn btn-secondary" to={entry.path} role="button" >{entry.name}</ReactRouterDOM.Link>
            )}
          </ReactBootstrap.Nav>
          <ReactBootstrap.Form>
            <ReactBootstrap.Button variant="outline-danger" onClick={Loader.reload_js_files}><i className="fas fa-sync"></i> Reload Scripts</ReactBootstrap.Button>
          </ReactBootstrap.Form>
        </ReactBootstrap.Navbar>
        <div className="content">
          { Loader.has_loads_in_progress() ? (<h3>LOADING...</h3>) : (<AppContentRoot {...this.props} />) }
        </div>
      </ReactRouterDOM.HashRouter>
    );
  }
}

let AppBigCodeFailure = class extends React.Component
{
  render(is_bad_code)
  {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="jumbotron">
          <h1 className="display-4">There... Might be an issue with this... pile of steaming code</h1>
          <p className="lead">Call your nearest programmer, fire an issue, this site is not working.</p>
          <hr className="my-4" />
          <p>Read the console for more information...</p>
          <p>Once fixed, click this button:</p>
          <ReactBootstrap.Button variant="danger" onClick={Loader.reload_js_files} className="btn-block"><i className="fas fa-sync"></i> Reload Scripts</ReactBootstrap.Button>
        </div>
      </div>
    );
  }
}

let AppContentRoot = class extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = { bad_code: props.bad_code };
  }

  componentDidCatch(error, info)
  {
    this.setState({ bad_code: true });
    console.error('application failed with:', error, info);
  }

  render()
  {
    if (this.state.bad_code || this.props.bad_code)
      return <AppBigCodeFailure />;

    return (
      <ReactRouterDOM.Switch>
          {
            Routes.routes.map((entry, index) =>
              <ReactRouterDOM.Route key={index} path={entry.path} component={entry.element} />
          )}
      </ReactRouterDOM.Switch>
    );
  }
}

// Load the remaining scripts:
Loader.load_js_file('content.js');

// Run the app
Loader.refresh_app.cb = function()
{
  try
  {
    ReactDOM.render(<AppRoot />, document.getElementById('root'));
  }
  catch (e)
  {
    console.error('application failed with: ', e);
    try
    {
      ReactDOM.render(<AppRoot bad_code/>, document.getElementById('root'));
    }
    catch (e)
    {
      console.error('application double-failed with: ', e);
      // App seems to be borked, so we fallback to the component itself (which is simpler)
      ReactDOM.render(<AppBigCodeFailure/>, document.getElementById('root'));
    }
  }
};



