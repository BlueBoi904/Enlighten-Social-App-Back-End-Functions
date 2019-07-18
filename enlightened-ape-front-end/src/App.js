import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
//Components
import Navbar from './components/NavBar';

// Pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

// Create Material UI theme
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#33c9dc',
      main: '#00bcd4',
      dark: '#b22a00',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff6333',
      main: '#ff3d00',
      dark: '#b22a00',
      contrastText: '#fff'
    }
  },
  typography: {
    userNextVariants: true
  }
})

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
      <Router>
      <Navbar />
      <div className='container'>
      
      <Switch>
        <Route exact path ='/' component={home}/>
        <Route exact path ='/login' component={login}/>
        <Route exact path ='/signup' component={signup}/>
      </Switch>
      </div>
      </Router>
    </div>
    </MuiThemeProvider>
  );
}

export default App;
