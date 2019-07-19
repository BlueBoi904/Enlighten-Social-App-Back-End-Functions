import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import jwtDecode from 'jwt-decode';
//Components
import Navbar from './components/NavBar';
import AuthRoute from './util/AuthRoute'

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
});
let authenticated;
const token = localStorage.FBIdToken;
if (token){
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()){
    window.location.href = '/login';
    authenticated = false;
  } else {
    authenticated = true;
  }
}

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
      <Router>
      <Navbar />
      <div className='container'>
      
      <Switch>
        <Route exact path ='/' component={home}/>
        <AuthRoute exact path ='/login' component={login}  authenticated = {authenticated}/>
        <AuthRoute exact path ='/signup' component={signup} authenticated = {authenticated}/>
      </Switch>
      </div>
      </Router>
    </div>
    </MuiThemeProvider>
  );
}

export default App;
