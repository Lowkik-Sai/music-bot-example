
const fs = require('fs'); 
const readline = require('readline'); 
const {google} = require('googleapis'); 
const OAuth2Client = google.auth.OAuth2; 
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = './credentials.json';
const spreadsheetId = '1FS9OGmrB4LJXprzwUbW9vivpygIgv7QJoVLi73c92CA';

try {   
    const content = fs.readFileSync('client_secret.json');   
    authorize(JSON.parse(content), listEvents); 
} catch (err) {   
    return console.log('Error loading client secret file:', err); 
}

function authorize(credentials, callback) {   
    const {client_secret, client_id, redirect_uris} = credentials.installed;   
    let token = {};   
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.   
    try {
        token = fs.readFileSync(TOKEN_PATH);   
    } catch (err) {
        return getAccessToken(oAuth2Client, callback);   
    }   
    oAuth2Client.setCredentials(JSON.parse(token));   
    callback(oAuth2Client); 
}

function getAccessToken(oAuth2Client, callback) {   
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,   
    });   
    console.log('Authorize this app by visiting this url:', authUrl);   
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,   
    });   
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return callback(err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            try {
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
            } catch (err) {
                console.error(err);
            }
        callback(oAuth2Client);
        });   
    }); 
}

function listEvents(auth) {   
    const calendar = google.calendar({version: 'v3', auth});   
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',   }, (err, {data}) => {
            if (err) return console.log('The API returned an error: ' + err);
            const events = data.items;
            if (events.length) {
                console.log('Upcoming 10 events:');
                events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
          console.log('No upcoming events found.');
        }   
}); 
}

Any ideas?

share edit follow
asked
May 10 '18 at 20:37



module.exports.authorizeScoreChange = function authorizeScoreChange(credentials, callback, val1, val2) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, val1, val2);
  });
}

module.exports.authorizeMemberChange = function authorizeMemberChange(credentials, callback, val1) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, val1);
  });
}
