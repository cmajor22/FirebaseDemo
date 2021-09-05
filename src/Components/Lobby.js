import React, { useContext } from 'react';
import {
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire';
import { Grid, Card, Avatar, Typography, Button, Container } from '@material-ui/core';

const LobbyContext = React.createContext();

const classes = {
    lobbyCard: {
        margin: '2px',
        padding: '5px'
    },
    actions: {
        marginTop: '15px',
        display: 'flex',
        flex: 'flex-end'
    },
}

export function LobbyProvider(props) {
  const { email, displayName, uid, photoURL } = useUser();
  const lobbyCollection = useFirestore().collection('lobby');
  const lobby = useFirestoreCollectionData(lobbyCollection);

  const userInLobby = lobby.find(m => m.email === email);

  const joinLobby = async () => {
    await lobbyCollection.doc(uid).set({ email, displayName, photoURL, ready: false });
  };

  const leaveLobby = async () => {
    await lobbyCollection.doc(uid).delete();
  };

  const toggleReadiness = async newReadiness => {
    await lobbyCollection.doc(uid).set({ ready: newReadiness }, { merge: true });
  };

  return (
    <LobbyContext.Provider value={{ userInLobby, lobby, joinLobby, leaveLobby, toggleReadiness }}>
        {props.children}
    </LobbyContext.Provider>
  );
}

export function LobbyActions() {
  const { userInLobby, joinLobby, leaveLobby, toggleReadiness } = useContext(LobbyContext);
  const components = [];

  if (userInLobby) {
    components.push(
        <Button key='readyButton'  color="secondary"
            onClick={() => toggleReadiness(!userInLobby.ready)} style={userInLobby.ready ? classes.notReadyButton : classes.readyButton}>
          {userInLobby.ready ? 'Not Ready!' : 'Ready!'}
        </Button>
    );
    components.push(
        <Button onClick={leaveLobby} style={classes.leaveButton} color="secondary">
            Leave
        </Button>
    );
  } else {
    components.push(
        <Button onClick={joinLobby} color="secondary">
          Join
        </Button>
    );
  }

  return (
    <Container style={classes.actions}>
        <Grid container direction="row" justifyContent="flex-end">
            {components}
        </Grid>
    </Container>
  );
}

export function Lobby() {
  const { lobby } = useContext(LobbyContext);

  return (
    <Container>
        <Typography variant="h3">Lobby</Typography>
      {lobby.map(m => {
        return (
          <Card key={m.email} style={classes.lobbyCard}>
            <Grid container alignItems="center">
              <Grid xs={2}>
                  {m.photoURL ? 
                    <Avatar src={m.photoURL}></Avatar>
                  :
                    <Avatar>{m.displayName.split(' ').map((item) => {return item.charAt(0)})}</Avatar>
                  }
              </Grid>
              <Grid xs={9}>
                <Typography>{m.displayName}</Typography>
              </Grid>
              <Grid xs={1}>
                <Typography>{m.ready ? '🎮' : '❌'}</Typography>
              </Grid>
            </Grid>
          </Card>
        );
      })}
    </Container>
  );
}