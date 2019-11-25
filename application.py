import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room , leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

USERS = {} #this will be a dictionary of the following pairs :::: {username : socket_id}
ROOMS = {} #this dictionary will be the following pairs :::: {Room_id : [members in the room]}

@app.route("/")#we will make the url extension have the random hex number
def index():
    return render_template('index.html')

@socketio.on('userdata')
def user_data(data):
    #the userdata that will come in will be username and room_id
    if 'username' in data:
        username = data['username']
        USERS[username] = request.sid #request socket ID
        emit('new user', data, broadcast=True)

@socketio.on('new action')
def new_action(data):
    emit('new paint', data, broadcast=True)

@socketio.on('clear canvas')
def clear_canvas():
    emit('clear canvas', broadcast=True)

@socketio.on('get users')
def get_users():
    emit('users', list(USERS.keys()))

@socketio.on('undo')
def undo():
    emit('undo', broadcast=True)



if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)) , debug = True)
