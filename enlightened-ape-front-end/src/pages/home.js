import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import Whisper from '../components/Whisper'
class home extends Component {
    state = {
        whispers: null
    }

    componentDidMount(){
        axios.get('/whispers')
          .then(res => {
              console.log(res.data);
            this.setState({
                whispers: res.data
            })
          })
          .catch(err => console.log(err));
    }
    
    render() {
        const {whispers} = this.state;

        let recentWhispersMarkup = whispers ? (
            whispers.map(whisper => <Whisper key={whisper.whisperId} whisper={whisper} />)
        ) : <p>Loading...</p>
        return (
            <Grid container spacing={10}>
                <Grid item sm={8} xs={12}>
                    {recentWhispersMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <p>Profile...</p>
                </Grid>
            </Grid>
        )
    }
}

export default home;
