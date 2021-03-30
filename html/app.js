
// clear the 'fail-to-load' message as we are loading correctly
document.body.innerHTML = '<div id="root"></div>';

window.App =
{
  Root: class extends React.Component
  {
    constructor(props) { super(props); }

    reload_scripts()
    {
      reload_js_files();
    }

    render()
    {
      return (
        <div>
          <ReactBootstrap.Navbar bg="dark" variant="dark">
            <ReactBootstrap.Navbar.Brand>LearnZH</ReactBootstrap.Navbar.Brand>
            <ReactBootstrap.Nav className="mr-auto">
              <ReactBootstrap.Nav.Link href="#">...</ReactBootstrap.Nav.Link>
            </ReactBootstrap.Nav>
            <ReactBootstrap.Form>
              <ReactBootstrap.Button variant="outline-danger" onClick={reload_js_files}><i className="fas fa-sync"></i> Reload Scripts</ReactBootstrap.Button>
            </ReactBootstrap.Form>
          </ReactBootstrap.Navbar>
          <div className="content">
          { has_loads_in_progress() ? (<h3>LOADING...</h3>) : (<App.ContentRoot {...this.props} />) }
          </div>
        </div>
      );
    }
  },

  ContentRoot: class extends React.Component
  {
    render()
    {
      if (this.props.bad_code)
      {
        return (
          <div className="alert alert-danger" role="alert">
            <div className="jumbotron">
              <h1 className="display-4">There... Might be an issue with this... pile of steaming code</h1>
              <p className="lead">Call your nearest programmer, fire an issue, this site is not working.</p>
              <hr className="my-4" />
              <p>Read the console for more information...</p>
              <p>Once fixed, click this button:</p>
              <ReactBootstrap.Button variant="danger" onClick={reload_js_files} className="btn-block"><i className="fas fa-sync"></i> Reload Scripts</ReactBootstrap.Button>
            </div>
          </div>
        );
      }

      return (
        <div>
          <App.Content.TextStudy />
        </div>
      );
    }
  }
};

// Load the remaining scripts:
load_js_file('content.js');

// Run the app
window.refresh_app = function()
{
  try
  {
    ReactDOM.render(<App.Root />, document.getElementById('root'));
  }
  catch (e)
  {
    console.error('application failed with: ', e);
    ReactDOM.render(<App.Root bad_code/>, document.getElementById('root'));
  }
};
refresh_app();



