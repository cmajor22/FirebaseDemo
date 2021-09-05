import React, { useRef, useState } from 'react';
import {
  useAuth,
  useFirestore,
} from 'reactfire';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase';
import { Avatar, Button, Container, Grid, TextField, Typography } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

const classes = {
    messageText: {
        marginLeft: '10px'
    },
    chatWindow: {
        height: '75vh',
        overflow: 'auto',
        paddingBottom: '10px'
    },
    sent: {
        borderRadius: '20px',
        backgroundColor: '#f1f1f1',
        marginTop: '5px'
    },
    received: {
        borderRadius: '20px',
        backgroundColor: '#e1e1e1',
        marginTop: '5px'
    },
    chatText: {
        width: '100%'
    },
    chatButton: {
        width: '100%',
        height: '100%'
    }
}

export function ChatRoom() {
    // Chat portion of the app

    const chatWindow = useRef();
    const auth = useAuth();
    const messagesRef = useFirestore().collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');
  
    const sendMessage = async (e) => {
        // Handle chat submission
        e.preventDefault();
        const { uid, photoURL, displayName } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            displayName,
            photoURL
        });

        setFormValue('');
        scrollToBottom();
    }

    const scrollToBottom = () => {
        //Scroll to bottom of chat window
        chatWindow.current.scrollTop = chatWindow.current.scrollHeight;
    }
    
    // Chat title, container, actions UI
    return (<div>
        <Container>
            <Typography variant="h3">Chat</Typography>
        </Container>

        <Container style={classes.chatWindow} ref={chatWindow}>
            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </Container>
    
        <Container>
            <form onSubmit={sendMessage}>
                <Grid container>
                    <Grid item xs="11">
                        <TextField
                            value={formValue}
                            label="Chat Text"
                            multiline
                            rows={2}
                            defaultValue=""
                            variant="filled"
                            onChange={(e) => setFormValue(e.target.value)}
                            style={classes.chatText}
                        />
                    </Grid>
                    <Grid item xs="1">
                        <Button type="submit" style={classes.chatButton} disabled={!formValue} color="secondary"><SendIcon /></Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    </div>)
  }
  
  
  function ChatMessage(props) {
    // UI for chat messages
    const auth = useAuth();
    const { text, uid, photoURL, displayName } = props.message;

    const messageClass = uid === auth.currentUser.uid ? classes.sent : classes.received;

    return (<>
        <Grid container direction="row" alignItems="center" style={messageClass}>
            {/* If photo not available, show initials */}
            {photoURL ? 
            <Avatar src={photoURL} />
            :
            <Avatar>{displayName.split(' ').map((item) => {return item.charAt(0)})}</Avatar>
            }
            <Typography style={classes.messageText}>{text}</Typography>
        </Grid>
    </>)
  }