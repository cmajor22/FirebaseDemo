import firebase from 'firebase';
import React from 'react';
import { createRoot } from 'react-dom';
import {
  AuthCheck,
  FirebaseAppProvider,
  SuspenseWithPerf,
  useAuth,
  useUser,
} from 'reactfire';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Button, Grid, Avatar, Container } from '@material-ui/core';
import { Lobby, LobbyProvider, LobbyActions } from './Components/Lobby';
import { ChatRoom } from './Components/Chat';
import { firebaseConfig } from './FirebaseConfig';

function AuthenticationButtons() {
  const auth = useAuth();
  const { displayName, photoURL } = useUser();
  const signIn = async () => {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };
  const signOut = async () => {
    await auth.signOut();
  };
  // When authenticated, show the Sign out button, else Sign in
  return (
    <AuthCheck
      fallback={
        <Button color="secondary" variant="contained" onClick={signIn}>
          Sign In
        </Button>
      }
    >
      <Button color="secondary" variant="contained" onClick={signOut}>
        Sign Out
      </Button>
      <Button disabled>
          {/* Display user photo, if the photo url isn't defined, substitute the first character of their name */}
        {photoURL ? 
          <Avatar src={photoURL}></Avatar>
          :
          <Avatar>{displayName.split(' ').map((item) => {return item.charAt(0)})}</Avatar>
        }
      </Button>
    </AuthCheck>
  );
}

function Navbar() {
  // App nav bar
  return (
    <AppBar position="static" style={{marginBottom: '10px'}}>
      <Toolbar>
        <Typography variant="h6" style={{flexGrow: 1}}>
          Firebase Demo
        </Typography>
        <AuthenticationButtons />
      </Toolbar>
    </AppBar>
  );
}

function App() {
  // Main app content

  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <SuspenseWithPerf fallback={<p>Loading...</p>} traceId={'loading-app-status'}>
        <Navbar />
        <AuthCheck fallback={<Container><Typography>Please sign in to view content</Typography></Container>}>
          <Grid container>
            <Grid item xs={12} sm={12} md={8} lg={9}>
              <ChatRoom></ChatRoom>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={3}>
              <LobbyProvider>
                <Lobby></Lobby>
                <LobbyActions />
              </LobbyProvider>
            </Grid>
          </Grid>
        </AuthCheck>
      </SuspenseWithPerf>
    </FirebaseAppProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);