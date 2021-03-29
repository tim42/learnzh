
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
              <ReactBootstrap.Button variant="outline-info" onClick={reload_js_files}><i className="fas fa-sync"></i> Reload Scripts</ReactBootstrap.Button>
            </ReactBootstrap.Form>
          </ReactBootstrap.Navbar>
          <div className="content">
          { has_loads_in_progress() ? (<h3>LOADING...</h3>) : (<App.ContentRoot />) }
          </div>
        </div>
      );
    }
  },

  ContentRoot: class extends React.Component
  {
    render()
    {
      try{
        return (
          <div>
            <App.Content.TextStudy />
          </div>
        );
      }
      catch(e)
      {
        console.error(e);
        return (
          <div>
            <b>FAIL :(</b>
          </div>
        );
      }
    }
  }
};

// Load the remaining scripts:
load_js_file('content.js');

// Run the app
window.refresh_app = function()
{
  ReactDOM.render(<App.Root />, document.getElementById('root'));
};
refresh_app();



